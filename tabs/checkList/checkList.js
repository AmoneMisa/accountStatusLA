import {saveSettings} from "../../utils/utils.js";
import createInputPopup from "./createInputPopup.js";

export default function () {
    renderTodoList();
    initListeners();

    document.querySelector(".check-list-table__button-add").addEventListener("click", () => {
        createInputPopup("check-list-table__popup", "Введите текст задачи:");
    });
}

export function renderTodoList() {
    const todoContainer = document.getElementById("check-list-table");
    todoContainer.innerHTML = "";

    let todos = window.settings.todos || [];
    todos.forEach((todo, index) => {
        const item = document.createElement("div");
        item.className = "check-list-table__item";

        const checkbox = document.createElement("input");
        checkbox.className = "check-list-table__checkbox";
        checkbox.type = "checkbox";
        checkbox.checked = todo.complete;
        checkbox.dataset.index = index;

        const text = document.createElement("span");
        text.className = "check-list-table__item-text";
        text.innerText = todo.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "check-list-table__item-delete button button_icon";
        deleteBtn.innerText = "🗑";
        deleteBtn.title = "Удалить";
        deleteBtn.dataset.index = index;

        item.appendChild(checkbox);
        item.appendChild(text);
        item.appendChild(deleteBtn);
        todoContainer.appendChild(item);
    });
}

export function initListeners() {
    const checkboxElems = document.querySelectorAll(".check-list-table__checkbox");
    let todos = window.settings.todos || [];

    checkboxElems.forEach(checkbox => {
        checkbox.removeEventListener("change", () => {
            todos[checkbox.dataset.index].complete = checkbox.checked;
            saveSettings({todos: todos});
        });

        checkbox.addEventListener("change", () => {
            todos[checkbox.dataset.index].complete = checkbox.checked;
            saveSettings({todos: todos});
        });
    })

    const deleteBtnElems = document.querySelectorAll(".check-list-table__item-delete");

    deleteBtnElems.forEach(deleteBtn => {
        deleteBtn.removeEventListener("click", () => {
            todos.splice(+deleteBtn.dataset.index, 1);
            saveSettings({todos: todos});
            deleteBtn.closest(".check-list-table__item").remove();
        });

        deleteBtn.addEventListener("click", () => {
            todos.splice(+deleteBtn.dataset.index, 1);
            saveSettings({todos: todos});
            deleteBtn.closest(".check-list-table__item").remove();
        });
    })
}

export function addItem(text) {
    const todoContainer = document.getElementById("check-list-table");
    const prevElem = todoContainer.lastChild.querySelector(".check-list-table__item-delete");

    const item = document.createElement("div");
    item.className = "check-list-table__item";

    const checkbox = document.createElement("input");
    checkbox.className = "check-list-table__checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = false;
    checkbox.dataset.index = prevElem.dataset.index + 1;

    const textElem = document.createElement("span");
    textElem.className = "check-list-table__item-text";
    textElem.innerText = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "check-list-table__item-delete button button_icon";
    deleteBtn.innerText = "🗑";
    deleteBtn.title = "Удалить";
    deleteBtn.dataset.index = prevElem.dataset.index + 1;

    item.appendChild(checkbox);
    item.appendChild(textElem);
    item.appendChild(deleteBtn);
    todoContainer.appendChild(item);
}