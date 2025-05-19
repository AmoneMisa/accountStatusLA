<script setup>
import AnchorList from "@/components/toolsList/AnchorList.vue";
import CalcCubes from "@/components/toolsList/CalcCubes.vue";
import CalcBet from "@/components/toolsList/CalcBet.vue";
import CalcCards from "@/components/toolsList/CalcCards.vue";
import CalcAuctionSum from "@/components/toolsList/CalcAuctionSum.vue";
import CalcCommission from "@/components/toolsList/CalcCommission.vue";
import CalcCraftResources from "@/components/toolsList/CalcCraftResources.vue";
import CalcCraftNeededResources from "@/components/toolsList/CalcCraftNeededResources.vue";
import CalcCrystalPriceComparison from "@/components/toolsList/CalcCrystalPriceComparison.vue";
</script>

<template>
  <div id="tools-container" class="tools-container">
    <div class="tools-container__sidebar">
      <anchor-list/>
    </div>
    <div class="tools-container__main">
      <calc-bet />
      <calc-cubes />
      <calc-cards />
      <calc-auction-sum />
      <calc-commission />
      <calc-craft-resources />
      <calc-craft-needed-resources />
      <calc-crystal-price-comparison />
    </div>
  </div>
</template>

<style lang="scss">
.tools-container {
  display: flex;
  gap: 20px;
}
.tools-container__sidebar {
  box-shadow: var(--shadow);
  border: 1px solid var(--grey);
  padding: 10px;
  border-radius: 5px;
  flex: 15%;
  font-size:  var(--font-small);
  height: -webkit-fill-available;
  position: sticky;
  top: 0;
}

.tools-container__anchor-menu-title {
  font-size: var(--font-h2);
  font-family: var(--font-family-decorative), serif;
  color: var(--gold);
  margin-bottom: 25px;
}

.tools-container__anchor-item {
  margin-bottom: 15px;
}

.tools-container__item {
  border: 1px solid var(--grey);
  box-shadow: var(--shadow);
  padding: 10px;
  border-radius: 5px;
  gap: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: auto;
}

.tools-container__item-name {
  margin: 0 auto 10px auto;
  text-align: center;
  font-size: var(--font-h1);
  font-family: var(--font-family-decorative), serif;
  color: var(--light-grey);
}

.tools-container__item-text {
  font-size:  var(--font-small);
  margin-bottom: 10px;
  margin-top: 10px;
  text-align: center;
}

.tools-container__item-label {
  display: flex;
  flex-direction: column;
  font-size:  var(--font-tiny);
  align-items: center;
  width: -webkit-fill-available;
}

.tools-container__item-input {
  max-width: 260px;
  min-width: 250px;
  margin-bottom: 10px;
  margin-top: 5px;
  width: -webkit-fill-available;
}

.tools-container__item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tools-container__item-message {
  margin-top: 10px;
  margin-bottom: 10px;
  font-size:  var(--font-small);
  width: -webkit-fill-available;
}
</style>