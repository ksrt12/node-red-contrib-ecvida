"use strict";
const getHTML = require("./getHTML");
const makeDate = require("./makeDate");
const { formatNumber, months } = require("./utils");

module.exports = async ({ topic, cookies, SetError, getAll, date }) => {

    let balance_div;
    let out = {};
    let accruals = {};
    let accrual = {};

    while (typeof balance_div !== "object") {

        let document = await getHTML("https://lkabinet.online/accruals", topic, cookies, SetError);

        if (document) {

            balance_div = document.querySelector("body > header > div.col.object.lBlock.mobile_flat_selector > div.objects_list > a > div.row > * > div.flatBalance");

            if (balance_div) {

                let div_years = document.querySelectorAll("#accrualsBlock > div.body_nav > div.list_to_load.accruals_list > div.accruals_year");
                for (let div_year of div_years) {
                    let year = formatNumber(div_year.querySelector("div.year").textContent);
                    accruals[year] = {};
                    for (let div_month of div_year.querySelectorAll("a.item.showAccrual")) {
                        let month = div_month.querySelector("div.title").textContent.trim().toLowerCase();
                        let sum = formatNumber(div_month.querySelector("div.sum_desc").textContent);
                        // let month_num = months.indexOf(month) + 1;
                        accruals[year][month] = sum;
                    }
                }
                if (!getAll) {
                    let [month, year] = makeDate(date);
                    let month_str = months[month - 1];
                    accrual = {
                        month: month_str + " " + year,
                        sum: accruals[year][month_str]
                    };
                }
            }

        }
    }

    if (balance_div) {
        out.balance = {
            status: balance_div.classList.contains("balance_green") ? "Переплата" : "Долг",
            sum: formatNumber(balance_div.textContent)
        };
        out.accruals = getAll ? accruals : accrual;
        return out;
    };
};

