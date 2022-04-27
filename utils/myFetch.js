"use strict";

const localFetch = require("node-fetch");
const { checkStatus } = require("./common");

/** @type {myFetch} */
const general = async ({ topic, url, method, headers, body, SetError }) => {
    let opt = { method, headers, redirect: 'manual' };
    if (body) {
        opt.body = body;
    }
    return await localFetch(url, opt)
        .then(checkStatus)
        .then((/** @type {Response} */ res) => res.json())
        .catch(err => SetError(topic, err));
};

module.exports = {
    /** @type {fetchGet} */
    Get(args) {
        return general({ method: "GET", ...args });
    },

    /** @type {fetchPost} */
    Post(args) {
        return general({ method: "POST", ...args });
    }
};