<script setup>
import * as PIXI from 'pixi.js'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const containerRef = ref(null)                                          // container div ref

let app = null                                                          // pixi global instance

function initGame() {                                                   // pixi app config 

    app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x1B1C1C, resolution: window.devicePixelRatio || 1, antialias: false })

    if (containerRef.value) {

        containerRef.value.appendChild(app.view)
        app.view.style.width = '100%'
        app.view.style.height = '100%'
        
        const gameText = new PIXI.Text('juego.vue cargado', { fontFamily: 'monospace', fontSize: 24, fill: 0xAAABAC })
        
        gameText.x = 50
        gameText.y = 50
        
        app.stage.addChild(gameText)

    }
}

onMounted(() => { initGame() })
onBeforeUnmount(() => { if (app) { app.destroy(true, { children: true, texture: true, baseTexture: true }); app = null } })
defineExpose({ app })

</script>

<template> <div ref="containerRef" class="pixi"></div> </template>
<style scoped> .pixi { width: 100%; height: 100%; } </style>