import {saveSettings} from "../../utils/utils.js";

export default function () {
    const popup = document.querySelector(".notification-popup");
    const input = document.querySelector(".notification__create-title");
    const selectDays = document.querySelector(".notification__create-select-days");
    const selectFrequency = document.querySelector(".notification__create-select-frequency");

    renderNotifications();
    initListeners();

    document.querySelector(".notification-table__button-add").addEventListener("click", () => {
        popup.classList.add("active");
    });

    document.querySelector(".notification-popup__cross").addEventListener("click", () => {
        popup.classList.remove("active");
        input.value = "";
    });

    document.querySelector(".notification__create-button").addEventListener("click", () => {
        if (input.value.length < 1) {
            return;
        }

        const settings = window.settings.customNotifications || [];
        const selectedOptions = Array.from(selectDays.selectedOptions).map(option => option.value)

        settings.push({name: input.value, frequency: selectFrequency.value, days: selectedOptions, enable: false});
        input.value = "";
        selectDays.value = "";
        selectFrequency.value = "";

        saveSettings({customNotifications: settings});
        renderNotifications();
        initListeners();

        popup.classList.remove("active");
    });
}

function renderNotifications() {
    const settings = window.settings.customNotifications || [];
    const notificationContainer = document.querySelector(".notification-list");
    notificationContainer.innerHTML = "";

    if (!settings.length) {
        return;
    }

    settings.forEach((notification, index) => {
        createNotificationItem(notification, index);
    });
}

const daysMap = {
    1: "Пн",
    2: "Вт",
    3: "Ср",
    4: "Чт",
    5: "Пт",
    6: "Сб",
    7: "Вс",
}

function createNotificationItem(notification, index) {
    const notificationsList = document.querySelector(".notification-list");

    const notificationContainer = document.createElement("div");
    const notificationName = document.createElement("div");
    const notificationCheckbox = document.createElement("input");
    const notificationLabel = document.createElement("label");
    const notificationControls = document.createElement("div");
    const notificationDays = document.createElement("div");
    const notificationFrequency = document.createElement("div");
    const notificationDeleteButton = document.createElement("button");

    notificationCheckbox.dataset.index = index;
    notificationDeleteButton.dataset.index = index;

    notificationDeleteButton.innerText = "🗑";
    notificationDeleteButton.dataset.tooltip = "Удалить напоминание";
    notificationName.innerText = notification.name;
    notificationLabel.innerText = "Вкл. уведомления";
    notificationFrequency.innerText = `Частота: ${notification.frequency} мин`;
    notificationDays.innerText = `Дни недели: ${notification.days.map(day => daysMap[day])}`;

    notificationCheckbox.type = "checkbox";
    notificationCheckbox.checked = notification.enable;

    notificationContainer.classList.add("notification-item");
    notificationDeleteButton.classList.add("notification-item__delete");
    notificationDeleteButton.classList.add("button");
    notificationDeleteButton.classList.add("button_icon");
    notificationDeleteButton.classList.add("tooltip");
    notificationLabel.classList.add("custom-label");
    notificationLabel.classList.add("notification-item__cell");
    notificationFrequency.classList.add("notification-item__cell");
    notificationDays.classList.add("notification-item__cell");
    notificationName.classList.add("notification-item__cell");
    notificationCheckbox.classList.add("notification-item__checkbox");

    notificationControls.append(notificationDeleteButton);
    notificationLabel.append(notificationCheckbox);
    notificationContainer.append(notificationName);
    notificationContainer.append(notificationDays);
    notificationContainer.append(notificationFrequency);
    notificationContainer.append(notificationLabel);
    notificationContainer.append(notificationControls);

    notificationsList.append(notificationContainer);
}

function initListeners() {
    const checkboxElems = document.querySelectorAll(".notification-item__checkbox");
    let customNotifications = window.settings.customNotifications || [];

    checkboxElems.forEach(checkbox => {
        checkbox.removeEventListener("change", () => {
            customNotifications[checkbox.dataset.index].enable = checkbox.checked;
            saveSettings({customNotifications: customNotifications});
        });

        checkbox.addEventListener("change", () => {
            customNotifications[checkbox.dataset.index].enable = checkbox.checked;

            console.log(customNotifications)
            console.log("index", checkbox.dataset.index)
            saveSettings({customNotifications: customNotifications});
        });
    })

    const deleteBtnElems = document.querySelectorAll(".notification-item__delete");

    deleteBtnElems.forEach(deleteBtn => {
        deleteBtn.removeEventListener("click", () => {
            customNotifications.splice(+deleteBtn.dataset.index, 1);
            saveSettings({customNotifications: customNotifications});
            deleteBtn.closest(".notification-item").remove();
        });

        deleteBtn.addEventListener("click", () => {
            customNotifications.splice(+deleteBtn.dataset.index, 1);
            saveSettings({customNotifications: customNotifications});
            deleteBtn.closest(".notification-item").remove();
        });
    });
}