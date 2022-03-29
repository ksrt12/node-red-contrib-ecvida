const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = (url, topic, cookies, SetError) => fetch(url,
    {
        method: "GET",
        headers: {
            'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36",
            'Content-Type': 'text/plain; charset=utf-8', 'cookie': cookies
        },
        redirect: 'manual'
    })
    .then(res => res.text())
    .then(text => {
        let { document } = (new JSDOM(text)).window;
        return document;
    })
    .catch(err => SetError(topic, err));