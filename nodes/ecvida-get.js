"use strict";
const checkToken = require("../lib/checkToken");
const getAccruals = require("../lib/getAccruals");
const getCookies = require("../lib/getCookies");
const getCounters = require("../lib/getCounters");
const getHost = require("../lib/getHost");
const getPayments = require("../lib/getPayments");
const getToken = require("../lib/getToken");
const sleep = require('util').promisify(setTimeout);

const { is, func } = require("../lib/utils");

module.exports = function (RED) {

    function Ecvida_Get(config) {
        RED.nodes.createNode(this, config);

        this.login = config.login;
        this.login_node = RED.nodes.getNode(this.login);

        let username = this.login_node.username;
        let password = this.login_node.password;
        let uk = this.login_node.uk;
        let token = this.login_node.token;
        let cookies = this.login_node.cookies;
        let is_debug = this.login_node.debug;
        let command = config.command_type;
        let date = config.calendar;
        let getAll = config.get_all;

        let node = this;

        // Define local functions
        const Debug_Log = msg_text => func.Debug_Log(node, msg_text);
        const SetStatus = (color, shape, topic, status) => func.SetStatus(node, is_debug, color, shape, topic, status);
        const SetError = (topic, status) => func.SetError(node, is_debug, topic, status);
        const funcions = { Debug_Log, SetStatus, SetError };
        const cleanStatus = () => func.CleanStatus(node);

        node.on('input', function (msg) {

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

                let validToken = false;

                let defHeaders = {
                    "Version": 4,
                    "OS": "Android",
                    "bundleID": (uk === "pro.wellsoft.smartzhk") ? uk : "com.wellsoft." + uk,
                    "device": "xiaomi mido",
                    "OSdata": "Android 24",
                    "User-Agent": "okhttp/4.9.0",

                };

                cleanStatus();
                const host = getHost(uk);

                if (!is(cookies, 700)) {
                    cookies = await getCookies({ username, password, ...funcions });
                }

                if (!is(token, 30)) {
                    token = await getToken({ username, password, defHeaders, host, ...funcions });
                }

                if (is(token, 30)) {
                    defHeaders["Authorization"] = "Bearer " + token;
                    defHeaders["Content-Type"] = "application/json; charset=utf-8";
                    validToken = await checkToken({ host, defHeaders, ...funcions });
                }

                if (is(cookies, 700)) {

                    let topic = "Get " + command;
                    SetStatus("blue", "ring", topic, "begin");
                    let out;

                    let defVars = { topic, cookies, SetError, date };

                    switch (command) {
                        case "accruals":
                            out ??= await getAccruals({ ...defVars, getAll });
                            break;
                        case "payments":
                            out ??= await getPayments({ ...defVars });
                            break;
                        case "counters":
                            let { counters } = await getCounters({ ...defVars });
                            out ??= counters;
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
};;
