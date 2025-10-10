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