export default function () {
    const messageElem = document.querySelector('#calc-bracelet-result');
    const button = document.querySelector('#calc-bracelet-button');

    button.addEventListener('click', (e) => {
        const nickname = document.querySelector('.calc-bracelet__input-nickname').value;
        if (!nickname) {
            messageElem.innerText = "Введите корректное имя персонажа";
            return;
        }

        const character = window.settings.characterList[nickname];

        if (!character) {
            messageElem.innerText = "Персонаж с таким ником не найден в существующем списке персонажей";
            return;
        }

        const data = {
            additionalDamageWeapon: parseFloat(character.equipment.equip.additionalDamage),
            attackPowerGems: parseFloat(character.attackPowerGems),
            critBaseCharacteristic: parseInt(character.characteristics["Смертоносность"]),
            // masteryBaseCharacteristic: parseInt(character.characteristics["Мастерство"]),
            // swiftBaseCharacteristic: parseInt(character.characteristics["Сноровка"]),
        };

        let totalDamage = 0;

        // Некля
        let necklace = character.equipment.accessorizes["006"];
        if (necklace) {
            if (necklace.effects["Дополнительный урон"]) {
                data["additionalDamageNecklace"] = parseFloat(necklace.effects["Дополнительный урон"]).toFixed(2);
            }

            if (necklace.effects["Наносимый урон"]) {
                data["baseDamageNecklace"] = parseFloat(necklace.effects["Наносимый урон"]).toFixed(2);
            }
        }

        // Кольцо 1
        let ring1 = character.equipment.accessorizes["009"];
        if (ring1) {
            if (ring1.effects["Шанс критического удара"]) {
                data["critChanceRing"] = parseFloat(ring1.effects["Шанс критического удара"]).toFixed(2);
            }

            if (ring1.effects["Критический урон"]) {
                data["critDamageRing"] = parseFloat(ring1.effects["Критический урон"]).toFixed(2);
            }
        }

        // Кольцо 2
        let ring2 = character.equipment.accessorizes["010"];
        if (ring2) {
            if (ring2.effects["Шанс критического удара"]) {
                data["critChanceRing"] += parseFloat(ring2.effects["Шанс критического удара"]).toFixed(2);
            }

            if (ring2.effects["Критический урон"]) {
                data["critDamageRing"] += parseFloat(ring2.effects["Критический урон"]).toFixed(2);
            }
        }

        let bracelet = character.equipment.accessorizes.bracelet;
        if (bracelet) {
            // if (bracelet.effects["Мастерство"]) {
            //     data["masteryBraceletCharacteristic"] = bracelet.effects["Мастерство"];
            // }

            if (bracelet.effects["Смертоносность"]) {
                data["critBraceletCharacteristic"] = bracelet.effects["Смертоносность"];
            }

            // if (bracelet.effects["Сноровка"]) {
            //     data["swiftBraceletCharacteristic"] = bracelet.effects["Сноровка"];
            // }

            if (bracelet.effects["Дополнительный урон"]) {
                data["additionalDamageBracelet"] = bracelet.effects["Дополнительный урон"];
            }

            if (bracelet.effects["Критический урон"]) {
                data["critDamageBracelet"] = bracelet.effects["Критический урон"];
            }

            if (bracelet.effects["Шанс критического удара"]) {
                data["critChanceBracelet"] = bracelet.effects["Шанс критического удара"];
            }

            if (bracelet.effects["Наносимый урон повышается на"]) {
                data["baseDamageBracelet"] = bracelet.effects["Наносимый урон повышается на"];
            }
        }

        messageElem.innerText = Math.floor(multiplier);
    });
}

function getTotalCritChance(data) {
    let result = 0;

    if (data.critChanceRing) {
        result += data.critChanceRing;
    }

    if (data.critChanceBracelet) {
        result += data.critChanceBracelet;
    }

    if (data.critBraceletCharacteristic) {
        result += data.critBraceletCharacteristic * 0.03576;
    }

    return result;
}

function getTotalCritDamage(data) {
    let result = 0;

    if (data.critDamageRing) {
        result += data.critDamageRing;
    }

    if (data.critDamageBracelet) {
        result += data.critDamageBracelet;
    }

    return result;
}

function getTotalBaseDamage(data) {
    let result = 0;

    if (data.baseDamageBracelet) {
        result += data.baseDamageBracelet;
    }

    if (data.baseDamageNecklace) {
        result += data.baseDamageNecklace;
    }

    if (data.baseDamageNecklace) {
        result += data.baseDamageNecklace;
    }

    return result;
}

function getTotalAdditionalDamage(data) {
    let result = 0;
    if (data.additionalDamageBracelet) {
        result += data.additionalDamageBracelet;
    }

    if (data.additionalDamageNecklace) {
        result += data.additionalDamageNecklace;
    }

    result += data.additionalDamageWeapon;

    return result;
}