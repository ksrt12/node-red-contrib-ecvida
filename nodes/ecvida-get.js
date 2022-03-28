const fetch = require("node-fetch");
const sleep = require('util').promisify(setTimeout);
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = function (RED) {

    function Ecvida_Get(config) {
        RED.nodes.createNode(this, config);

        this.login = config.login;
        this.login_node = RED.nodes.getNode(this.login);
        this.command_type = config.command_type;

        this.username = this.login_node.username;
        this.password = this.login_node.password;
        this.cookies = this.login_node.cookies;
        this.is_debug = this.login_node.debug;

        let node = this;

        node.on('input', function (msg) {

            let username = node.username;
            let password = node.password;
            let cookies = node.cookies;
            let command = node.command_type;
            let is_debug = node.is_debug;

            const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36";

            const Debug_Log = msg_text => {
                node.log(msg_text);
                node.send({ payload: msg_text });
            };

            const setStatus = (color, shape, topic, status) => {
                node.status({ fill: color, shape: shape, text: topic });
                if (is_debug) Debug_Log(topic + ": " + status);
            };

            const SetError = (topic, status) => {
                setStatus("red", "dot", topic, "fail: " + status);
                node.send(status);
                return;
            };

            const formatNumber = str => parseFloat(str.replace(',', '.').replace(new RegExp(/\s/, 'g'), ''));

            const cleanStatus = () => node.status({});

            async function make_action() {

                cleanStatus();

                let is_error = false;
                let is_cookies = cookies.length > 700;

                if (!is_cookies) {

                    const addCookies = res => {
                        let raw = res.headers.raw()['set-cookie'];
                        if (raw) {
                            raw.forEach(tmp => {
                                let tmp_cookie = tmp.substring(0, tmp.indexOf('; ')) + ";";
                                if (tmp_cookie.length > 200) {
                                    cookies += tmp_cookie;
                                }
                            });
                            is_cookies = true;
                        } else {
                            is_cookies = false;
                            throw "Invalid login/password";
                        }
                    };

                    setStatus("blue", "ring", "Get cookies", "ASPXAUTH");
                    await fetch("https://lkabinet.online/login/enterPassword?emailOrPhone=" + username + "&accountType=",
                        {
                            method: "POST",
                            body: "EmailOrPhone=" + username + "&Password=" + encodeURIComponent(password),
                            headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded' },
                            redirect: 'manual'
                        })
                        .then(addCookies)
                        .catch(err => SetError("Get cookies: ASPXAUTH", err));

                    if (is_cookies) {

                        setStatus("green", "ring", "Get cookies", "ASPXROLES");
                        await fetch("https://lkabinet.online/",
                            {
                                method: "GET",
                                headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded', 'cookie': cookies },
                                redirect: 'manual'
                            })
                            .then(addCookies)
                            .catch(err => SetError("Get cookies: ASPXROLES", err));

                        if (cookies.length > 700) {
                            setStatus("blue", "dot", "Get cookies", "OK");
                            Debug_Log("Copy cookies to ecvida-login node:");
                            Debug_Log(cookies);
                            is_cookies = true;
                        }
                    }
                }

                if (is_cookies) {

                    let topic = "Get " + command;
                    const fetchGet = async url => {

                        let out;
                        setStatus("blue", "ring", topic, "begin");
                        await fetch(url,
                            {
                                method: "GET",
                                headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded', 'cookie': cookies },
                                redirect: 'manual'
                            })
                            .then(res => res.text())
                            .then(text => {
                                let { document } = (new JSDOM(text)).window;
                                out = document;
                            })
                            .catch(err => SetError("Get " + command, err));
                        return out;
                    };

                    let out;
                    if (command === "counters") {

                        let counters = {};
                        let curr_date = new Date();
                        let curr_date_str = `01.${curr_date.getMonth()}.${curr_date.getFullYear()}`;

                        let document = await fetchGet("https://lkabinet.online/Counters/GetValues?DayToString=" + curr_date_str);
                        let all = document.querySelectorAll("body > form > div.indications_list > div");

                        for (let counter of all) {
                            let id = counter.getAttribute("data-id");
                            let content = counter.querySelector("div.content");
                            let title = content.querySelector("div.title").textContent;
                            let vals = [];
                            content.querySelectorAll("div.cells_cover > div.cell").forEach(cell => {
                                vals.push(formatNumber(cell.querySelector("span").textContent));
                            });
                            counters[id] = vals;
                        }

                        out = counters;
                    } else {
                        let document = await fetchGet("https://lkabinet.online/accruals");

                        let month = document.querySelector("#placeForShowAccrual > div.page_title.accrualTitle > h2").textContent;
                        let sum = formatNumber(document.querySelector("#accrualPage > div.payment_right > div.accruals_total.accrualTotal > div.accr_head > div > div.prise").textContent);
                        let balance_div = document.querySelector("body > header > div.row.header_container > * div.selectedBalance > div.flatBalance");

                        out = {
                            accular: {
                                month,
                                sum
                            },
                            balance: {
                                status: balance_div.classList.contains("balance_green") ? "Переплата" : "Долг",
                                balance: formatNumber(balance_div.querySelector("span.flat_balance_sum").textContent)
                            }
                        };
                    }
                    setStatus("blue", "dot", topic, "ok");

                    msg.payload = out;
                    node.send(msg);
                    await sleep(500);
                    cleanStatus();
                }

            };////////////// end of acync

            make_action().then();

        }); //// end node

    };

    RED.nodes.registerType("ecvida-get", Ecvida_Get);
};;
