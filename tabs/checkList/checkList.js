import {saveSettings} from "../../utils.js";

export default function () {
    document.querySelector(".check-list-table__button-add").addEventListener("click", () => {
        const text = prompt("Введите текст задачи:");
        if (text?.trim()) {
            saveSettings({ todos: {text: text, complete: false} });
            renderTodoList();
        }
    });
}

function renderTodoList() {
    const todoContainer = document.getElementById("check-list-table");
    todoContainer.innerHTML = "";

    const todos = window.settings.todos || [];

    todos.forEach((todo, index) => {
        const item = document.createElement("div");
        item.className = "check-list-table__item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.done;
        checkbox.addEventListener("change", () => {
            todos[index].done = checkbox.checked;
            saveSettings({ todos: todos });
        });

        const text = document.createElement("span");
        text.className = "check-list-table__item-text";
        text.innerText = todo.text;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "check-list-table__item-delete";
        deleteBtn.innerText = "🗑";
        deleteBtn.title = "Удалить";
        deleteBtn.addEventListener("click", () => {
            saveSettings({ todos: todos.splice(index, 1) });
            renderTodoList();
        });

        item.appendChild(checkbox);
        item.appendChild(text);
        item.appendChild(deleteBtn);
        todoContainer.appendChild(item);
    });
}