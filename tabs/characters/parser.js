import axios from 'axios';
import {parse} from 'node-html-parser';

export async function parseLostArkProfile(nickname) {
    try {
        const page = await getCharacterPage(nickname);
        const charNameList = getCharacterList(page, '.profile-character-list__char');
        const characters = [];

        for (let name of charNameList) {
            if (characters.find(char => char.name === name)) {
                continue;
            }

            let _page = await getCharacterPage(name);
            let gearScore = getGearScore(_page);
            if (!gearScore) {
                continue;
            }

            let className = getClassName(_page);
            if (!className) {
                continue;
            }

            let characteristics = getCharacteristics(_page);
            let engraves = getEngraves(_page);
            let ark = getARK(_page);
            let attackPowerGems = getAttackPowerGems(_page);

            let equipmentScriptData = getEquipmentScriptData(_page);
            if (!equipmentScriptData) {
                continue;
            }

            // Добавить нормальный парсер для эквипа
            const equipmentData = {
                gemBonuses: {},
                equip: {},
                elixirs: {},
                accessorizes: {},
                stone: {},
                bracelet: {}
            };

            for (let [key, value] of Object.entries(equipmentScriptData.Equip)) {
                let _key = shorterKey(key);

                if (_key.includes("Gem")) {
                    equipmentData["gemBonuses"][_key] = getGemBonuses(_key, value);
                } else if (_key < "006") {
                    equipmentData["equip"][_key] = (parseEquipmentInfo(_key, value));

                    if (_key > "000") {
                        equipmentData["elixirs"][_key] = (getElixirs(_key, value));
                    }
                } else if (_key > "005" && _key < "011") {
                    equipmentData["accessorizes"][_key] = (getAccessorize(_key, value));
                } else if (_key === "011") {
                    equipmentData["stone"] = (getStone(_key, value));
                } else if (_key === "026") {
                    equipmentData["bracelet"] = (getBracelet(_key, value));
                }
            }

            if (!equipmentData) {
                continue;
            }

            characters.push({
                name,
                gearScore,
                className,
                ark,
                attackPowerGems,
                characteristics,
                engraves,
                equipment: equipmentData
            });

            await new Promise(res => setTimeout(res, 1000));
        }

        characters.sort((a, b) => b.gearScore - a.gearScore);
        return characters;
    } catch (err) {
        console.error('Ошибка парсинга:', err);
        return null;
    }
}

export function getCharacterList(page, listSelector) {
    return page.querySelector(listSelector)
        .innerText.replaceAll(/Ур\.\d+/g, '')
        .split(/\s/)
        .filter(name => name !== '');
}

export async function getCharacterPage(nickname) {
    try {
        const response = await axios.get(`https://xn--80aubmleh.xn--p1ai/%D0%9E%D1%80%D1%83%D0%B6%D0%B5%D0%B9%D0%BD%D0%B0%D1%8F/${nickname}`);
        return parse(response.data);
    } catch (e) {
        console.error('Ошибка получения оружейной:', nickname, e);
        return null;
    }
}

export function getGearScore(page) {
    let elem = page.querySelector('.level-info2__item');
    return elem ? elem.innerText.match(/[\d,.]+/)[0].replace(".", "") : null;
}

export function getClassName(page) {
    let elem = page.querySelector('.profile-character-info__img');
    return elem ? elem.attributes.alt : null;
}

export function getCharacteristics(page) {
    let elem = page.querySelector('.profile-ability-battle');
    let statsArray = elem.innerText.replace("Боевые", "")
        .split('\n')
        .map(line => line.trim())
        .filter(line => /^[А-Яа-яЁё]+\s+\d+$/.test(line))
        .flatMap(line => line.split(' '));

    let stats = {};
    stats[statsArray[0]] = statsArray[1];
    stats[statsArray[2]] = statsArray[3];
    stats[statsArray[4]] = statsArray[5];
    stats[statsArray[6]] = statsArray[7];
    stats[statsArray[8]] = statsArray[9];
    stats[statsArray[10]] = statsArray[11];

    return stats;
}

function getEngraves(page) {
    let elem = page.querySelector('.profile-ability-engrave');
    let engravesElems = elem.querySelectorAll("li");
    let engraves = [];

    engravesElems.forEach(elem => {
        let engrave = {};
        let engraveData = elem.querySelectorAll('font');
        let engraveQualityElems = elem.querySelectorAll('em');
        let engraveName = engraveData[0].innerText;
        let engraveLevel = engraveData[1].innerText;
        let engraveQuality;

        if (engraveQualityElems.length > 1) {
            engraveQuality = engraveQualityElems[1].classList.value[0].split("_");
        } else {
            engraveQuality = engraveQualityElems[0].classList.value[0].split("_");
        }

        let quality = engraveQuality[engraveQuality.length - 1];

        engrave[engraveName] = {level: engraveLevel, quality: quality};
        engraves.push(engrave);
    });

    return engraves;
}

