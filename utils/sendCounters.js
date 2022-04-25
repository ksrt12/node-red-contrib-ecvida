"use strict";

const fetchPost = require("./myFetch").Post;
const getCounters = require("./getCounters");

/** @type {sendCounters} */
module.exports = async ({ news, flatId, defHeaders, host, SetStatus, SetError, Debug_Log }) => {

    let topic = "Send counters";
    SetStatus("yellow", "ring", topic, "begin");

    let old = await getCounters({ flatId, defHeaders, host, SetStatus, SetError, Debug_Log });
    if (old) {

        SetStatus("green", "ring", topic, "validate");

        let out = [];
        let byId = {};

        Object.entries(old).forEach(([serial, { id, error }]) => {
            if (news[serial]) {
                if (!error) {
                    let tmp = {
                        id,
                        "twoTarrif": false,
                        "type": null,
                        "val1Str": null,
                        "val2Str": null,
                        "val3Str": null
                    };
                    news[serial].forEach((val, j) => {
                        tmp[`val${j + 1}Str`] = val;
                        if (j > 0) {
                            tmp.twoTarrif = true;
                        }
                    });
                    out.push(tmp);
                    byId[id] = serial;
                } else {
                    Debug_Log(`Значение счётчика ${serial} не будет отправлено: ${error}`);
                }
            }
        });

        SetStatus("blue", "ring", topic, "send");
        /** @type {ansSendCounters} */
        let counters_status = await fetchPost({ url: host + "/api/counters/AddCounterValues?version=2", headers: defHeaders, body: JSON.stringify(out), SetError, topic });

        if (counters_status.isSuccess && !counters_status.message) {
            SetStatus("blue", "dot", topic, "ok");
            return "ok";
        } else {
            SetStatus("yellow", "dot", topic, "warn");
            counters_status.data.forEach(counter => {
                let err = counter.error;
                if (err) {
                    Debug_Log(`Счётчик ${byId[counter.id]}: ${err}`);
                }
            });
            return counters_status.message;
        }
    }
};