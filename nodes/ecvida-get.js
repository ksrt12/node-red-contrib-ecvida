"use strict";

const initCheck = require("../utils/initCheck");
const getEcvida = require("../utils/getEcvida");
const { DefFunc } = require("../utils/classes");
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
        const defFunctions = new DefFunc(node, is_debug);
        const { SetStatus, SetError, cleanStatus } = defFunctions;

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
                    defGetParams = { ...defGetParams, topic, date, lastMonth };

                    /** @type {flatObj | accruals | payments | counters | undefined | null} */
                    let out = await getEcvida[command](defGetParams, showArchive);

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
