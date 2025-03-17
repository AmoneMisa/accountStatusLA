import fs from 'fs/promises';

const FILE_PATH = './characters.json';

export async function getCharacters() {
    try {
        const data = await fs.readFile(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Ошибка чтения персонажей:", error);
        return [];
    }
}

export async function saveCharacters(characters) {
    try {
        await fs.writeFile(FILE_PATH, JSON.stringify(characters, null, 2), 'utf8');
    } catch (error) {
        console.error("Ошибка сохранения персонажей:", error);
    }
}