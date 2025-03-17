import { getCharacters, saveCharacters } from './utils.js';

document.addEventListener("DOMContentLoaded", async () => {
    const characterList = document.getElementById("character-list");
    let characters = await getCharacters();

    function renderCharacters() {
        characterList.innerHTML = ""; // Очищаем список перед рендером

        // Сортируем по правилам: Легат → Золотополучатели → Избранные → Прочие (по убыванию ГС)
        characters.sort((a, b) => {
            if (a.isLegat) return -1;
            if (b.isLegat) return 1;
            if (a.isGoldReceiver && !b.isGoldReceiver) return -1;
            if (!a.isGoldReceiver && b.isGoldReceiver) return 1;
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return b.gearScore - a.gearScore;
        });

        characters.forEach((char, index) => {
            const charCard = document.createElement("div");
            charCard.classList.add("character-card");
            charCard.innerHTML = `
                <div class="char-info">
                    <h3>${char.name}</h3>
                    <p>${char.className} | ГС: ${char.gearScore}</p>
                </div>
                <div class="char-actions">
                    <button class="btn legat ${char.isLegat ? 'active' : ''}" data-index="${index}">👑</button>
                    <button class="btn favorite ${char.isFavorite ? 'active' : ''}" data-index="${index}">❤️</button>
                    <button class="btn gold ${char.isGoldReceiver ? 'active' : ''}" data-index="${index}">💰</button>
                    <button class="btn delete" data-index="${index}">❌</button>
                </div>
            `;

            characterList.appendChild(charCard);
        });

        attachEventListeners();
    }

    function attachEventListeners() {
        document.querySelectorAll(".legat").forEach(btn => btn.addEventListener("click", toggleLegat));
        document.querySelectorAll(".favorite").forEach(btn => btn.addEventListener("click", toggleFavorite));
        document.querySelectorAll(".gold").forEach(btn => btn.addEventListener("click", toggleGoldReceiver));
        document.querySelectorAll(".delete").forEach(btn => btn.addEventListener("click", deleteCharacter));
    }

    function toggleLegat(event) {
        const index = event.target.dataset.index;
        characters.forEach(char => (char.isLegat = false)); // Сбрасываем других легатов
        characters[index].isLegat = true;
        saveCharacters(characters);
        renderCharacters();
    }

    function toggleFavorite(event) {
        const index = event.target.dataset.index;
        characters[index].isFavorite = !characters[index].isFavorite;
        saveCharacters(characters);
        renderCharacters();
    }

    function toggleGoldReceiver(event) {
        const index = event.target.dataset.index;
        const goldReceivers = characters.filter(c => c.isGoldReceiver).length;

        if (!characters[index].isGoldReceiver && goldReceivers >= 6) return; // Ограничение в 6
        characters[index].isGoldReceiver = !characters[index].isGoldReceiver;

        saveCharacters(characters);
        renderCharacters();
    }

    function deleteCharacter(event) {
        const index = event.target.dataset.index;
        characters.splice(index, 1);
        saveCharacters(characters);
        renderCharacters();
    }

    renderCharacters();
});
