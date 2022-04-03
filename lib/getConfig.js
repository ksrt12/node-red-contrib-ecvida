"use strict";

const fetchGet = require("./fetchGet");

/**
 * 
 * @param {object} param
 * @param {string} param.flatId Flat ID
 * @param {string} param.host Host
 * @param {object} param.defHeaders Headers
 * @param {function} param.SetStatus SetStatus Function
 * @param {function} param.SetError SetError Function
 * @param {function} param.Debug_Log Log Function
 * @returns {Promise<string>} Room number
 */
module.exports = async ({ flatId, host, defHeaders, SetStatus, SetError, Debug_Log }) => {
    const topic = "Ckeck";

    SetStatus("blue", "ring", topic + " token", "begin");
    let settings = await fetchGet(host + "/api/Config/GetSettings", defHeaders, SetError, topic);

    if (settings.isSuccess) {
        SetStatus("yellow", "ring", topic + " flat", "begin");

        let flats = [];
        let foundFlat = false;
        for (let flat of settings.data.roomsList) {
            if (flatId === String(flat.id)) {
                foundFlat = true;
                break;
            }
            flats.push({
                id: String(flat.id),
                adress: flat.fullAdress
            });
        }

        if (foundFlat) {
            SetStatus("green", "ring", topic, "ok");
            return flatId;
        } else {
            Debug_Log(`Обнаружено ${flats.length} квартира(ы) у пользователя ${settings.data.human.name}`);
            Debug_Log(flats);
            Debug_Log("Скопируйте ID нужной квартиры в login-ecvida");
            return flats[0].id;
        }

    } else {
        SetError(topic + " token", "");
        Debug_Log(check.error.message);
        return false;
    }
};