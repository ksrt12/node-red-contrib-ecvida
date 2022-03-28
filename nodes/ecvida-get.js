const fetch = require("node-fetch");
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
            let is_debug = node.is_debug;

            const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36";

            const Debug_Log = msg_text => {
                node.log(msg_text);
                node.send({ payload: msg_text });
            };

            const setStatus = (color, shape, topic, status) => {
                node.status({
                    fill: color,
                    shape: shape,
                    text: topic
                });
                if (is_debug) Debug_Log(topic + ": " + status);
            };

            const SetError = (topic, status) => {
                setStatus("red", "dot", topic, "fail: " + status);
                node.send(status);
                return;
            };

            node.status({}); //clean

            async function make_action() {

                let is_cookies = cookies.length > 10;

                if (!is_cookies) {

                    const addCookies = res => res.headers.raw()['set-cookie'].forEach(tmp => {
                        let tmp_cookie = tmp.substring(0, tmp.indexOf('; ')) + ";";
                        if (tmp_cookie.length > 10) {
                            cookies += tmp_cookie;
                        }
                    });

                    setStatus("blue", "ring", "Get cookies", "ASPXAUTH");
                    await fetch("https://lkabinet.online/login/enterPassword?emailOrPhone=" + username + "&accountType=",
                        {
                            method: "POST",
                            body: "EmailOrPhone=" + username + "&Password=" + encodeURIComponent(password),
                            headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded' },
                            redirect: 'manual'
                        })
                        .catch(err => SetError("Get cookies: ASPXAUTH", err))
                        .then(addCookies);

                    setStatus("blue", "ring", "Get cookies", "ASPXROLES");
                    await fetch("https://lkabinet.online/",
                        {
                            method: "GET",
                            headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded', 'cookie': cookies },
                            redirect: 'manual'
                        })
                        .catch(err => SetError("Get cookies: ASPXROLES", err))
                        .then(addCookies);

                    if (cookies.length > 40) {
                        setStatus("blue", "dot", "Get cookies", "OK");
                        Debug_Log("Copy cookies to ecvida-login node:");
                        Debug_Log(cookies);
                        is_cookies = true;
                    }

                    node.status({});
                }

                let COUNTERS = {};
                let curr_date = new Date();
                let curr_date_str = `01.${curr_date.getMonth()}.${curr_date.getFullYear()}`;

                await fetch("https://lkabinet.online/Counters/GetValues?DayToString=" + curr_date_str,
                    {
                        method: "GET",
                        headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded', 'cookie': cookies },
                        redirect: 'manual'
                    })
                    .catch(err => SetError("Get counters", err))
                    .then(res => res.text())
                    .then(text => {
                        let { document } = (new JSDOM(text)).window;
                        let all = document.querySelectorAll("body > form > div.indications_list > div");


                        for (let counter of all) {
                            let id = counter.getAttribute("data-id");
                            let content = counter.querySelector("div.content");
                            let title = content.querySelector("div.title").textContent;
                            let vals = [];
                            content.querySelectorAll("div.cells_cover > div.cell").forEach(cell => {
                                vals.push(parseFloat(cell.querySelector("span").textContent
                                    .replace(',', '.')
                                    .replace(new RegExp(/\s/, 'g'), '')));
                            });
                            COUNTERS[id] = vals;
                        }


                    });

                Debug_Log(COUNTERS);

            }////////////// end of acync

            make_action().then();

        }); //// end node

    };

    RED.nodes.registerType("ecvida-get", Ecvida_Get);
};;
