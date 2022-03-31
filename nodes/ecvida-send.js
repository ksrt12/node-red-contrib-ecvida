"use strict";
const fetch = require("node-fetch");
const getCookies = require("../lib/getCookies");
const getCounters = require("../lib/getCounters");
const { UserAgent } = require("../lib/utils");
const { is, func } = require("../lib/utils");
const sleep = require('util').promisify(setTimeout);

module.exports = function (RED) {

    function Ecvida_Send(config) {
        RED.nodes.createNode(this, config);

        this.login = config.login;
        this.login_node = RED.nodes.getNode(this.login);

        let username = this.login_node.username;
        let password = this.login_node.password;
        let cookies = this.login_node.cookies;
        let is_debug = this.login_node.debug;

        let node = this;

        // Define local functions
        const Debug_Log = msg_text => func.Debug_Log(node, msg_text);
        const SetStatus = (color, shape, topic, status) => func.SetStatus(node, is_debug, color, shape, topic, status);
        const SetError = (topic, status) => func.SetError(node, is_debug, topic, status);
        const funcions = { Debug_Log, SetStatus, SetError };
        const cleanStatus = () => func.CleanStatus(node);

        node.on('input', function (msg) {

            async function make_action() {

                cleanStatus();

                if (!is(cookies, 700)) {
                    cookies = await getCookies({ username, password, ...funcions });
                }

                if (is(cookies, 700)) {

                    let news = msg.payload;
                    msg.payload = "Что-то пошло не так...";

                    if (typeof news === "object") {

                        let topic = "Send counters";
                        SetStatus("yellow", "ring", topic, "begin");

                        let { old, byId } = await getCounters({ topic, cookies, SetError });
                        if (old) {

                            SetStatus("green", "ring", topic, "validate");

                            let out = "";
                            let toDelete = [];

                            const addToDeleteList = (serial, text_err) => {
                                Debug_Log(`Значение счётчика ${serial} не будет отправлено: ${text_err}`);
                                toDelete.push(serial);
                            };

                            Object.entries(old).forEach(([serial, vals], i) => {
                                if (news[serial]) {
                                    if (old[serial].status === "ok") {
                                        out += `sendedCounterValues[${i}][Id]=${vals.id}&`;
                                        news[serial].forEach((val, j) => {
                                            // if (news[serial][j] < old[serial].vals[j]) {
                                            // addToDeleteList(serial, "Новое значение меньше старого");
                                            // } else {
                                            out += `sendedCounterValues[${i}][Val${j + 1}Str]=${val}&`;
                                            // }
                                        });
                                    } else {
                                        addToDeleteList(serial, old[serial].status);
                                    }
                                }
                            });
                            out += "remember=true";

                            SetStatus("blue", "ring", topic, "send");

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

                            SetStatus("blue", "ring", topic, "sended");

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
                                    SetStatus("blue", "dot", topic, "ok");
                                    msg.status = "ok";
                                    toDelete.forEach(serial => delete news[serial]);
                                    msg.payload = news;
                                } else {
                                    SetStatus("yellow", "dot", topic, "warn");
                                    msg.payload = "Данные не отправлены";
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
