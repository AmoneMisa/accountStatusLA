export default function () {
    document.getElementById('card-count').addEventListener('change', function () {
        const count = parseInt(this.value);
        const container = document.getElementById('card-inputs');
        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('tools-container__item-label');
            wrapper.classList.add('calc-cards__item');

            wrapper.innerHTML = `
      Карта ${i + 1}
      <select class="calc-cards__select" name="level">
        <option value="0">Уровень 0</option>
        <option value="1">Уровень 1</option>
        <option value="2">Уровень 2</option>
        <option value="3">Уровень 3</option>
        <option value="4">Уровень 4</option>
        <option value="5">Уровень 5 (макс)</option>
      </select>
      <input type="number" class="calc-cards__plus tools-container__item-input" name="plus" placeholder="Дополнительные карты" min="0" max="15"/>
    `;
            container.appendChild(wrapper);
        }
    });

    document.getElementById('calculate-cards').addEventListener('click', () => {
        const upgradeCost = [0, 1, 2, 3, 4, 5];
        const maxCards = 16;
        const levels = document.querySelectorAll('.calc-cards__select');
        const pluses = document.querySelectorAll('.calc-cards__plus');

        let totalNeeded = 0;
        let resultText = '';

        for (let i = 0; i < levels.length; i++) {
            const level = parseInt(levels[i].value);
            const plus = parseInt(pluses[i].value) || 0;

            // Сколько уже потрачено карт:
            let used = 1; // 1 — за саму карту
            for (let j = 1; j <= level; j++) {
                used += upgradeCost[j];
            }

            const haveTotal = used + plus;
            const missing = Math.max(0, maxCards - haveTotal);
            totalNeeded += missing;

            const currentTotal = upgradeCost[level] + plus; // сколько уже есть
            const progressPercent = Math.min((currentTotal / totalNeeded) * 100, 100);

            resultText += `Карта ${i + 1}: не хватает ${missing} карт
<div class="calc-cards__card-progress-container">
<div class="calc-cards__card-progress-bar" style="width: ${progressPercent}%;"></div>
</div>`;
        }

        resultText += `<br><strong>Всего не хватает: ${totalNeeded} карт</strong>`;
        document.getElementById('calc-cards__result').innerHTML = resultText;
    });
}
