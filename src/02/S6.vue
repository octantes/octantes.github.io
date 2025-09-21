<script setup>
defineProps({ html: String })
</script>

<template>

  <div class="text" v-html="html"></div>

</template>

<style>

.text {
  height: 100%;
  width: 100%;
  z-index: 1;
  color: #AAABAC;
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 2rem;
}

.text img {
  display: block;
  max-width: 100%;
  height: auto;
}

</style>