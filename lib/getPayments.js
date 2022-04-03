"use strict";

const fetchGet = require("./fetchGet");
const { makeDate, months } = require("./utils");

/**
 * 
 * @param {object} param
 * @param {string} param.topic Topic
 * @param {boolean} param.lastMonth Only last month
 * @param {string} param.flatId Flat ID
 * @param {string} param.host Host
 * @param {object} param.defHeaders Headers
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<object>} Paymenst
 */
module.exports = async ({ lastMonth, date, flatId, defHeaders, host, topic, SetError, Debug_Log }) => {

    let payments = await fetchGet(host + "/api/payments/getList?FlatId=" + flatId, defHeaders, SetError, topic);

    if (payments.isSuccess) {
        if (lastMonth) {
            let data = payments.data[0].list[0];
            return {
                month: data.dateTimeToString,
                sum: data.summ
            };
        } else {
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
        Debug_Log(payments.message);
    }
};