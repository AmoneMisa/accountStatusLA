import {saveSettings} from "../../utils/utils.js";
import createInputPopup from "./createInputPopup.js";

export default function () {
    renderTodoList();
    initListeners();

    document.querySelector(".check-list-table__button-add").addEventListener("click", () => {
        if (document.querySelector('.check-list-table__popup')) {
            document.querySelector('.check-list-table__popup').classList.add("active");
        } else {
            createInputPopup("check-list-table__popup", "Введите текст задачи:");
        }
    });
}

export function renderTodoList() {
    const todoContainer = document.getElementById("check-list-table");
    todoContainer.innerHTML = "";

    let todos = window.settings.todos || [];
    todos.forEach((todo, index) => {
        addItem(todo, index);
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

export function addItem(todo, index) {
    const todoContainer = document.getElementById("check-list-table");
    let prevElem;

    if (todoContainer.lastChild) {
        prevElem = todoContainer.lastChild.querySelector(".check-list-table__item-delete");
    }

    const item = document.createElement("div");
    item.className = "check-list-table__item";

    const checkbox = document.createElement("input");
    checkbox.className = "check-list-table__checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = todo?.complete ? todo.complete : false;
    checkbox.dataset.index = index ? item : prevElem?.dataset?.index + 1 || 0;

    const textElem = document.createElement("span");
    textElem.className = "check-list-table__item-text";
    textElem.innerText = todo?.text ? todo.text : todo;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "check-list-table__item-delete button button_icon";
    deleteBtn.innerText = "🗑";
    deleteBtn.title = "Удалить";
    deleteBtn.dataset.index = index;

    item.appendChild(checkbox);
    item.appendChild(textElem);
    item.appendChild(deleteBtn);
    todoContainer.appendChild(item);
}