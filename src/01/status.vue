<script setup>

const emit = defineEmits(['toggle-view'])

function toggleLayout() { emit('toggle-view'); }

</script>

<template>

    <div class="set">

        <button @click="toggleLayout">centrar</button>
        
    </div>
    

</template>

<style scoped>

.set { background-color: #1b1c1c; color: #d8dade; }

button { background-color: transparent; padding: 0.5rem 1rem; border: none; box-shadow: inset 0 0 0 1px #AAABAC25; color: #AAABAC; cursor: pointer; border-radius: 5px;}
button:hover { background-color: #2B2C2C; color: #D8DADE; }
button:active { background-color: #8AB6BB25; color: #D8DADE; box-shadow: inset 0 0 0 1px #AAABAC25; border-radius: 5px; }
button:disabled { cursor: not-allowed; opacity: 0.25; }

</style>