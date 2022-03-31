const getHTML = require("./getHTML");
const { formatNumber } = require("./utils");

module.exports = async (topic, cookies, SetError) => {

    let document = await getHTML("https://lkabinet.online/accruals", topic, cookies, SetError);

    if (document) {
        let month = document.querySelector("#placeForShowAccrual > div.page_title.accrualTitle > h2").textContent;
        let sum = formatNumber(document.querySelector("#accrualPage > div.payment_right > div.accruals_total.accrualTotal > div.accr_head > div > div.prise").textContent);
        let balance_div = document.querySelector("body > header > div.col.object.lBlock.mobile_flat_selector > div.objects_list > a > div.row > * > div.flatBalance");

        return {
            accular: {
                month,
                sum
            },
            balance: {
                status: balance_div.classList.contains("balance_green") ? "Переплата" : "Долг",
                sum: formatNumber(balance_div.textContent)
            }
        };
    }
    return false;
};

