"use strict";

const renameUk = {
    "vb_group": "vbgroup",
    "cvet_bulvar": "bulvar",
    "co_loft": "loft",
    "aSystem": "aktivsistema",
    "perspectiva": "perspektiva",
};

module.exports = {

    func: {
        /** @type {NodeLog} */
        Debug_Log(node, msg_text) {
            node.log(msg_text);
            node.send({ payload: msg_text });
        },

        /** @type {NodeSetStatus} */
        SetStatus(node, is_debug, color, shape, topic, status) {
            const text = topic + ": " + status;
            node.status({ fill: color, shape, text });
            if (is_debug) this.Debug_Log(node, text);
        },

        /** @type {NodeSetError} */
        SetError(node, is_debug, topic, status = "") {
            this.SetStatus(node, is_debug, "red", "dot", topic, status + ": fail");
        },

        /** @type {NodeClean} */
        CleanStatus(node) {
            node.status({});
        }
    },

    /** @type {(req: Response) => Response | Error} */
    checkStatus(req) {
        const status = req.status;
        if (status === 200) {
            return req;
        } else {
            throw status;
        }
    },

    /** @type {(date: string) => number[]} */
    makeDate(date) {
        return date.split(".").map(i => parseInt(i));
    },

    /** @type {(uk: string) => string} */
    getBundle(uk) {
        return (uk === "smartuk") ? "pro.wellsoft.smartzhk" : "com.wellsoft." + uk;
    },

    /** @type {(uk: string) => string} */
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

    /** @type {(str: string, length?: number) => boolean} */
    is: (str, length = 1) => (str && str.length > length),
    months: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]
};