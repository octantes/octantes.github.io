<script setup>
defineProps({ html: String })
</script>

<template>

  <div class="S7" v-html="html"></div>

</template>

<style>

.S7 {
  width: 100%;
  z-index: 1;
  color: #AAABAC;
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
}

.S7 img,
.S7 video {
  display: block;
  max-width: 100%;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.S7TEXT {
  width: 100%;
  z-index: 1;
  color: #AAABAC;
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 1rem 2rem 0rem 2rem;
}

.S7TEXT img
.S7TEXT video {
  display: block;
  max-width: 100%;
  height: auto;
  object-fit: cover;
}

</style>