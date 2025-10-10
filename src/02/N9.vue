<script setup>
defineProps({ html: String })
</script>

<template>

  <div class="text" v-html="html"></div>
  
</template>

<style>

.YTFrame {
    position: relative;
    width: 100%;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    margin-bottom: 1rem;
}

.N9 .YTVideo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

</style>