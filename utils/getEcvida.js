"use strict";
const getConfig = require("../utils/getConfig");
const getAccruals = require("../utils/getAccruals");
const getCounters = require("../utils/getCounters");
const getPayments = require("../utils/getPayments");

/** @type {getEcvida} */
module.exports = {
    balance(defGetParams) {
        return getConfig({ isBalance: true, ...defGetParams });
    },
    accruals(defGetParams) {
        return getAccruals(defGetParams);
    },
    payments(defGetParams) {
        return getPayments(defGetParams);
    },
    counters(defGetParams, showArchive) {
        return getCounters({ showArchive, ...defGetParams });
    }
}; 