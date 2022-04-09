"use strict";

const fetchGet = require("./fetchGet");

/** @type {getConfig} */
module.exports = async ({ isBalance, flatId, host, defHeaders, SetStatus, SetError, Debug_Log }) => {
    const topic = "Ckeck";

    if (isBalance) {
        SetStatus = () => { };
    }
    SetStatus("yellow", "ring", topic, "token");
    /** @type {ansConfig} */
    let settings = await fetchGet({ topic, url: host + "/api/Config/GetSettings", headers: defHeaders, SetError });

    if (settings.isSuccess) {
        SetStatus("green", "ring", topic, "flat ID");

        /** @type {flatObj[]} */
        let flats = [];
        let foundFlat = false;
        for (let flat of settings.data.roomsList) {
            flats.push({
                id: flat.id,
                adress: flat.fullAdress,
                balance: flat.balanceDecimal
            });
            if (flatId === flat.id) {
                foundFlat = true;
                break;
            }
        }

        if (foundFlat) {
            SetStatus("green", "dot", topic, "ok");
        } else {
            flatId = flats[0].id;
            if (flats.length > 1) {
                Debug_Log(`Обнаружено ${flats.length} квартира(ы) у пользователя ${settings.data.human.name}`);
                Debug_Log(flats);
                Debug_Log("Скопируйте ID нужной квартиры в login-ecvida; по умолчанию выставлен ID: " + flatId);
            }
        }

        return (isBalance) ? flats[0] : flatId;

    } else {
        SetError(topic, "token");
        Debug_Log(settings.error.message);
    }
};