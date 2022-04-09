"use strict";

const getConfig = require("./getConfig");
const getToken = require("./getToken");
const { getHost, getBundle, is } = require("./utils");

/** @type {initCheck} */
module.exports = async ({ uk, RED, id, defFunctions }) => {

    const host = getHost(uk);
    /** @type {(newCreds: ecvidaCreds) => void} */
    const updateCredentials = newCreds => RED.nodes.addCredentials(id, newCreds);
    /** @type {(id: string) => void} */
    const getCredentials = id => RED.nodes.getCredentials(id);
    const { Debug_Log } = defFunctions;

    let { username, password, token, flatId } = getCredentials(id);;
    if (typeof flatId !== "number") {
        flatId = Number(flatId);
    }

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
        if (is(token, 30)) {
            updateCredentials({ username, password, token });
            Debug_Log("Токен получен! Обновите ecivda-login вручную!");
        }
    }

    /** @type {defParams} */
    let defGetParams = {};

    if (is(token, 30)) {
        defHeaders["Authorization"] = "Bearer " + token;
        defHeaders["Content-Type"] = "application/json; charset=utf-8";
        defGetParams = { flatId, host, defHeaders, ...defFunctions };

        updateCredentials({ username, password, token, flatId: 5 });

        if (!flatId) {
            flatId = await getConfig(defGetParams);
            defGetParams.flatId = flatId;
            updateCredentials({ username, password, token, flatId });
            Debug_Log("ID квартиры получен! Обновите ecivda-login вручную!");
        }

        return defGetParams;
    }
};