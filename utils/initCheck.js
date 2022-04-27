"use strict";

const getConfig = require("./getConfig");
const getToken = require("./getToken");
const { getHost, is } = require("./common");
const { EcvidaCreds } = require("./classes");


/** @type {initCheck} */
module.exports = async ({ RED, id, defFunctions }) => {

    const creds = new EcvidaCreds(RED, id, defFunctions.Debug_Log);

    let { uk, username, password, token, flatId } = creds.get();
    if (flatId && typeof flatId !== "number") {
        flatId = Number(flatId);
    }

    const host = getHost(uk);

    /** @type {defHeaders} */
    let defHeaders = { Version: 4 };

    if (!is(token, 30)) {
        token = await getToken({ username, password, defHeaders, host, ...defFunctions });
        if (is(token, 30)) {
            creds.update({ token });
        }
    }

    if (is(token, 30)) {
        defHeaders["Authorization"] = "Bearer " + token;
        defHeaders["Content-Type"] = "application/json; charset=utf-8";
        let defGetParams = { flatId, host, defHeaders, ...defFunctions };

        if (!flatId) {
            flatId = await getConfig(defGetParams);
            defGetParams.flatId = flatId;
            creds.update({ flatId });
        }

        return defGetParams;
    }
};