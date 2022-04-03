"use strict";

const fetchPost = require("./fetchPost");

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

    const headers = { ...defHeaders, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" };
    let topic = "Get token";
    let token;

    SetStatus("blue", "ring", topic, "login");
    let login_status = await fetchPost(host + "/login", headers,
        "EmailOrPhone=" + username + "&IsMobile=true&accountType=Resident&isDevelop=false",
        SetError, topic);

    if (login_status) {

        if (login_status.isSuccess && login_status.data.nextScreen) {

            SetStatus("blue", "ring", topic, "password");
            let password_status = await fetchPost(host + "/login/enterpassword", headers,
                "EmailOrPhone=" + username + "&Password=" + encodeURIComponent(password) + "&IsMobile=true&AccountType=Resident",
                SetError, topic);

            if (password_status.isSuccess) {
                SetStatus("blue", "dot", topic, "OK");
                token = password_status.data;
                Debug_Log("Copy token to ecvida-login node:");
                Debug_Log(token);
                return token;
            } else {
                SetError(topic, "password");
                Debug_Log(password_status.error.message);
            }

        } else {
            SetError(topic, "login");
            Debug_Log(login_status.error.message);
        }
    }
};