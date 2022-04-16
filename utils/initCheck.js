"use strict";

const getConfig = require("./getConfig");
const getToken = require("./getToken");
const { getHost, getBundle, is } = require("./common");

/** @type {initCheck} */
module.exports = async ({ RED, id, defFunctions }) => {

    const { Debug_Log } = defFunctions;
    /** @type {ecvidaCreds} */
    let currCreds;

    /** @type {(id: string) => ecvidaCreds} */
    const getCredentials = id => RED.nodes.getCredentials(id);
    currCreds = getCredentials(id);

    /** @type {(newCreds: ecvidaCredsAdd) => void} */
    const updateCredentials = newCreds => {
        currCreds = { ...currCreds, ...newCreds };
        RED.nodes.addCredentials(id, currCreds);
    };

    let { uk, username, password, token, flatId } = currCreds;
    if (typeof flatId !== "number") {
        flatId = Number(flatId);
    }

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
        if (is(token, 30)) {
            updateCredentials({ token });
            Debug_Log("Токен получен! Обновите ecivda-login вручную!");
        }
    }

    /** @type {defParams} */
    let defGetParams = {};

    if (is(token, 30)) {
        defHeaders["Authorization"] = "Bearer " + token;
        defHeaders["Content-Type"] = "application/json; charset=utf-8";
        defGetParams = { flatId, host, defHeaders, ...defFunctions };

        if (!flatId) {
            flatId = await getConfig(defGetParams);
            defGetParams.flatId = flatId;
            updateCredentials({ flatId });
            Debug_Log("ID квартиры получен! Обновите ecivda-login вручную!");
        }

        return defGetParams;
    }
};