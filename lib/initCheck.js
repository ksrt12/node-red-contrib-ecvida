"use strict";

const getConfig = require("./getConfig");
const getToken = require("./getToken");
const { getHost, getBundle, is } = require("./utils");

/**
 * 
 * @param {string} uk 
 * @param {string} token 
 * @param {string} flatId 
 * @param {string} username 
 * @param {string} password 
 * @param {object[Function]} defFunctions 
 * @returns 
 */
module.exports = async (uk, token, flatId, username, password, defFunctions) => {

    const host = getHost(uk);
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

    /**
     * @param {string} flatId Flat ID
     * @param {string} host Host
     * @param {object} defHeaders {@link defHeaders}
     * @param {object} defFuctions {@link defFunctions}
     */
    let defGetParams = {};

    if (is(token, 30)) {
        defHeaders["Authorization"] = "Bearer " + token;
        defHeaders["Content-Type"] = "application/json; charset=utf-8";
        defGetParams = { flatId, host, defHeaders, ...defFunctions };
        defGetParams.flatId = await getConfig(defGetParams);

        return defGetParams;
    }
};