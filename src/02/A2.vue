<script setup>
import { onMounted, onUpdated, nextTick } from 'vue'

defineProps({ html: String })

function runVideoSync() {

    const videos = document.querySelectorAll('.videosync')
    let loadedCount = 0
    const totalVideos = videos.length

    if (totalVideos === 0) return

    videos.forEach(video => {

        video.pause()
        video.currentTime = 0
        
        video.addEventListener('canplaythrough', function handler() {
            loadedCount++
            if (loadedCount === totalVideos) { videos.forEach(v => { v.play().catch(e => { console.warn('falló al iniciar un video sincronizado:', e) }) }) }
            video.removeEventListener('canplaythrough', handler)
        })

        if (video.readyState < 3) { video.load() }

    })
}

onMounted(() => { nextTick(runVideoSync) })
onUpdated(() => { nextTick(runVideoSync) })

</script>

<template>

  <div class="note">

    <div class="text" v-html="html"></div>

  </div>
  
</template>