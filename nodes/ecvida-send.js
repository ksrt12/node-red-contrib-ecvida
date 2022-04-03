"use strict";

const initCheck = require("../lib/initCheck");
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

                    let defGetParams = await initCheck(uk, token, flatId, username, password, defFunctions);

                    if (is(defGetParams.flatId)) {
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
