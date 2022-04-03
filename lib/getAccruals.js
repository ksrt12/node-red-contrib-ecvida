"use strict";

const fetchGet = require("./fetchGet");
const { makeDate, months } = require("./utils");

/**
 * 
 * @param {object} param
 * @param {boolean} param.lastMonth Only last month
 * @param {string} param.date "mm.yyyy"
 * @param {string} param.flatId Flat ID
 * @param {string} param.host Host
 * @param {object} param.defHeaders Headers
 * @param {function} param.SetStatus SetStatus Function
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<object>} Accruals
 */
module.exports = async ({ lastMonth, date, flatId, defHeaders, host, SetStatus, SetError, Debug_Log }) => {

    let topic = "Get accruals";
    const lm = lastMonth ? "&onlyLastMonth=true" : "";

    SetStatus("blue", "ring", topic, "begin");
    let accruals = await fetchGet(host + "/api/Accruals/getList?RoomId=" + flatId + lm, defHeaders, SetError, topic);

    if (accruals.isSuccess) {

        if (lastMonth) {
            let data = accruals.data[0];
            return {
                month: data.period,
                sum: data.summToPay
            };
        } else {
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