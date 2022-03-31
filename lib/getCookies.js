"use strict";
const fetch = require("node-fetch");
const { UserAgent } = require("./utils");

module.exports = async ({ username, password, SetStatus, SetError, Debug_Log }) => {

    let cookies = "";
    let is_cookies = false;

    const addCookies = res => {
        let raw = res.headers.raw()['set-cookie'];
        if (raw) {
            raw.forEach(tmp => {
                let tmp_cookie = tmp.substring(0, tmp.indexOf('; ')) + ";";
                if (tmp_cookie.length > 200) {
                    cookies += tmp_cookie;
                }
            });
            is_cookies = true;
        } else {
            is_cookies = false;
            throw "Invalid login/password";
        }
    };

    SetStatus("blue", "ring", "Get cookies", "ASPXAUTH");
    await fetch("https://lkabinet.online/login/enterPassword?emailOrPhone=" + username + "&accountType=",
        {
            method: "POST",
            body: "EmailOrPhone=" + username + "&Password=" + encodeURIComponent(password),
            headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded' },
            redirect: 'manual'
        })
        .then(addCookies)
        .catch(err => SetError("Get cookies: ASPXAUTH", err));

    if (is_cookies) {

        SetStatus("green", "ring", "Get cookies", "ASPXROLES");
        await fetch("https://lkabinet.online/",
            {
                method: "GET",
                headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded', 'cookie': cookies },
                redirect: 'manual'
            })
            .then(addCookies)
            .catch(err => SetError("Get cookies: ASPXROLES", err));

        if (cookies.length > 700) {
            SetStatus("blue", "dot", "Get cookies", "OK");
            Debug_Log("Copy cookies to ecvida-login node:");
            Debug_Log(cookies);
            return cookies;
        }
    }
};