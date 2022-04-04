"use strict";

const fetch = require("node-fetch");
const { checkStatus } = require("./utils");

/** @type {fetchPost} */
module.exports = ({ topic, url, headers, SetError, body }) => fetch(url, { method: "POST", headers, body, redirect: 'manual' })
    .then(checkStatus)
    .then(res => res.json())
    .catch(err => SetError(topic, err));
