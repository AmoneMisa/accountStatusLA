export default function () {
    document.querySelector(".calc-bet__button").addEventListener("click", () => {
        const auctionPriceInput = document.querySelector(".calc-bet__auction-price");

        if (auctionPriceInput.value <= 0) {
            return ;
        }

        const tax = 0.05;
        const minProfit = 0.15;

        const netIncome = auctionPriceInput.value * (1 - tax);

        document.querySelector(".calc-bet__optimal").innerHTML = `Оптимальная ставка: ${Math.floor(netIncome * (1 - minProfit))}`;
        document.querySelector(".calc-bet__max").innerHTML = `Максимальная ставка: ${Math.floor(netIncome * (1 - minProfit / 2))}`;
    });
}

