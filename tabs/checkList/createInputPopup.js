import {saveSettings} from "../../utils/utils.js";
import {addItem, initListeners} from "./checkList.js";

export default function (className, text) {
    let popup = document.createElement('div');
    let popupContent = document.createElement('div');
    popup.className = `popup ${className}`;
    popupContent.className = `popup__content`;

    let input = document.createElement('input');
    let label = document.createElement('label');
    let button = document.createElement('button');
    button.innerText = "Сохранить";
    button.className = "button";
    let cross = document.createElement('button');
    cross.className = "cross button button_icon";
    cross.innerText = "✖";

    input.className = `popup__input ${className}__input`;
    label.className = `popup__label ${className}__label`;

    label.innerText = text;
    label.appendChild(input);
    popupContent.appendChild(label);
    popupContent.appendChild(button);
    popupContent.appendChild(cross);
    popup.appendChild(popupContent);

    document.body.appendChild(popup);
    popup.classList.add("active");

    cross.addEventListener("click", () => {
        popup.remove();
    });

    button.addEventListener("click", () => {
        if (input.value.length < 1) {
            return;
        }

        let settings = window.settings.todos;
        settings.push({text: input.value, complete: false});
        saveSettings({todos: settings});
        addItem(input.value)
        initListeners();
        popup.remove();
    })
}