"use strict";
const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");
const { UserAgent } = require("./utils");

module.exports = (url, topic, cookies, SetError) => fetch(url,
    {
        method: "GET",
        headers: {
            'User-Agent': UserAgent,
            'Content-Type': 'text/plain; charset=utf-8', 'cookie': cookies
        },
        redirect: 'manual'
    })
    .then(req => {
        const status = req.status;
        if (status === 200) {
            return req;
        } else if (status === 302) {
            throw "Bad cookies";
        } else {
            throw status;
        }
    })
    .then(res => res.text())
    .then(text => (new JSDOM(text)).window.document)
    .catch(err => SetError(topic, err));