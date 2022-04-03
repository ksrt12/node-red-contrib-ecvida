"use strict";

const fetch = require("node-fetch");
const { checkStatus } = require("./utils");

/**
 * 
 * @param {string} url 
 * @param {object} headers 
 * @param {string} body
 * @param {Function} SetError 
 * @param {string} topic
 * @returns {Promise<object>}
 */
module.exports = (url, headers, body, SetError, topic) => fetch(url, { method: "POST", headers, body, redirect: 'manual' })
    .then(checkStatus)
    .then(res => res.json())
    .catch(err => SetError(topic, err));
