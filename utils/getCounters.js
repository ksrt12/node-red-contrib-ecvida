"use strict";

const fetchGet = require("./myFetch").Get;

/** @type {getCounters} */
module.exports = async ({ flatId, showArchive, defHeaders, host, topic, SetError, Debug_Log }) => {

    /** @type {ansCounters} */
    let counters_status = await fetchGet({ topic, url: host + "/api/counters/GetList?RoomId=" + flatId, headers: defHeaders, SetError });

    if (counters_status.isSuccess) {

        /** @type {counters} */
        let counters = {};
        counters_status.data.forEach(counter => {
            if (showArchive || !counter.isArchive) {
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
        SetError(topic);
        Debug_Log(counters_status.error.message);
    }
};