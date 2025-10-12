<script setup>

const emit = defineEmits(['toggle-view'])

function toggleLayout() { emit('toggle-view'); }

</script>

<template>

    <div class="set">
        <button @click="toggleLayout">centrar contenido</button>
    </div>
    

</template>

<style>

.set { background-color: #1b1c1c; color: #d8dade; padding-inline: .5rem; }

button { cursor: pointer; }

</style>