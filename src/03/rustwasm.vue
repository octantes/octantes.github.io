<script> 
import init, { startgame } from '@/wasm/rustgame.js'
export default { name: 'rustgame', async mounted() { await init(); const canvas = this.$refs.containerref; startgame(canvas) } }
</script>

<template> 

  <canvas ref="containerref" class="rust"></canvas>

</template>

<style scoped> 

.rust { display: block; width: 100%; height: 100%; }

</style>