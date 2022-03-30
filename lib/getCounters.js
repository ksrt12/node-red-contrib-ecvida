const getHTML = require("./getHTML");

module.exports = async (topic, cookies, SetError, isEdit = "") => {
    let curr_date = new Date();
    let curr_date_str = `01.${curr_date.getMonth()}.${curr_date.getFullYear()}`;
    let doc = await getHTML("https://lkabinet.online/Counters/GetValues?" + isEdit + "DayToString=" + curr_date_str, topic, cookies, SetError);
    if (doc) {
        let all = doc.querySelectorAll("body > form > div.indications_list > div");
        if (all) {
            return all;
        }
    }
    return false;
};

