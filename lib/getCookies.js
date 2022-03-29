const fetch = require("node-fetch");

module.exports = async (username, password, setStatus, SetError, Debug_Log) => {
    const UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36";
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

    setStatus("blue", "ring", "Get cookies", "ASPXAUTH");
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

        setStatus("green", "ring", "Get cookies", "ASPXROLES");
        await fetch("https://lkabinet.online/",
            {
                method: "GET",
                headers: { 'User-Agent': UserAgent, 'Content-Type': 'application/x-www-form-urlencoded', 'cookie': cookies },
                redirect: 'manual'
            })
            .then(addCookies)
            .catch(err => SetError("Get cookies: ASPXROLES", err));

        if (cookies.length > 700) {
            setStatus("blue", "dot", "Get cookies", "OK");
            Debug_Log("Copy cookies to ecvida-login node:");
            Debug_Log(cookies);
            return cookies;
        }
    }
};