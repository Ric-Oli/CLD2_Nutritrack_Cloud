<script setup>

let currentDate = new Date()

const getFormattedDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAgo);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  }) + ".";
};

const showTitleDate = (day) => {
  const date = new Date()

  let titleDate = day.toString()

  return date.day
}

</script>

<template>
  <h2 class="uppercase pl-3 text-2xl">

  </h2>
  <div class="auto-cols-auto justify-between flex p-3">
    <button type="button" v-for="n in 3" :key="n" class="text-center w-[10%] h-12 rounded-lg content-center" style="background-color: rgba(72,72,72,0.89); padding: 0px !important">
      {{ getFormattedDate(n - 4) }}
    </button>
    <div class="text-center w-[10%] h-12 rounded-lg content-center bg-red-400">
      {{ getFormattedDate(0) }}
    </div>
    <button type="button" v-for="n in 3" :key="n" class="text-center w-[10%] h-12 rounded-lg content-center" style="background-color: rgba(72,72,72,0.89); ; padding: 0px !important">
      {{ getFormattedDate(n) }}
    </button>
  </div>
</template>

<style scoped>

</style>