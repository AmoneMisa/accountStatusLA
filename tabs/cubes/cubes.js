import {saveSettings} from "../../utils.js";

export function renderCharacterTable() {
    const tableContainer = document.getElementById('character-table');
    tableContainer.innerHTML = '';

    const charactersList = window.settings.characterList || [];
    let characterSettings = window.settings.characterSettings || {};
    const tableData = window.settings.tableData || {};
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
        if (characterSettings[char.name] && characterSettings[char.name].delete) {
            continue;
        }

        const isSupport = ['Художница', 'Менестрель', 'Паладин'].includes(char.className);
        let row = `<div class="character-table__row"><div class="character-table__cell character-table__cell_name ${isSupport ? 'character-table_support' : 'character-table_dd'}">${char.name}</div>`;

        columnNames.forEach(col => {
            let value = tableData[char.name]?.[col] || 0;

            row += `
                <div class="character-table__cell">
                    <input class="character-table__input" type="number" value="${value}" data-char="${char.name}" data-col="${col}" min="0">
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

    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                input.value = 0;
            }
        });

        input.addEventListener('input', () => {
            if (input.value === '') {
                input.value = 0;
            }
        });

        input.addEventListener('keydown', (event) => {
            if ((event.key === 'Delete' || event.key === 'Backspace') && input.value.length === 1) {
                input.value = 0;
                event.preventDefault(); // Останавливаем дальнейшее удаление
            }
        });
    });
}

export function saveTableData(charName, column, value) {
    let tableData = window.settings.tableData || {};

    if (!tableData[charName]) {
        tableData[charName] = {};
    }

    tableData[charName][column] = value;
    saveSettings({tableData: tableData});
}