"use strict";
const { is } = require("./utils");

module.exports = (date) => {
    let month, year;
    if (is(date, 6)) {
        [month, year] = date.split(".");
    } else {
        let curr_date = new Date();
        [month, year] = [curr_date.getMonth() + 1, curr_date.getFullYear()];
    }
    return [month, year];
};