"use strict";

const initCheck = require("../utils/initCheck");
const sendCounters = require("../utils/sendCounters");
const { DefFunc } = require("../utils/classes");
const sleep = require('util').promisify(setTimeout);

module.exports = function (/** @type {RED} */ RED) {

    function Ecvida_Send(/** @type {NodeConfig} */ config) {
        RED.nodes.createNode(this, config);

        /** @type {string} */
        this.login = config.login;
        /** @type {RedNode} */
        this.login_node = RED.nodes.getNode(this.login);

        /** @type {boolean} */
        let is_debug = this.login_node.is_debug;

        /** @type {RedNode} */
        let node = this;

        // Define local functions
        const defFunctions = new DefFunc(node, is_debug);
        const { cleanStatus } = defFunctions;

        node.on('input', function (msg) {

            async function make_action() {

                cleanStatus();
                /** @type {news} */
                let news = msg.payload;
                msg.payload = "Что-то пошло не так...";

                if (typeof news === "object") {

                    let defGetParams = await initCheck({ RED, id: node.login, defFunctions });

                    if (defGetParams && defGetParams.flatId) {
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
};
