const getHTML = require("./getHTML");
const { formatNumber, is } = require("./utils");

module.exports = async (topic, cookies, SetError, date) => {

    let curr_date_str;
    if (is(date, 6)) {
        curr_date_str = "01." + date;
    } else {
        let curr_date = new Date();
        curr_date_str = `01.${curr_date.getMonth() + 1}.${curr_date.getFullYear()}`;
    }

    let doc = await getHTML("https://lkabinet.online/Counters/GetValues?isEdit=true&DayToString=" + curr_date_str, topic, cookies, SetError);
    if (doc) {
        let all = doc.querySelectorAll("body > form > div.indications_list > div");
        if (all) {
            let counters = { date: curr_date_str };
            let old = {};
            let byId = {};

            for (let counter of all) {
                let id = counter.getAttribute("data-id");
                let counter_err = counter.querySelector("div.cells_cover > div.counters_error");
                let title = counter.querySelector("div.title").textContent;
                let serial = counter.querySelector("div.serial").textContent.slice(16);
                let status = (counter_err) ? counter_err.textContent.trim() : "ok";
                let vals = [];
                counter.querySelectorAll("div.cells_cover > div.cell").forEach(cell => {
                    if (status !== "ok") {
                        vals.push(formatNumber(cell.querySelector("span.counterValue").textContent));
                    } else {
                        vals.push(formatNumber(cell.querySelector("div.prev_value_number").textContent));
                    }
                });

                counters[serial] = { title, vals, status };
                old[serial] = { id, status, vals };
                byId[id] = serial;
            }

            return { counters, old, byId };
        }
    }
    return false;
};

