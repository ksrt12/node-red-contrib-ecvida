"use strict";

const fetchGet = require("./fetchGet");
const { makeDate, months } = require("./utils");

/** @type {getPayments} */
module.exports = async ({ lastMonth, date, flatId, defHeaders, host, topic, SetError, Debug_Log }) => {

    /** @type {ansPayments} */
    let payments = await fetchGet({ topic, url: host + "/api/payments/getList?FlatId=" + flatId, headers: defHeaders, SetError });

    if (payments.isSuccess) {
        if (lastMonth) {
            let data = payments.data[0].list[0];
            return {
                month: data.dateTimeToString,
                sum: data.summ
            };
        } else {
            /** @type {accrualsAll} */
            let all = {};
            payments.data.forEach(pay => {
                let year = new Date(pay.dateTime).getFullYear();
                let month = pay.monthToString.toLowerCase();
                if (!all.hasOwnProperty(year)) {
                    all[year] = {};
                }
                if (!all[year].hasOwnProperty(month)) {
                    all[year][month] = {};
                }
                pay.list.forEach(pay_m => {
                    all[year][month][pay_m.dateTimeToString] = pay_m.summ;
                });
            });

            if (date) {
                let [curr_m, curr_y] = makeDate(date);
                return all[curr_y][months[curr_m - 1]];
            } else {
                return all;
            }
        }
    } else {
        SetError(topic);
        Debug_Log(payments.message);
    }
};