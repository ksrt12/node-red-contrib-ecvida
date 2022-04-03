"use strict";

const fetch = require("node-fetch");
const { checkStatus } = require("./utils");

/**
 * 
 * @param {string} url 
 * @param {object} headers 
 * @param {Function} SetError 
 * @param {string} topic
 * @returns {Promise<object>}
 */
module.exports = (url, headers, SetError, topic) => fetch(url, { method: "GET", headers, redirect: 'manual' })
    .then(checkStatus)
    .then(res => res.json())
    .catch(err => SetError(topic, err));
