"use strict";

const initCheck = require("../utils/initCheck");
const getConfig = require("../utils/getConfig");
const getAccruals = require("../utils/getAccruals");
const getCounters = require("../utils/getCounters");
const getPayments = require("../utils/getPayments");
const { func } = require("../utils/common");
const sleep = require('util').promisify(setTimeout);

module.exports = function (/** @type {RED} */ RED) {

    function Ecvida_Get(/** @type {NodeConfig} */ config) {
        RED.nodes.createNode(this, config);

        /** @type {string} */
        this.login = config.login;
        /** @type {RedNode} */
        this.login_node = RED.nodes.getNode(this.login);

        /** @type {GetNodeConfig} */
        let { is_debug, command_type: command, calendar: date, lastMonth, showArchive } = config;

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

            let payload = msg.payload;
            if (command === "payload") {
                if (typeof payload === "object") {
                    ({ command, date, lastMonth, showArchive } = payload);
                } else {
                    SetError("Input", "Bad JSON");
                    return;
                }
            }

            async function make_action() {

                cleanStatus();

                let defGetParams = await initCheck({ RED, id: node.login, defFunctions });

                if (defGetParams && defGetParams.flatId) {

                    let topic = "Get " + command;
                    SetStatus("blue", "ring", topic, "begin");
                    /** @type {flatObj | accruals | payments | counters | undefined | null} */
                    let out;

                    defGetParams = { ...defGetParams, topic, date, lastMonth };

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
                            out ??= await getCounters({ showArchive, ...defGetParams });
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