function getElixirs(key, data) {
    if (key < "001" || key > "005") {
        return;
    }

    const result = {};
    const lines = data.Element_010?.value?.Element_000?.contentStr?.Element_000?.contentStr.split(/<br>|<BR>/i);

    if (lines) {
        for (const line of lines) {
            const match = line.match(/([\w\sёЁА-Яа-я]+)\s*([+-]?\d+(?:[.,]\d+)?)/);
            if (match) {
                let key = match[1].trim();
                result[key] = parseFloat(match[2].replace(',', '.'));
            }
        }
    }

    const lines2 = data.Element_010?.value?.Element_000?.contentStr?.Element_001?.contentStr.split(/<br>|<BR>/i);
    if (lines2) {
        for (const line of lines2) {
            const match = line.match(/([\w\sёЁА-Яа-я]+)\s*([+-]?\d+(?:[.,]\d+)?)/);
            if (match) {
                let key = match[1].trim();
                result[key] = parseFloat(match[2].replace(',', '.'));
            }
        }
    }

    return result;
}

function getBracelet(key, data) {
    if (key !== "026") {
        return;
    }

    const result = {};
    result["rarity"] = data?.Element_001?.value?.leftStr0.match(/<FONT[^>]*>([^<]+)<\/FONT>/)[1];

    const effects = data?.Element_004?.value?.Element_001 || {};
    result["effects"] = (parseBraceletEffects(effects));

    return result;
}

function parseBraceletEffects(data) {
    const effects = {};
    const regex = /<\/img>\s*([^<]+?)\s*\+([\d.]+)/g;
    let match;
    while ((match = regex.exec(data)) !== null) {
        const key = match[1].trim();
        effects[key] = parseFloat(match[2]);
    }
    return effects;
}

