import axios from 'axios';
import {parse} from 'node-html-parser';

export async function parseLostArkProfile(nickname, isSingle) {
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

            characters.push({
                name,
                gearScore,
                className
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