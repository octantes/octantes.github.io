<script setup>

defineProps({ html: String })

</script>

<template> <div class="text" v-html="html"> </div> </template>