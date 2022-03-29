const getCookies = require("../lib/getCookies");
const getHTML = require("../lib/getHTML");
const sleep = require('util').promisify(setTimeout);

module.exports = function (RED) {

    function Ecvida_Send(config) {
        RED.nodes.createNode(this, config);

        this.login = config.login;
        this.login_node = RED.nodes.getNode(this.login);

        this.username = this.login_node.username;
        this.password = this.login_node.password;
        this.cookies = this.login_node.cookies;
        this.is_debug = this.login_node.debug;

        let node = this;

        node.on('input', function (msg) {

            let username = node.username;
            let password = node.password;
            let cookies = node.cookies;
            let is_debug = node.is_debug;

            const Debug_Log = msg_text => {
                node.log(msg_text);
                node.send({ payload: msg_text });
            };

            const setStatus = (color, shape, topic, status) => {
                node.status({ fill: color, shape: shape, text: topic });
                if (is_debug) Debug_Log(topic + ": " + status);
            };

            const SetError = (topic, status) => {
                setStatus("red", "dot", topic, "fail: " + status);
                node.send(status);
                return;
            };

            const formatNumber = str => parseFloat(str.replace(',', '.').replace(new RegExp(/\s/, 'g'), ''));
            const is = (str, length = 1) => (str && str.length > length);
            const cleanStatus = () => node.status({});

            async function make_action() {

                cleanStatus();

                if (!is(cookies, 700)) {
                    cookies = await getCookies(username, password, setStatus, SetError, Debug_Log);
                }

                if (is(cookies, 700)) {

                    let topic = "Send counters";
                    setStatus("blue", "ring", topic, "begin");
                    let out;

                    setStatus("blue", "dot", topic, "ok");

                    msg.payload = out;
                    node.send(msg);
                    await sleep(500);
                    cleanStatus();
                }

            };////////////// end of acync

            make_action().then();

        }); //// end node

    };

    RED.nodes.registerType("ecvida-send", Ecvida_Send);
};;
