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

</style>