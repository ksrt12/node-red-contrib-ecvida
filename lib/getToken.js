"use strict";
const fetch = require("node-fetch");
const { checkStatus } = require("./utils");
const getHost = require("./getHost");

/**
 * 
 * @param {object} param
 * @param {string} param.username Login username 
 * @param {string} param.password Login password
 * @param {string} param.host Хост
 * @param {object} param.defHeaders Заголовки
 * @param {function} param.SetStatus SetStatus Function
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<string>} Token
 */
module.exports = async ({ username, password, defHeaders, host, SetStatus, SetError, Debug_Log }) => {

    let topic = "Get token";
    let token;

    SetStatus("blue", "ring", topic, "login");
    let login_status = await fetch(host + "/login",
        {
            method: "POST",
            headers: {
                ...defHeaders,
                "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            },
            body: "EmailOrPhone=" + username + "&IsMobile=true&accountType=Resident&isDevelop=false",
            redirect: 'manual'
        })
        .then(checkStatus)
        .then(res => res.json())
        .catch(err => SetError(topic, err));

    if (login_status.isSuccess && login_status.data.nextScreen) {

        SetStatus("blue", "ring", topic, "password");
        let password_status = await fetch(host + "/login/enterpassword",
            {
                method: "POST",
                headers: defHeaders,
                body: "EmailOrPhone=" + username + "&Password=" + encodeURIComponent(password) + "&IsMobile=true&AccountType=Resident",
                redirect: 'manual'
            })
            .then(checkStatus)
            .then(res => res.json())
            .catch(err => SetError(topic, err));

        if (password_status.isSuccess) {
            SetStatus("blue", "dot", topic, "OK");
            token = password_status.data;
            Debug_Log("Copy token to ecvida-login node:");
            Debug_Log(token);
            return token;
        } else {
            Debug_Log(password_status.error.message);
        }

    } else {
        Debug_Log(login_status.error.message);
    }
};