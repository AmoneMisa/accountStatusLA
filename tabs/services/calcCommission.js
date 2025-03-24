export default function () {
    document.getElementById('calc-transfer').addEventListener('click', () => {
        const desiredAmount = parseFloat(document.getElementById('desired-amount').value);
        const resultDiv = document.getElementById('transfer-result');

        if (isNaN(desiredAmount) || desiredAmount <= 0) {
            resultDiv.innerText = 'Введите корректную сумму';
            return;
        }

        const commissionRate = 0.05;
        const totalToSend = Math.ceil(desiredAmount / (1 - commissionRate));

        resultDiv.innerText = `Чтобы получатель получил ${desiredAmount.toLocaleString()} золота, нужно отправить: ${totalToSend.toLocaleString()} золота.`;
    });
}