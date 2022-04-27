class DefFunc {
    /** @type {(node: RedNode, is_debug: boolean)} */
    constructor(node, is_debug) {
        /** @type {FuncLog} */
        this.Debug_Log = msg_text => {
            node.log(msg_text);
            node.send({ payload: msg_text });
        };
        /** @type {FuncSetStatus} */
        this.SetStatus = (color, shape, topic, status) => {
            node.status({ fill: color, shape: shape, text: topic });
            if (is_debug) this.Debug_Log(topic + ": " + status);
        };
        /** @type {FuncSetError} */
        this.SetError = (topic, status) => {
            this.SetStatus("red", "dot", topic, "fail: " + status);
            node.send(status);
        };
        /** @type {() => void} */
        this.cleanStatus = () => node.status({});
    }
};

module.exports = { DefFunc };