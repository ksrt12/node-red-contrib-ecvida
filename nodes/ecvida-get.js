"use strict";

const initCheck = require("../lib/initCheck");
const getConfig = require("../lib/getConfig");
const getAccruals = require("../lib/getAccruals");
const getCounters = require("../lib/getCounters");
const getPayments = require("../lib/getPayments");
const { func } = require("../lib/utils");
const sleep = require('util').promisify(setTimeout);

module.exports = function (/** @type {RED} */ RED) {

    function Ecvida_Get(/** @type {NodeConfig} */ config) {
        RED.nodes.createNode(this, config);

        /** @type {string} */
        this.login = config.login;
        /** @type {RedNode} */
        this.login_node = RED.nodes.getNode(this.login);

        /** @type {string} */
        let username = this.login_node.username;
        /** @type {string} */
        let password = this.login_node.password;
        /** @type {string} */
        let uk = this.login_node.uk;
        /** @type {string} */
        let token = this.login_node.token;
        /** @type {number} */
        let flatId = Number(this.login_node.flatId);
        /** @type {boolean} */
        let is_debug = this.login_node.is_debug;
        /** @type {string} */
        let command = config.command_type;
        /** @type {string} */
        let date = config.calendar;
        /** @type {boolean} */
        let lastMonth = config.lastMonth;

        /** @type {RedNode} */
        let node = this;

        // Define local functions
        /** @type {FuncLog} */
        const Debug_Log = msg_text => func.Debug_Log(node, msg_text);
        /** @type {FuncSetStatus} */
        const SetStatus = (color, shape, topic, status) => func.SetStatus(node, is_debug, color, shape, topic, status);
        /** @type {FuncSetError} */
        const SetError = (topic, status) => func.SetError(node, is_debug, topic, status);
        /** @type {defFunc} */
        const defFunctions = { Debug_Log, SetStatus, SetError };
        /** @type {FuncClean} */
        const cleanStatus = () => func.CleanStatus(node);

        node.on('input', function (msg) {

            const should_update = func.CheckContext(node, { flatId, token });

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

                let defGetParams = await initCheck({ should_update, uk, token, flatId, username, password, defFunctions });

                if (defGetParams && defGetParams.flatId) {

                    let topic = "Get " + command;
                    SetStatus("blue", "ring", topic, "begin");
                    /** @type {flatObj | accruals | payments | counters | undefined | null} */
                    let out;

                    defGetParams.topic = topic;
                    defGetParams.date = date;
                    defGetParams.lastMonth = lastMonth;

                    switch (command) {
                        case "balance":
                            /** @type {flatObj} */
                            out ??= await getConfig({ isBalance: true, ...defGetParams });
                            break;
                        case "accruals":
                            /** @type {accruals} */
                            out ??= await getAccruals(defGetParams);
                            break;
                        case "payments":
                            /** @type {payments} */
                            out ??= await getPayments(defGetParams);
                            break;
                        case "counters":
                            /** @type {counters} */
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
};
