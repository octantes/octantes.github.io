<script setup>
defineProps({ html: String })
</script>

<template>

  <div class="note">

    <div class="text" v-html="html"></div>

  </div>
  
</template>