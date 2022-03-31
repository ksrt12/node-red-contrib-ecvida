const getHTML = require("./getHTML");
const makeDate = require("./makeDate");
const { formatNumber } = require("./utils");

module.exports = async ({ topic, cookies, SetError, date }) => {

    let [month, year] = makeDate(date);
    let document = await getHTML(`https://lkabinet.online/Payments/Show?year=${year}&month=${month}`, topic, cookies, SetError);

    if (document) {
        let payments = {};
        let payments_divs = document.querySelectorAll("div.accruals_page > * div.desc > div.item");
        let year = document.querySelector("div.page_title").textContent.trim().slice(-4);
        for (let payment of payments_divs) {
            payments[payment.querySelector("div.left > div.name > nobr").textContent.trim() + " " + year] = formatNumber(payment.querySelector("div.right > div.prise > nobr").textContent);
        }
        return payments;
    }
    return false;
};

