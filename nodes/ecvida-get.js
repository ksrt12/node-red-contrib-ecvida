"use strict";

const getAccruals = require("../lib/getAccruals");
const getConfig = require("../lib/getConfig");
const getCounters = require("../lib/getCounters");
const getHost = require("../lib/getHost");
const getPayments = require("../lib/getPayments");
const getToken = require("../lib/getToken");
const sleep = require('util').promisify(setTimeout);

const { is, func } = require("../lib/utils");

module.exports = function (RED) {

    function Ecvida_Get(config) {
        RED.nodes.createNode(this, config);

        this.login = config.login;
        this.login_node = RED.nodes.getNode(this.login);

        /** @type {string} */
        let username = this.login_node.username;
        /** @type {string} */
        let password = this.login_node.password;
        /** @type {string} */
        let uk = this.login_node.uk;
        /** @type {string} */
        let token = this.login_node.token;
        /** @type {string} */
        let flatId = this.login_node.flatId;
        /** @type {boolean} */
        let is_debug = this.login_node.debug;
        /** @type {string} */
        let command = config.command_type;
        /** @type {string} */
        let date = config.calendar;
        /** @type {boolean} */
        let lastMonth = config.lastMonth;

        let node = this;

        // Define local functions
        /** @param {string} msg_text Message text */
        const Debug_Log = msg_text => func.Debug_Log(node, msg_text);
        const SetStatus = (color, shape, topic, status) => func.SetStatus(node, is_debug, color, shape, topic, status);
        const SetError = (topic, status) => func.SetError(node, is_debug, topic, status);
        /**
         * @param {Function} Debug_Log Send to debug log
         * @param {Function} SetStatus Set node status
         * @param {Function} SetError Set node error status
         */
        const defFunctions = { Debug_Log, SetStatus, SetError };
        const cleanStatus = () => func.CleanStatus(node);

        node.on('input', function (msg) {

            let payload = msg.payload;
            if (command === "payload") {
                if (typeof payload === "object") {
                    ({ command, date } = payload);
                } else {
                    SetError("Input", "Bad JSON");
                    return;
                }
            }

            async function make_action() {

                cleanStatus();

                const host = getHost(uk);
                let validFlatId = "";
                let defHeaders = {
                    "Version": 4,
                    "OS": "Android",
                    "bundleID": (uk === "pro.wellsoft.smartzhk") ? uk : "com.wellsoft." + uk,
                    "device": "xiaomi mido",
                    "OSdata": "Android 24",
                    "User-Agent": "okhttp/4.9.0",
                };

                if (!is(token, 30)) {
                    token = await getToken({ username, password, defHeaders, host, ...defFunctions });
                }

                /**
                 * @param {string} flatId Flat ID
                 * @param {string} host Host
                 * @param {object} defHeaders {@link defHeaders}
                 * @param {object} defFuctions {@link defFunctions}
                 */
                let defGetParams = {};
                if (is(token, 30)) {
                    defHeaders["Authorization"] = "Bearer " + token;
                    defHeaders["Content-Type"] = "application/json; charset=utf-8";
                    defGetParams = { flatId, host, defHeaders, ...defFunctions };
                    validFlatId = await getConfig(defGetParams);
                }

                if (is(validFlatId)) {

                    let topic = "Get " + command;
                    SetStatus("blue", "ring", topic, "begin");
                    let out;

                    switch (command) {
                        case "accruals":
                            out ??= await getAccruals({ ...defGetParams, date, lastMonth });
                            break;
                        case "payments":
                            out ??= await getPayments({ ...defGetParams, date, lastMonth });
                            break;
                        case "counters":
                            // let { counters } = await getCounters({ ...defVars });
                            out ??= await getCounters(defGetParams);
                            break;
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
