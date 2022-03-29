const getCookies = require("../lib/getCookies");
const getHTML = require("../lib/getHTML");
const sleep = require('util').promisify(setTimeout);

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
            };

            const formatNumber = str => parseFloat(str.replace(',', '.').replace(new RegExp(/\s/, 'g'), ''));
            const is = (str, length = 1) => (str && str.length > length);
            const cleanStatus = () => node.status({});

            async function make_action() {

                cleanStatus();

                if (!is(cookies, 700)) {
                    cookies = await getCookies(username, password, setStatus, SetError, Debug_Log);
                }

                if (is(cookies, 700)) {

                    let topic = "Get " + command;
                    setStatus("blue", "ring", topic, "begin");
                    let out;
                    if (command === "counters") {

                        let counters = {};
                        let curr_date = new Date();
                        let curr_date_str = `01.${curr_date.getMonth()}.${curr_date.getFullYear()}`;

                        let document = await getHTML("https://lkabinet.online/Counters/GetValues?DayToString=" + curr_date_str, topic, cookies, SetError);
                        let all = document.querySelectorAll("body > form > div.indications_list > div");

                        for (let counter of all) {
                            let id = counter.getAttribute("data-id");
                            let content = counter.querySelector("div.content");
                            let title = content.querySelector("div.title").textContent;
                            let serial = counter.querySelector("div.serial").textContent.slice(16);
                            let vals = [];
                            content.querySelectorAll("div.cells_cover > div.cell").forEach(cell => {
                                vals.push(formatNumber(cell.querySelector("span").textContent));
                            });
                            counters[id] = vals;
                        }

                        out = counters;
                    } else {
                        let document = await getHTML("https://lkabinet.online/accruals", topic, cookies, SetError);

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