function getStone(key, data) {
    const result = {
        rarity: {},
        base: {},
        bonus: {},
        effects: {}
    };
    result["rarity"] = data?.Element_001?.value?.leftStr0.match(/<FONT[^>]*>([^<]+)<\/FONT>/)[1];

    let base = data?.Element_004.value?.Element_001.match(/^(.+?)\s*\+([\d.]+)$/);
    result["base"][base[1]] = parseFloat(base[2]);

    let bonus = data?.Element_005.value?.Element_001.match(/^(.+?)\s*\+([\d.]+)$/);
    result["bonus"][bonus?.[1].trim()] = parseFloat(bonus?.[2]);

    let effects = data?.Element_006.value?.Element_000?.contentStr;

    let effect1 = effects?.Element_000?.contentStr.match(/\[?<FONT COLOR='[^']*'>([^<]+)<\/FONT>]?\s*.*?\(ур\. (\d+)\)/);
    result["effects"][effect1[1]] = parseInt(effect1[2], 10);

    let effect2 = effects?.Element_001?.contentStr.match(/\[?<FONT COLOR='[^']*'>([^<]+)<\/FONT>]?\s*.*?\(ур\. (\d+)\)/);
    result["effects"][effect2[1]] = parseInt(effect2[2], 10);

    let effect3 = effects?.Element_002?.contentStr.match(/\[?<FONT COLOR='[^']*'>([^<]+)<\/FONT>]?\s*.*?\(ур\. (\d+)\)/);
    result["effects"][effect3[1]] = parseInt(effect3[2], 10);

    return result;
}

function getGemBonuses(key, data) {
    if (!key.includes("Gem")) {
        return;
    }

    const result = data.Element_006.value.Element_001.match(/\d+(?:[.,]\d+)?/g);
    return result ? parseFloat(result.at(-1).replace(',', '.')) : null;
}

function parseEquipmentInfo(key, equipmentData) {
    if (key.includes("Gem") || key > "005") {
        return;
    }

    const result = {
        polishLevel: null,             // Качество (0–100)
        refineLevel: null,            // Уровень закалки
        highRefineLevel: null,        // Уровень высшей закалки (в названии)
        itemLevel: null,              // Уровень предмета
        transcendenceStage: null,     // Этап трансценденции
        transcendenceCount: null,     // Кол-во трансценденции
        rarity: null                 // Реликтовый / Древний и т.п.
    };

    // Полировка
    result.polishLevel = equipmentData?.Element_001?.value?.qualityValue ?? null;

    // Закалка
    const refineHtml = equipmentData?.Element_000?.value || "";
    const refineMatch = refineHtml.match(/Ур\.\s*(\d+)/i);
    if (refineMatch) {
        result.refineLevel = parseInt(refineMatch[1], 10);
    }

    // Высшая закалка
    const nameHtml = equipmentData?.Element_005?.value || "";

    if (nameHtml && typeof nameHtml === "string") {
        const mainRefineMatch = nameHtml.match(/Ур\.\s*<FONT[^>]*>(\d+)<\/FONT>/i);
        if (mainRefineMatch) {
            result.highRefineLevel = parseInt(mainRefineMatch[1], 10);
        }
    } else if (nameHtml && typeof nameHtml === "object") {
        const result = Object.fromEntries(
            nameHtml?.Element_001.split('<BR>').map(line => {
                const [key, value] = line.split(' +');
                return [key.trim(), parseInt(value.trim(), 10)];
            })
        );

        if (result) {
            result.baseEffects = result;
        }
    }

    //Общий уровень предмета
    const levelStr = equipmentData?.Element_001?.value?.leftStr2 || "";
    const itemLevelMatch = levelStr.match(/Ур\. предмета:\s*(\d+)/);
    if (itemLevelMatch) {
        result.itemLevel = parseInt(itemLevelMatch[1], 10);
    }

    // 📌 5. Трансценденция (в Element_009 → Element_000 → topStr)
    const transText = equipmentData?.Element_009?.value?.Element_000?.topStr || "";
    const transStageMatch = transText.match(/Этап\s*<FONT COLOR=['"][^'"]+['"]>(\d+)<\/FONT>/);
    const transCountMatch = transText.match(/x(\d+)/);
    if (transStageMatch) {
        result.transcendenceStage = parseInt(transStageMatch[1], 10);
    }

    if (transCountMatch) {
        result.transcendenceCount = parseInt(transCountMatch[1], 10);
    }

    // 📌 6. Редкость (в Element_001 → leftStr0)
    const rarityStr = equipmentData?.Element_001?.value?.leftStr0 || "";
    const rarityMatch = rarityStr.match(/<FONT SIZE=['"]12['"]><FONT COLOR=['"][^'"]+['"]>([^<]+)<\/FONT><\/FONT>/i);
    if (rarityMatch) {
        result.rarity = rarityMatch[1].trim();
    }

    return result;
}

function getCostumes(page) {
    let elem = page.querySelector('.profile-avatar__slot');
    return elem ? elem.attributes.alt : null;
}

function getAttackPowerGems(page) {
    let elem = page.querySelector('.default_power');
    let attackPowerRegexp = elem.innerText.match(/(\d+(?:\.\d+)?)%/);
    return attackPowerRegexp ? attackPowerRegexp[1] : null;
}

function getARK(page) {
    let elem = page.querySelector('#profile-skill-arkpassive-all');

    if (!elem) {
        return null;
    }

    let arkElems = elem.querySelectorAll('.profile-arkpassive__info');
    let ark = {
        "Экспансия": [],
        "Становление": [],
        "Прогресс": [],
    };

    for (let arkElement of arkElems) {
        let arkInfoElems = arkElement.querySelectorAll('font');
        ark[arkInfoElems[0].innerText].push(arkInfoElems[1].innerText);
    }

    return ark;
}

function getAccessorize(key, data) {
    if (key.includes("Gem") || key < "006" || key > "010") {
        return;
    }

    let result = {};
    result.quality = data?.Element_001?.value?.qualityValue;
    result.rarity = data?.Element_001?.value?.leftStr0.match(/<FONT COLOR='[^']*'>([^<]+)<\/FONT>/)[1].trim();
    result.effects = getAccessorizeEffects(data?.Element_005.value?.Element_001);
    result.stats = getAccessorizesBaseStats(data?.Element_004.value?.Element_001);

    return result;
}

function getAccessorizesBaseStats(data) {
    if (!data) {
        return ;
    }

    const result = {};
    const cleanStr = data.replace(/<[^>]+>/g, '');
    const lines = cleanStr.split(/<BR>|[\r\n]+/);

    for (const line of lines) {
        const parts = line.trim().match(/([А-Яа-яёA-Za-z.() ]+)\s*\+([\d.]+)/g);
        if (!parts) {
            continue;
        }

        for (const part of parts) {
            const match = part.match(/^(.+?)\s*\+([\d.]+)$/);
            if (match) {
                const key = match[1].trim();
                result[key] = parseFloat(match[2]);
            }
        }
    }

    return result;
}

function getAccessorizeEffects(data) {
    if (!data) {
        return ;
    }
    let result = {};
    const clean = data.replace(/<img[^>]*>/g, '');
    const lines = clean.split('<BR>');

    for (const line of lines) {
        const match = line.match(/(.+?)\s+([+-]?\d+(\.\d+)?%?)/);
        if (match) {
            const key = match[1].trim();
            const valueRaw = match[2].trim();
            result[key] = valueRaw.endsWith('%')
                ? parseFloat(valueRaw) / 100
                : parseFloat(valueRaw);
        }
    }

    return result;
}

function getEquipmentScriptData(page) {
    let scriptHolder = page.querySelectorAll('script');
    let script = scriptHolder.find(script => script.innerHTML.includes('$.Profile'));

    let result = "(function () {return " + script.innerText.replace("$.Profile =", "").trim() + "})()";

    return eval(result);
}

function shorterKey(key) {
    return key.substring(8).replace(/^_/, "");
}