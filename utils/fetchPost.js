"use strict";

const fetch = require("node-fetch");
const { checkStatus } = require("./common");

/** @type {fetchPost} */
module.exports = ({ topic, url, headers, SetError, body }) => fetch(url, { method: "POST", headers, body, redirect: 'manual' })
    .then(checkStatus)
    .then((/** @type {Response} */ res) => res.json())
    .catch(err => SetError(topic, err));