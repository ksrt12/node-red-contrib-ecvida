"use strict";

const fetchGet = require("./fetchGet");
const { makeDate, months } = require("./utils");

/** @type {getAccruals} */
module.exports = async ({ lastMonth, date, flatId, defHeaders, host, topic, SetError, Debug_Log }) => {

    const lm = lastMonth ? "&onlyLastMonth=true" : "";
    /** @type {ansAccruals} */
    let accruals = await fetchGet({ topic, url: host + "/api/Accruals/getList?RoomId=" + flatId + lm, headers: defHeaders, SetError });

    if (accruals.isSuccess) {

        if (lastMonth) {
            let data = accruals.data[0];
            return {
                month: data.period,
                sum: data.summToPay
            };
        } else {
            /** @type {accrualsAll} */
            let all = {};
            accruals.data.forEach(accrual => {
                let year = accrual.year;
                let month = accrual.month.toLowerCase();
                if (!all.hasOwnProperty(year)) {
                    all[year] = {};
                }
                all[year][month] = accrual.summToPay;

            });

            if (date) {
                let [curr_m, curr_y] = makeDate(date);
                let m_str = months[curr_m - 1];
                return {
                    month: m_str,
                    sum: all[curr_y][m_str]
                };
            } else {
                return all;
            }
        }
    } else {
        Debug_Log(accruals.error.message);
    }
};