"use strict";
const fetch = require("node-fetch");
const { checkStatus } = require("./utils");

/**
 * 
 * @param {object} param
 * @param {string} param.flatId Flat ID
 * @param {string} param.host Host
 * @param {object} param.defHeaders Headers
 * @param {function} param.SetStatus SetStatus Function
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<object>} Token
 */
module.exports = async ({ flatId, defHeaders, host, SetStatus, SetError, Debug_Log }) => {

    let topic = "Get counters";

    SetStatus("blue", "ring", topic, "begin");
    let counters_status = await fetch(host + "/api/counters/GetList?RoomId=" + flatId,
        {
            method: "GET",
            headers: defHeaders,
            redirect: 'manual'
        })
        .then(checkStatus)
        .then(res => res.json())
        .catch(err => SetError(topic, err));

    if (counters_status.isSuccess) {

        let counters = {};
        counters_status.data.forEach(counter => {
            if (!counter.isArchive) {
                let serial = counter.serialNumber;
                if (!counters.hasOwnProperty(serial)) {
                    counters[serial] = {
                        id: counter.id,
                        title: counter.type.title,
                        vals: [],
                        error: counter.error
                    };
                }
                counters[serial]["vals"].push(parseFloat(counter.lastValue));
            }
        });

        return counters;

    } else {
        Debug_Log(counters_status.error.message);
    }
};