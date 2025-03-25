import axios from 'axios';
import {parse} from 'node-html-parser';
import {stripHtml} from "../../utils/utils.js";

export async function parseLostArkProfile(nickname) {
    try {
        const page = await getCharacterPage(nickname);
        const charNameList = getCharacterList(page, '.profile-character-list__char');
        const characters = [];

        for (let name of charNameList) {
            if (characters.find(char => char.name === name)) {
                continue;
            }

            // УБРАТЬ
            if (name  !== nickname) {
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
            if (!characteristics) {
                continue;
            }

            let engraves = getEngraves(_page);
            if (!engraves) {
                continue;
            }

            let ark = getARK(_page);
            if (!ark) {
                continue;
            }

            let attackPowerGems = getAttackPowerGems(_page);

            let equipmentScriptData = getEquipmentScriptData(_page);
            if (!equipmentScriptData) {
                continue;
            }
            console.log(JSON.parse(stripHtml(equipmentScriptData)).Equip);

            const equipmentData = Object.entries(JSON.parse(stripHtml(equipmentScriptData)))
                .filter(([key]) => key.startsWith('E'))
                .map(([key, value]) => ({
                    key,
                    ...parseEquipmentInfo(value),
                    baseEffect: getBaseEffect(value),
                    polishEffect: getPolishEffect(value),
                    gemBonuses: getGemBonuses(value),
                    braceletEffects: getBraceletEffects(value),
                    engravingEffect: getEngravingEffects(value),
                    elixirs: getElixirs(value),
                }));

            console.log("equipmentData", equipmentData);

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
        console.log("characters", characters);
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
        let engraveQuality = 0;

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

function getElixirs(data) {
    const effects = data?.Element_009?.value?.Element_000?.contentStr || {};
    return Object.values(effects)
        .map(e => e.contentStr)
        .filter(str => str?.includes("Эликсир")) || [];
}

function getBraceletEffects(data) {
    const effects = [];

    // Пробуем стандартные поля
    if (data?.Element_006?.value?.Element_001) effects.push(data.Element_006.value.Element_001);
    if (data?.Element_007?.value?.Element_001) effects.push(data.Element_007.value.Element_001);

    // Проверка на вложенные строки с доп. эффектами
    const content = data?.Element_009?.value?.Element_000?.contentStr || {};
    for (const item of Object.values(content)) {
        if (item.contentStr?.includes("Браслет")) {
            effects.push(item.contentStr);
        }
    }

    return effects;
}

function getEngravingEffects(engraveData) {
    return engraveData?.Element_003?.value?.Element_001 || "";
}

function getPolishEffect(data) {
    return data?.Element_007?.value?.Element_001 || "";
}

function getGemBonuses(data) {
    const bonuses = [];
    const content = data?.Element_009?.value?.Element_000?.contentStr || {};
    for (const item of Object.values(content)) {
        const text = item.contentStr;
        if (/огранк|стигм|эффективн/i.test(text)) {
            bonuses.push(text);
        }
    }
    return bonuses;
}

function getBaseEffect(data) {
    return data?.Element_006?.value?.Element_001 || "";
}

function parseEquipmentInfo(equipmentData) {
    const result = {
        polishLevel: null,             // Качество (0–100)
        refineLevel: null,            // Уровень закалки (в Element_005)
        isHighRefine: false,          // Высшая закалка?
        mainRefineLevel: null,        // Основной уровень (в Element_000)
        itemLevel: null,              // Уровень предмета
        transcendenceStage: null,     // Этап трансценденции
        transcendenceCount: null,     // Кол-во трансценденции
        rarity: null,                 // Реликтовый / Древний и т.д.
    };

    // 📌 Качество (как полировка)
    result.polishLevel = equipmentData.Element_001?.value?.qualityValue ?? null;

    // 📌 Уровень закалки
    const refineText = equipmentData.Element_005?.value || "";
    const refineMatch = refineText.match(/Ур\.\s*<FONT COLOR='#FFD200'>(\d+)<\/FONT>/);
    if (refineMatch) result.refineLevel = parseInt(refineMatch[1], 10);
    result.isHighRefine = refineText.includes("Высшая закалка");

    // 📌 Уровень основной закалки из названия
    const mainText = equipmentData.Element_000?.value || "";
    const mainRefineMatch = mainText.match(/Ур\.\s*(\d+):/);
    if (mainRefineMatch) result.mainRefineLevel = parseInt(mainRefineMatch[1], 10);

    // 📌 Уровень предмета
    const itemLevelText = equipmentData.Element_001?.value?.leftStr2 || "";
    const itemLevelMatch = itemLevelText.match(/Ур\. предмета:\s*(\d+)/);
    if (itemLevelMatch) result.itemLevel = parseInt(itemLevelMatch[1], 10);

    // 📌 Трансценденция
    const transStr = equipmentData.Element_009?.value?.Element_000?.topStr || "";
    const stageMatch = transStr.match(/Этап\s*<FONT COLOR='#FFD200'>(\d+)<\/FONT>/);
    const countMatch = transStr.match(/x(\d+)/);

    if (stageMatch) result.transcendenceStage = parseInt(stageMatch[1], 10);
    if (countMatch) result.transcendenceCount = parseInt(countMatch[1], 10);

    // 📌 Качество предмета (Древний и т.п.)
    const rarityText = equipmentData.Element_001?.value?.leftStr0 || "";
    const rarityMatch = rarityText.match(/<FONT SIZE='12'><FONT COLOR='[^']+'>([^<]+)<\/FONT><\/FONT>/);
    if (rarityMatch) result.rarity = rarityMatch[1];

    return result;
}

function getCostumes(page) {
    let elem = page.querySelector('.profile-avatar__slot');
    return elem ? elem.attributes.alt : null;
}

function getAttackPowerGems(page) {
    let elem = page.querySelector('.default_power');
    let attackPowerRegexp = elem.innerText.match(/(\d+(?:\.\d+)?)%/);
    return attackPowerRegexp ? attackPowerRegexp[1]: null;
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

function getEquipmentScriptData(page) {
    let scriptHolder = page.querySelectorAll('script');
    let script = scriptHolder.find(script => script.innerHTML.includes('$.Profile'));

    return script.innerHTML.replaceAll("\r", "").replaceAll("\n", "").replaceAll("\t", "").trim();
}
