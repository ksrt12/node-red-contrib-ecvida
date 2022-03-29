const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { UserAgent } = require("./utils");
const { JSDOM } = jsdom;

module.exports = (url, topic, cookies, SetError) => fetch(url,
    {
        method: "GET",
        headers: {
            'User-Agent': UserAgent,
            'Content-Type': 'text/plain; charset=utf-8', 'cookie': cookies
        },
        redirect: 'manual'
    })
    .then(res => res.text())
    .then(text => (new JSDOM(text)).window.document)
    .catch(err => SetError(topic, err));