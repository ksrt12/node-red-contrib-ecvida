"use strict";
const fetch = require("node-fetch");
const { checkStatus, months } = require("./utils");

/**
 * 
 * @param {object} param
 * @param {string} param.flatId Flat ID
 * @param {string} param.host Host
 * @param {object} param.defHeaders Headers
 * @param {function} param.SetStatus SetStatus Function
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<object>} Paymenst
 */
module.exports = async ({ date, flatId, defHeaders, host, SetStatus, SetError, Debug_Log }) => {

    let topic = "Get payments";

    SetStatus("blue", "ring", topic, "begin");
    let payments = await fetch(host + "/api/payments/getList?FlatId=" + flatId,
        {
            method: "GET",
            headers: defHeaders,
            redirect: 'manual'
        })
        .then(checkStatus)
        .then(res => res.json())
        .catch(err => SetError(topic, err));

    if (payments.isSuccess) {
        let all = {};
        payments.data.forEach(pay => {
            let year = new Date(pay.dateTime).getFullYear();
            let month = pay.monthToString.toLowerCase();
            if (!all.hasOwnProperty(year)) {
                all[year] = {};
            }
            if (!all[year].hasOwnProperty(year)) {
                all[year][month] = {};
            }
            pay.list.forEach(pay_m => {
                all[year][month][pay_m.dateTimeToString] = pay_m.summ;
            });
        });

        if (date) {
            let [curr_m, curr_y] = date.split(".").map(i => parseInt(i));
            return all[curr_y][months[curr_m - 1]];
        } else {
            return all;
        }
    } else {
        Debug_Log(payments.message);
    }
};