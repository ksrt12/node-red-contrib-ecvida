"use strict";

module.exports = function (/** @type {RED} */ RED) {

    function Ecvida_Config_Node(/** @type {NodeConfig} */ config) {
        RED.nodes.createNode(this, config);
        this.closing = false;
        /** @type {RedNode} */
        let node = this;

        node.on("close", function (done) {
            node.closing = true;
            done();
        });
    }
    RED.nodes.registerType('ecvida-login', Ecvida_Config_Node, {
        credentials: {
            uk: { type: "text" },
            username: { type: "text" },
            password: { type: "password" },
            token: { type: "password" },
            flatId: { type: "text" }
        }
    });
};

