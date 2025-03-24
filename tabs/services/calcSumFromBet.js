export default function () {
    document.querySelector('.profit-calc__submit').addEventListener('click', () => {
        const bid = parseFloat(document.querySelector('.profit-calc__bid').value);
        const players = parseInt(document.querySelector('.profit-calc__players').value);
        const resultContainer = document.querySelector('.profit-calc__result');

        if (isNaN(bid) || bid <= 0) {
            resultContainer.innerText = "Введите корректную ставку.";
            return;
        }

        let totalBid = bid;
        let tax = 0;

        if (bid > 100000) {
            tax = bid * 0.05;
            totalBid = bid - tax;
        }

        const profitPerPerson = (totalBid / players).toFixed(2);

        resultContainer.innerHTML = `
        <div>Чистая сумма после комиссии: ${Math.floor(totalBid)} 💰</div>
        <div>Выгода на одного человека: ${profitPerPerson} 💵</div>
        ${tax ? `<div>Комиссия: ${Math.floor(tax)} 🧾</div>` : ""}
    `;
    });
}