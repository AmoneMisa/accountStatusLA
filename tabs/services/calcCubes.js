export default function () {
    const needLevelInput = document.querySelector('.calc-cubes__need-level-input');
    const inputs = document.querySelectorAll('.calc-cubes__input');
    const resultEl = document.querySelector('.calc-cubes__all');
    const clearBtn = document.querySelector('.calc-cubes__clean');

    const cubeDrop = {
        'T4-1': 3,
        'T4-2': 6
    };

    function convertToLevel2Amount(level, count) {
        return count * Math.pow(3, level - 2);
    }

    function calculate() {
        const targetLevel = parseInt(needLevelInput.value);
        if (isNaN(targetLevel) || targetLevel < 2 || targetLevel > 10) {
            resultEl.innerHTML = "Введите уровень от 2 до 10";
            return;
        }

        const requiredGems = Math.pow(3, targetLevel - 2); // нужное количество 2 ур. камней
        let onHand = 0;

        inputs.forEach(input => {
            const level = parseInt(input.name);
            const count = parseInt(input.value) || 0;
            onHand += convertToLevel2Amount(level, count);
        });

        const gemsNeeded = Math.max(requiredGems - onHand, 0);

        const fullT41 = Math.ceil(requiredGems / cubeDrop['T4-1']);
        const fullT42 = Math.ceil(requiredGems / cubeDrop['T4-2']);

        const needT41 = Math.ceil(gemsNeeded / cubeDrop['T4-1']);
        const needT42 = Math.ceil(gemsNeeded / cubeDrop['T4-2']);

        resultEl.innerHTML = `
            🔹 <b>Без учёта</b> ваших камней:<br>
            ▫️ T4-1: <b>${fullT41}</b> кубов<br>
            ▫️ T4-2: <b>${fullT42}</b> кубов<br><br>
            🔸 <b>С учётом</b> ваших камней:<br>
            ▫️ T4-1: <b>${needT41}</b> кубов<br>
            ▫️ T4-2: <b>${needT42}</b> кубов
        `;
    }

    needLevelInput.addEventListener('input', calculate);
    inputs.forEach(input => input.addEventListener('input', calculate));

    clearBtn.addEventListener('click', () => {
        needLevelInput.value = '';
        inputs.forEach(input => input.value = '');
        resultEl.innerHTML = '';
    });
}

