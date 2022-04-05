"use strict";

const fetch = require("node-fetch");
const { checkStatus } = require("./utils");

/** @type {fetchGet} */
module.exports = ({ topic, url, headers, SetError }) => fetch(url, { method: "GET", headers, redirect: 'manual' })
    .then(checkStatus)
    .then((/** @type {Response} */ res) => res.json())
    .catch(err => SetError(topic, err));
