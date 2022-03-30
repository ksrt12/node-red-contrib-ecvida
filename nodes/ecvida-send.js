const fetch = require("node-fetch");
const getCookies = require("../lib/getCookies");
const getCounters = require("../lib/getCounters");
const { UserAgent } = require("../lib/utils");
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
                node.status({ fill: color, shape: shape, text: topic + ": " + status });
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

                    let news = msg.payload;

                    if (typeof news === "object") {

                        let topic = "Send counters";
                        setStatus("yellow", "ring", topic, "begin");

                        let old = {};
                        let byId = {};

                        let all = await getCounters(topic, cookies, SetError, "isEdit=true&");
                        if (all) {

                            for (let counter of all) {
                                let id = counter.getAttribute("data-id");
                                let counter_err = counter.querySelector("div.cells_cover > div.counters_error");
                                let serial = counter.querySelector("div.serial").textContent.slice(16);
                                let status = (counter_err) ? counter_err.textContent.trim() : "ok";

                                old[serial] = { id, status };
                                byId[id] = serial;
                            }

                            setStatus("green", "ring", topic, "validate");

                            let out = "";
                            Object.entries(old).forEach(([serial, vals], i) => {
                                if (news[serial]) {
                                    if (old[serial].status === "ok") {
                                        out += `sendedCounterValues[${i}][Id]=${vals.id}&`;
                                        news[serial].forEach((val, val_i) => {
                                            out += `sendedCounterValues[${i}][Val${val_i + 1}Str]=${val}&`;
                                        });
                                    } else {
                                        Debug_Log(`Значение счётчика ${serial} не будет отправлено: ${old[serial].status}`);
                                    }
                                }
                            });
                            out += "remember=true";

                            setStatus("blue", "ring", topic, "send");

                            let ans = [];
                            await fetch("https://lkabinet.online/Counters/AddCounterValues",
                                {
                                    headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'cookie': cookies },
                                    method: "POST",
                                    body: encodeURI(out)
                                })
                                .then(res => {
                                    if (res.status === 200) {
                                        return res.json();
                                    } else {
                                        throw res.status;
                                    }
                                })
                                .then(res => ans = res)
                                .catch(err => SetError(topic, err));

                            setStatus("blue", "ring", topic, "sended");

                            if (is(ans)) {
                                let err_count = 0;
                                ans.forEach(counter => {
                                    let err = counter["Error"];
                                    if (err) {
                                        Debug_Log(`Значения счётчика ${byId[counter["Id"]]} отправлены, но сервер отклонил запрос с ошибкой: ${err}`);
                                        err_count += 1;
                                    }
                                });

                                if (err_count === 0) {
                                    setStatus("blue", "dot", topic, "ok");
                                    msg.status = "ok";
                                } else {
                                    setStatus("yellow", "dot", topic, "warn");
                                }

                                await sleep(500);
                                cleanStatus();
                            }
                        }
                    } else {
                        msg.payload = "Wrong input JSON format";
                    }
                    node.send(msg);
                }

            };////////////// end of acync

            make_action().then();

        }); //// end node

    };

    RED.nodes.registerType("ecvida-send", Ecvida_Send);
};;
