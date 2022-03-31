const getHTML = require("./getHTML");
const { formatNumber, is } = require("./utils");

module.exports = async (topic, cookies, SetError, date) => {

    let curr_date_str;
    if (is(date, 6)) {
        let date_arr = date.split(".");
        curr_date_str = `year=${date_arr[1]}&month=${date_arr[0]}`;
    } else {
        let curr_date = new Date();
        curr_date_str = `year=${curr_date.getFullYear()}&month=${curr_date.getMonth() + 1}`;
    }

    let document = await getHTML("https://lkabinet.online/Payments/Show?" + curr_date_str, topic, cookies, SetError);

    if (document) {
        let payments = {};
        let payments_divs = document.querySelectorAll("div.accruals_page > * div.desc > div.item");
        for (let payment of payments_divs) {
            payments[payment.querySelector("div.left > div.name > nobr").textContent.trim()] = formatNumber(payment.querySelector("div.right > div.prise > nobr").textContent);
        }
        return payments;
    }
    return false;
};

