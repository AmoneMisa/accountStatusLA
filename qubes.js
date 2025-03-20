export function renderCharacterTable() {
    const tableContainer = document.getElementById('character-table');
    tableContainer.innerHTML = '';

    const charactersList = JSON.parse(localStorage.getItem('charactersList') || '[]');
    const characterSettings= JSON.parse(localStorage.getItem('characterSettings') || '[]');
    const tableData = JSON.parse(localStorage.getItem('tableData') || '{}');
    // Заголовки колонок
    const columnNames = ['3.1', '3.2', '3.3', '3.4', '3.5', '4.1', '4.2'];

    const table = document.createElement('div');
    table.classList.add('character-table');

    let headerRow = '<div class="character-table__row"><div class="character-table__cell character-table__cell_name">Персонаж</div>';
    columnNames.forEach(name => {
        headerRow += `<div class="character-table__cell">${name}</div>`;
    });
    headerRow += '</div>';
    table.innerHTML = headerRow;

    for (const char of charactersList) {
        console.log(characterSettings[char.name])
        if (characterSettings[char.name] && characterSettings[char.name].delete) {
            continue;
        }

        let row = `<div class="character-table__row"><div class="character-table__cell character-table__cell_name">${char.name}</div>`;

        columnNames.forEach(col => {
            let value = tableData[char.name]?.[col] || 0;

            row += `
                <div class="character-table__cell">
                    <input class="character-table__input" type="number" value="${value}" data-char="${char.name}" data-col="${col}">
                    <div class="character-table__controls">
                        <button class="button button_control btn-minus" data-char="${char.name}" data-col="${col}">-</button>
                        <button class="button button_control btn-plus" data-char="${char.name}" data-col="${col}">+</button>
                    </div>
                </div>
            `;
        });
        row += `</div>`;
        table.innerHTML += row;
    }

    tableContainer.appendChild(table);

    // Обработчики событий для кнопок и инпутов
    document.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            let input = document.querySelector(`input[data-char="${btn.dataset.char}"][data-col="${btn.dataset.col}"]`);
            input.value = parseInt(input.value) + 1;
            saveTableData(btn.dataset.char, btn.dataset.col, input.value);
        });
    });

    document.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            let input = document.querySelector(`input[data-char="${btn.dataset.char}"][data-col="${btn.dataset.col}"]`);
            input.value = Math.max(0, parseInt(input.value) - 1);
            saveTableData(btn.dataset.char, btn.dataset.col, input.value);
        });
    });

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', () => {
            saveTableData(input.dataset.char, input.dataset.col, input.value);
        });
    });
}

export function saveTableData(charName, column, value) {
    let tableData = JSON.parse(localStorage.getItem('tableData') || '{}');

    if (!tableData[charName]) {
        tableData[charName] = {};
    }
    console.log("tableData[charName][column]", tableData[charName][column]);
    console.log("tableData", tableData);

    tableData[charName][column] = value;
    localStorage.setItem('tableData', JSON.stringify(tableData));
}