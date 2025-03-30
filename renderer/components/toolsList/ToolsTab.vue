<script setup>

import AnchorList from "@/components/toolsList/AnchorList.vue";
import CalcCubes from "@/components/toolsList/CalcCubes.vue";
import CalcBet from "@/components/toolsList/CalcBet.vue";
import CalcCards from "@/components/toolsList/CalcCards.vue";
import CalcAuctionSum from "@/components/toolsList/CalcAuctionSum.vue";
import CalcCommission from "@/components/toolsList/CalcCommission.vue";
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
    </div>
  </div>
</template>

<style scoped lang="scss">
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
  font-size: 14px;
  height: -webkit-fill-available;
}

.tools-container__anchor-menu-title {
  font-size: 18px;
  font-family: Caveat, serif;
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
  font-size: 22px;
  font-family: Caveat, serif;
  color: var(--light-grey);
}

.tools-container__item-text {
  font-size: 14px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.tools-container__item-label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.tools-container__item-input {
  max-width: 250px;
  margin-bottom: 10px;
  margin-top: 5px;
}

.tools-container__item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tools-container__item-message {
  margin-top: 10px;
  margin-bottom: 10px;
  font-size: 14px;
}
</style>