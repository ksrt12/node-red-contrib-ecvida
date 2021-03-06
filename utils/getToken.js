"use strict";

const fetchPost = require("./myFetch").Post;

/** @type {getToken} */
module.exports = async ({ username, password, defHeaders, host, SetStatus, SetError, Debug_Log }) => {

    const headers = { ...defHeaders, "Content-Type": "application/x-www-form-urlencoded; charset=utf-8" };
    let topic = "Get token";

    SetStatus("blue", "ring", topic, "login");
    /** @type {ansAuthLogin} */
    let login_status = await fetchPost({
        url: host + "/login", headers,
        body: "EmailOrPhone=" + username + "&IsMobile=true&accountType=Resident&isDevelop=false",
        SetError, topic
    });

    if (login_status) {

        if (login_status.isSuccess && login_status.data.nextScreen) {

            SetStatus("blue", "ring", topic, "password");
            /** @type {ansAuthPasswd} */
            let password_status = await fetchPost({
                url: host + "/login/enterpassword", headers,
                body: "EmailOrPhone=" + username + "&Password=" + encodeURIComponent(password) + "&IsMobile=true&AccountType=Resident",
                SetError, topic
            });

            if (password_status.isSuccess) {
                SetStatus("blue", "dot", topic, "OK");
                return password_status.data;
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