"use strict";
const fetch = require("node-fetch");
const { checkStatus } = require("./utils");

/**
 * 
 * @param {object} param
 * @param {string} param.host Хост
 * @param {object} param.defHeaders Заголовки
 * @param {function} param.SetStatus SetStatus Function
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<boolean>} Token is valid
 */
module.exports = async ({ host, defHeaders, SetStatus, SetError, Debug_Log }) => {
    const topic = "Check token";

    SetStatus("blue", "ring", topic, "begin");
    let check = await fetch(host + "/api/User/GetUser",
        {
            method: "GET",
            headers: defHeaders,
            redirect: 'manual'
        })
        .then(checkStatus)
        .then(res => res.json())
        .catch(err => SetError(topic, err));

    if (check.isSuccess) {
        SetStatus("blue", "dot", topic, "OK");
        return true;
    } else {
        SetError(topic, "fail");
        Debug_Log(check.error.message);
        return false;
    }
};