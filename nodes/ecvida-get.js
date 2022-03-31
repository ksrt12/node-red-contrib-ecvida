const getCookies = require("../lib/getCookies");
const getCounters = require("../lib/getCounters");
const getHTML = require("../lib/getHTML");
const sleep = require('util').promisify(setTimeout);

const { is, formatNumber, func } = require("../lib/utils");

module.exports = function (RED) {

    function Ecvida_Get(config) {
        RED.nodes.createNode(this, config);

        this.login = config.login;
        this.login_node = RED.nodes.getNode(this.login);

        let username = this.login_node.username;
        let password = this.login_node.password;
        let cookies = this.login_node.cookies;
        let is_debug = this.login_node.debug;
        let command = config.command_type;
        let calendar = config.calendar;

        let node = this;

        // Define local functions
        const Debug_Log = msg_text => func.Debug_Log(node, msg_text);
        const SetStatus = (color, shape, topic, status) => func.SetStatus(node, is_debug, color, shape, topic, status);
        const SetError = (topic, status) => func.SetError(node, is_debug, topic, status);
        const cleanStatus = () => func.CleanStatus(node);

        node.on('input', function (msg) {

            let payload = msg.payload;
            if (command === "payload") {
                if (typeof payload === "object") {
                    ({ command, calendar } = payload);
                } else {
                    SetError("Input", "Bad JSON");
                    return;
                }
            }

            switch (command) {
                case "accruals":
                case "payments":
                case "counters":
                    break;
            }


            async function make_action() {

                cleanStatus();

                if (!is(cookies, 700)) {
                    cookies = await getCookies(username, password, SetStatus, SetError, Debug_Log);
                }

                if (is(cookies, 700)) {

                    let topic = "Get " + command;
                    SetStatus("blue", "ring", topic, "begin");
                    let out;
                    if (command === "counters") {

                        let { counters } = await getCounters(topic, cookies, SetError, calendar);
                        if (counters) {
                            out = counters;
                        }
                    } else {
                        let document = await getHTML("https://lkabinet.online/accruals", topic, cookies, SetError);

                        if (document) {
                            let month = document.querySelector("#placeForShowAccrual > div.page_title.accrualTitle > h2").textContent;
                            let sum = formatNumber(document.querySelector("#accrualPage > div.payment_right > div.accruals_total.accrualTotal > div.accr_head > div > div.prise").textContent);
                            let balance_div = document.querySelector("body > header > div.col.object.lBlock.mobile_flat_selector > div.objects_list > a > div.row > * > div.flatBalance");

                            out = {
                                accular: {
                                    month,
                                    sum
                                },
                                balance: {
                                    status: balance_div.classList.contains("balance_green") ? "Переплата" : "Долг",
                                    sum: formatNumber(balance_div.textContent)
                                }
                            };
                        }
                    }

                    if (out) {
                        SetStatus("blue", "dot", topic, "ok");
                        msg.payload = out;
                        node.send(msg);
                        await sleep(500);
                        cleanStatus();
                    }
                }

            };////////////// end of acync

            make_action().then();

        }); //// end node

    };

    RED.nodes.registerType("ecvida-get", Ecvida_Get);
};;
