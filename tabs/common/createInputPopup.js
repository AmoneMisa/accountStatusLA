export default function (className, text) {
    let popup = document.createElement('div');
    popup.className = `popup ${className}`;

    let input = document.createElement('input');
    let label = document.createElement('label');

    input.className = `popup__input ${className}__input`;
    label.className = `popup__label ${className}__label`;

    label.innerText = text;
    label.appendChild(input);
    popup.appendChild(label);

    document.body.appendChild(popup);
}