"use strict";
const getConfig = require("../lib/getConfig");
const getHost = require("../lib/getHost");
const getToken = require("../lib/getToken");
const sendCounters = require("../lib/sendCounters");
const { is, func } = require("../lib/utils");
const sleep = require('util').promisify(setTimeout);

module.exports = function (RED) {

    function Ecvida_Send(config) {
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

            async function make_action() {

                cleanStatus();
                let news = msg.payload;
                msg.payload = "Что-то пошло не так...";

                if (typeof news === "object") {

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

                        msg.payload = await sendCounters({ news, ...defGetParams });
                    }
                } else {
                    msg.payload = "Wrong input JSON format";
                }
                node.send(msg);
                await sleep(500);
                cleanStatus();

            };////////////// end of acync

            make_action().then();

        }); //// end node

    };

    RED.nodes.registerType("ecvida-send", Ecvida_Send);
};;
