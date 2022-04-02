"use strict";

module.exports = function (RED) {

    function Ecvida_Config_Node(config) {
        RED.nodes.createNode(this, config);

        this.uk = config.uk;
        this.username = config.username;
        this.password = config.password;
        this.cookies = config.cookies;
        this.token = config.token;
        this.flatId = config.flatId;
        this.debug = config.debug;

        this.closing = false;
        let node = this;

        node.on("close", function (done) {
            node.closing = true;
            done();
        });
    }
    RED.nodes.registerType('ecvida-login', Ecvida_Config_Node);
};

