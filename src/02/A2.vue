<script setup>
defineProps({ html: String })
</script>

<template>
  <div class="note">
    <div class="text" v-html="html"></div>
  </div>
</template>

<style>

.text {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  color: #AAABAC;
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 1rem;
}

.text img {
  display: block;
  max-width: 100%;
  height: auto;
}

</style>