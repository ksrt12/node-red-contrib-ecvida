"use strict";
const fetch = require("node-fetch");
const getCounters = require("./getCounters");
const { checkStatus } = require("./utils");

/**
 * 
 * @param {object} param
 * @param {object} param.news JSON object with new counters values
 * @param {string} param.flatId Flat ID
 * @param {string} param.host Host
 * @param {object} param.defHeaders Headers
 * @param {function} param.SetStatus SetStatus Function
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<object>} Token
 */
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
        let counters_status = await fetch(host + "/api/counters/AddCounterValues?version=2",
            {
                method: "POST",
                headers: defHeaders,
                body: JSON.stringify(out)
            })
            .then(checkStatus)
            .then(res => res.json())
            .catch(err => SetError(topic, err));

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