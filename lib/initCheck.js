"use strict";

const getConfig = require("./getConfig");
const getToken = require("./getToken");
const { getHost, getBundle, is } = require("./utils");

/** @type {initCheck} */
module.exports = async ({ should_update, uk, token, flatId, username, password, defFunctions }) => {

    const host = getHost(uk);

    /** @type {defHeaders} */
    let defHeaders = {
        "Version": 4,
        "OS": "Android",
        "bundleID": getBundle(uk),
        "device": "xiaomi mido",
        "OSdata": "Android 24",
        "User-Agent": "okhttp/4.9.0",
    };

    if (!is(token, 30)) {
        token = await getToken({ username, password, defHeaders, host, ...defFunctions });
    }

    /** @type {defParams} */
    let defGetParams = {};

    if (is(token, 30)) {
        defHeaders["Authorization"] = "Bearer " + token;
        defHeaders["Content-Type"] = "application/json; charset=utf-8";
        defGetParams = { flatId, host, defHeaders, ...defFunctions };

        if (should_update) {
            defGetParams.flatId = await getConfig(defGetParams);
        }

        return defGetParams;
    }
};