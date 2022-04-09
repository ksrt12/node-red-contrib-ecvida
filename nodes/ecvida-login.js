"use strict";

module.exports = function (/** @type {RED} */ RED) {

    function Ecvida_Config_Node(/** @type {NodeConfig} */ config) {
        RED.nodes.createNode(this, config);

        this.uk = config.uk;
        this.flatId = config.flatId;
        this.is_debug = config.is_debug;

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
            username: { type: "text" },
            password: { type: "password" },
            token: { type: "password" },
            flatId: { type: "text" }
        }
    });
};

