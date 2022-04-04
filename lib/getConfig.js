"use strict";

const fetchGet = require("./fetchGet");

/** @type {getConfig} */
module.exports = async ({ flatId, host, defHeaders, SetStatus, SetError, Debug_Log }) => {
    const topic = "Ckeck";

    SetStatus("yellow", "ring", topic, "token");
    let settings = await fetchGet({ topic, url: host + "/api/Config/GetSettings", headers: defHeaders, SetError });

    if (settings.isSuccess) {
        SetStatus("green", "ring", topic, "flat ID");

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
            SetStatus("green", "dot", topic, "ok");
            return flatId;
        } else {
            if (flats.length === 1) {
                Debug_Log("Скопируйте ID квартиры в login-ecvida: " + flats[0].id);
            } else {
                Debug_Log(`Обнаружено ${flats.length} квартира(ы) у пользователя ${settings.data.human.name}`);
                Debug_Log(flats);
                Debug_Log("Скопируйте ID нужной квартиры в login-ecvida");
            }
            return flats[0].id;
        }

    } else {
        SetError(topic, "token");
        Debug_Log(settings.error.message);
        return false;
    }
};