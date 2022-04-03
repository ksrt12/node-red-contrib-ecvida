"use strict";

const renameUk = {
    "vb_group": "vbgroup",
    "cvet_bulvar": "bulvar",
    "co_loft": "loft",
    "aSystem": "aktivsistema",
    "perspectiva": "perspektiva",
};

module.exports = {
    UserAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36",
    func: {
        Debug_Log(node, msg_text) {
            node.log(msg_text);
            node.send({ payload: msg_text });
        },

        SetStatus(node, is_debug, color, shape, topic, status) {
            const text = topic + ": " + status;
            node.status({ fill: color, shape, text });
            if (is_debug) this.Debug_Log(node, text);
        },

        SetError(node, is_debug, topic, status) {
            this.SetStatus(node, is_debug, "red", "dot", topic, "fail: " + status);
        },

        CleanStatus(node) { node.status({}); }
    },

    checkStatus(req) {
        const status = req.status;
        if (status === 200) {
            return req;
        } else {
            throw status;
        }
    },

    makeDate(date) {
        return date.split(".").map(i => parseInt(i));
    },

    getBundle(uk) {
        return (uk === "smartuk") ? "pro.wellsoft.smartzhk" : "com.wellsoft." + uk;
    },

    getHost(uk) {
        let host = "";
        uk = renameUk[uk] || uk;
        switch (uk) {
            case "ecvida":
            case "etalon":
            case "ekapark":
            case "citygroup":
                host = uk;
                break;
            case "alternativa":
            case "ten":
            case "prichal":
            case "smartpro":
            case "smartuk":
                host = uk + ".lk";
                break;
            default:
                host = uk + ".lk2";
                break;
        }
        return "https://" + host + ".wellsoft.pro";
    },

    is: (str, length = 1) => (str && str.length > length),
    months: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]
};