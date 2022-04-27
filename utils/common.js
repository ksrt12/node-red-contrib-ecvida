"use strict";

const renameUk = {
    "vb_group": "vbgroup",
    "cvet_bulvar": "bulvar",
    "co_loft": "loft",
    "aSystem": "aktivsistema",
    "perspectiva": "perspektiva",
};

module.exports = {

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