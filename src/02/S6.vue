<script setup>
defineProps({ html: String })
</script>

<template>

  <div class="S6" v-html="html"></div>

</template>

<style>

.S6 {
  width: 100%;
  z-index: 1;
  color: #AAABAC;
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 2rem 2rem 0rem 2rem;
}

.S6 img {
  display: block;
  max-width: 100%;
  height: auto;
}

</style>