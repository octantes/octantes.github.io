<script setup> 
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import authorpic from '../../content/assets/kaste.jpg'

const router            = useRouter()
const store             = useStore()
const windowWidth       = ref(typeof window !== 'undefined' ? window.innerWidth : 1080)
const portfolioProjects = computed(() => { return store.notesIndex.filter(n => n.type === 'diseño' || n.type === 'desarrollo').slice(0, 8) })
const currentProject    = ref(null)
const prevSelectedIdx   = ref(-1)
const rayAngles         = ref([])

watch([currentProject, windowWidth, portfolioProjects], () => {
  const length = portfolioProjects.value.length
  if (length === 0) return
  const selectedIdx = currentProject.value ? portfolioProjects.value.findIndex(p => p.slug === currentProject.value.slug) : -1
  const isMobile = windowWidth.value <= 1080
  const arrowAngle = isMobile ? 270 : 180
  const nodeAmount = length + 1
  let newAngles = []
  
  if (selectedIdx === -1) {

    const step = 360 / nodeAmount
    for (let i = 0; i < length; i++) { newAngles.push((arrowAngle + (i + 1) * step) % 360) }

  }

  else {

    const step = 270 / nodeAmount
    let downSlots = []
    let currentAngle = arrowAngle - step
    while (currentAngle > 90 - 0.1) { downSlots.unshift(currentAngle); currentAngle -= step }
    let upSlots = []
    currentAngle = arrowAngle + step
    while (currentAngle < 360 - 0.1) { upSlots.push(currentAngle); currentAngle += step }
    let slots = [0, ...downSlots, ...upSlots].slice(0, length)
    for (let i = 0; i < length; i++) { const slotIdx = (i - selectedIdx + length) % length; newAngles.push(slots[slotIdx]) }

  }

  if (rayAngles.value.length === length) {

    const anchorIdx = selectedIdx !== -1 ? selectedIdx : prevSelectedIdx.value
    let wheelDirection = 0
    if (anchorIdx !== -1) {
      let prevTarget = rayAngles.value[anchorIdx]
      let nextTarget = newAngles[anchorIdx]
      
      let targetDiff = (nextTarget - prevTarget) % 360
      if (targetDiff > 180) targetDiff -= 360
      else if (targetDiff <= -180) targetDiff += 360
      
      wheelDirection = targetDiff >= 0 ? 1 : -1
    }
    
    const updated = []

    for (let i = 0; i < length; i++) {
      let prev = rayAngles.value[i]
      let next = newAngles[i]
      let diff = (next - prev) % 360
      if (diff > 180) diff -= 360
      else if (diff <= -180) diff += 360
      if (wheelDirection > 0 && diff < 0) diff += 360
      else if (wheelDirection < 0 && diff > 0) diff -= 360
      updated.push(prev + diff)
    }

    rayAngles.value = updated

  } else { rayAngles.value = newAngles }

  prevSelectedIdx.value = selectedIdx

}, { immediate: true })

const rayAngleOffset = computed(() => 0)

function selectProject(note) { currentProject.value = note }
function openProject(note)   { router.push(`/${note.type}/${note.slug}`) }
function openAuthor()        { window.open('https://x.com/octantes', '_blank', 'noopener,noreferrer') }
function closePortfolio()    { router.push('/') }
function updateWidth()       { windowWidth.value = window.innerWidth }

onMounted(()   => { if (!store.notesLoaded) store.loadNotesIndex(); window.addEventListener('resize', updateWidth) })
onUnmounted(() => { window.removeEventListener('resize', updateWidth) })

</script>

<template> 

  <div class="portfolio">
    
    <div class="portfolio-bg">
      <transition name="fade-bg">
        <img v-if="currentProject && currentProject.portada" :src="currentProject.portada" :key="currentProject.slug" alt="" />
      </transition>
      <div class="bg-overlay"></div>
    </div>

    <button class="close-btn" @click="closePortfolio" title="volver al inicio" aria-label="cerrar el portfolio">X</button>
      
    <div class="hover-box"> 

      <div class="message-box">

        <h2>kaste</h2>
        <p class="subtitle">diseñador y desarrollador multimedia</p>
        <br>
        <p>construyendo interfaces de alta fidelidad, sistemas de diseño y portales interactivos; el foco está en la multimedialidad y la autonomía técnica.</p>

      </div>

      <img class="avatar" @click="openAuthor" role="button" title="abrir perfil de twitter" aria-label="abrir perfil de twitter de kaste" :src="authorpic" alt="avatar kaste" />

    </div>

    <div class="prompt-arrow"> <span class="ray-text">&lt;</span> </div>

    <div class="rays-container" :style="{ transform: `rotate(${rayAngleOffset}deg)` }">
      
      <div v-for="(proj, i) in portfolioProjects" :key="proj.slug" class="ray-box" :class="[{ selected: currentProject && currentProject.slug === proj.slug }, `ray-${proj.type}`]" :style="{ transform: `rotate(${rayAngles[i]}deg)` }" @click="selectProject(proj)" role="button" :title="'seleccionar proyecto ' + proj.title">
        
        <div class="ray-line"></div>
        <span class="ray-text">{{ proj.title }}</span>

        <div v-if="currentProject && currentProject.slug === proj.slug" class="ray-data">
          <p class="desc">{{ proj.description || 'sin descripción' }}</p>
          <div class="tags">
            <span v-for="tag in proj.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <button class="open-link" @click.stop="openProject(proj)">[ VER_PROYECTO ]</button>
        </div>

      </div>

    </div>

  </div>

</template>

<style scoped> 

.portfolio { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ position: relative; display: flex; align-items: center; justify-content: center;
  /* BOX    */ width: 100%; height: 100%; overflow: hidden;
  /* FILL   */ background-color: var(--carbon); color: var(--humo);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-ss);

}

.portfolio-bg {

  /* LAYOUT */ position: absolute; inset: 0; z-index: 1; pointer-events: none;
  /* FILL   */ background-color: var(--carbon);

}

.portfolio-bg img {

  /* BOX    */ width: 100%; height: 100%; object-fit: cover;
  /* FILL   */ filter: grayscale(100%) contrast(1.2); opacity: 0.15;

}

.bg-overlay {

  /* LAYOUT */ position: absolute; inset: 0;
  /* FILL   */ background: linear-gradient(90deg, var(--carbon) 0%, transparent 50%, var(--carbon) 100%);

}

.close-btn { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ position: absolute; top: 1rem; right: 2rem; z-index: 50;
  /* BOX    */ padding: .8rem 1rem .8rem 1rem;
  /* FILL   */ background-color: var(--niebla50); color: var(--carbon);
  /* BORDER */ border: none; border-radius: 9999px;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { background-color: var(--niebla99); }

}

.hover-box { 

  /* LAYOUT */ position: relative; display: flex; align-items: center; z-index: 20;
  /* MOTION */ transition: transform var(--animate-mid);

  &:hover { transform: translateX(11.5rem); }
  &:hover .avatar { filter: grayscale(0%) contrast(1); opacity: 1; }
  &:hover .message-box { opacity: 1; pointer-events: auto; transform: translateX(0); }
  &:hover ~ .prompt-arrow { opacity: 0; transform: rotate(180deg) translateX(1rem); }
  &:hover ~ .rays-container { opacity: 0; pointer-events: none; transform: translateX(2rem); }

}

.message-box { 

  /* LAYOUT */ position: absolute; right: 100%; z-index: 1; pointer-events: none;
  /* BOX    */ width: 20rem; margin-right: 2rem; padding: 1.5rem;
  /* FILL   */ background-color: var(--carbon); opacity: 0;
  /* BORDER */ border: var(--small-outline) var(--humo25); border-radius: var(--radius-ss);
  /* MOTION */ transform: translateX(2rem); transition: all var(--animate-mid);

  &::after { 

    /* LAYOUT */ content: ''; position: absolute; right: -7px; top: 50%; z-index: 1;
    /* BOX    */ width: 12px; height: 12px;
    /* FILL   */ background-color: var(--carbon);
    /* BORDER */ border-right: var(--small-outline) var(--humo25); border-top: var(--small-outline) var(--humo25);
    /* MOTION */ transform: translateY(-50%) rotate(45deg);

  }

  & p  { font-size: 0.95rem; line-height: 1.5; color: var(--humo); }
  & h2 { color: var(--lirio); margin: 0 0 0.5rem 0; font-size: 1.5rem; }

  & .subtitle { font-family: var(--font-mono); font-style: italic; font-size: 0.9rem; color: var(--humo50); margin: 0; }

}

.avatar { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ position: relative; z-index: 2; overflow: hidden;
  /* BOX    */ width: 15rem; height: 15rem; flex-shrink: 0; object-fit: cover;
  /* FILL   */ background-color: var(--carbon);
  /* FILL   */ filter: grayscale(100%) contrast(1.2); opacity: 0.8;
  /* MOTION */ transition: all var(--animate-mid);
  /* BORDER */ border-radius: 50%; box-shadow: inset 0 0 0 4px var(--lirio);

}

.prompt-arrow { 

  /* LAYOUT */ position: absolute; left: 50%; top: 50%; z-index: 5; pointer-events: none;
  /* BOX    */ width: 25rem; height: 3rem; margin-top: -1.5rem; padding-left: 11rem; transform-origin: left center;
  /* MOTION */ transform: rotate(180deg); transition: all var(--animate-mid); display: flex; align-items: center;

  & .ray-text { 

    /* BOX    */ background: transparent; border: none; box-shadow: none; padding: 0;
    /* FILL   */ color: var(--humo50); font-family: var(--font-mono); font-size: 1.2rem;

  }

}

.rays-container { 

  /* LAYOUT */ position: absolute; left: 50%; top: 50%; z-index: 10;
  /* BOX    */ width: 0; height: 0;
  /* MOTION */ transition: opacity var(--animate-mid), transform var(--animate-mid);

}

.ray-box { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ position: absolute; left: 0; top: -1.5rem; display: flex; align-items: center;
  /* BOX    */ width: 25rem; height: 3rem; padding-left: 9rem; transform-origin: left center;
  /* MOTION */ transition: all var(--animate-mid);

}

.ray-line { 

  /* LAYOUT */ position: relative; z-index: 2; flex-shrink: 0;
  /* BOX    */ width: 1.5rem; height: 1px; margin-right: 0.5rem;
  /* FILL   */ background-color: var(--humo25);
  /* MOTION */ transition: background-color var(--animate-fast), width var(--animate-fast);

}

.ray-text { 

  /* LAYOUT */ position: relative; z-index: 2; display: flex; align-items: flex-end; justify-content: center;
  /* BOX    */ padding: 0.3rem 0.8rem; height: 1.5rem;
  /* FILL   */ color: var(--humo80); background-color: var(--carbon);
  /* BORDER */ border-radius: 9999px;
  /* FONT   */ font-family: var(--font-mono); font-size: 0.8rem; white-space: nowrap;
  /* MOTION */ transition: all var(--animate-fast);

}

.ray-data {

  /* LAYOUT */ position: absolute; left: 12rem; top: 2.2rem; display: flex; flex-direction: column; z-index: 1; pointer-events: auto;
  /* BOX    */ width: 18rem; gap: 0.5rem;
  /* FONT   */ text-shadow: 1px 1px 2px var(--carbon);
  /* MOTION */ animation: slideData var(--animate-mid) forwards;

}

.ray-data .desc {

  /* BOX    */ margin: 0;
  /* FONT   */ font-family: var(--font-mono); color: var(--humo); font-size: 0.85rem; line-height: 1.5; 

}

.ray-data .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.ray-data .tag {

  /* BOX    */ padding: 0; 
  /* FILL   */ color: var(--humo50);
  /* FONT   */ font-family: var(--font-mono); font-size: 0.7rem;

}

.ray-data .tag::before { content: '#'; color: var(--humo25); }

.open-link {

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ display: flex;
  /* BOX    */ width: fit-content; padding: 0; margin-top: 0.2rem;
  /* FILL   */ background: none; color: var(--humo);
  /* BORDER */ border: none; box-shadow: none;
  /* FONT   */ font-family: var(--font-mono); font-size: 0.85rem; 
  /* MOTION */ transition: color var(--animate-fast);

  &:hover { color: var(--niebla); text-decoration: underline; }

}

.ray-diseño { 

  & .ray-text { border: 1px solid var(--lirio80); }

  &:hover .ray-line, .ray-diseño.selected .ray-line { background-color: var(--lirio); width: 2.5rem; }
  &:hover .ray-text, .ray-diseño.selected .ray-text { color: var(--carbon); background-color: var(--lirio); border-color: var(--lirio); box-shadow: none; }

}

.ray-desarrollo { 

  & .ray-text { border: 1px solid var(--cristal80); }

  &:hover .ray-line, .ray-desarrollo.selected .ray-line { background-color: var(--cristal); width: 2.5rem; }
  &:hover .ray-text, .ray-desarrollo.selected .ray-text { color: var(--carbon); background-color: var(--cristal); border-color: var(--cristal); box-shadow: none; }

}

.fade-bg-enter-active, .fade-bg-leave-active { transition: opacity var(--animate-long); position: absolute; }
.fade-bg-enter-from, .fade-bg-leave-to { opacity: 0; }

@keyframes slideData { 

  000% { opacity: 0; transform: translateY(-1rem);  }
  100% { opacity: 1; transform: translateY(0); }

}

@media (max-width: 1080px) { 

  .bg-overlay                      { background: linear-gradient(0deg, var(--carbon) 0%, transparent 50%, var(--carbon) 100%); }
  .hover-box                       { flex-direction: column;                                                                       }
  .message-box                     { right: auto; bottom: 100%; margin-right: 0; margin-bottom: 2rem; transform: translateY(2rem); }
  .message-box::after              { right: 50%; top: auto; bottom: -7px; transform: translateX(50%) rotate(135deg);               }
  .hover-box:hover                 { transform: translateY(8rem);                                                                  }
  .hover-box:hover   .message-box  { transform: translateY(0);                                                                     }
  .hover-box:hover ~ .prompt-arrow { opacity: 0; transform: rotate(270deg) translateX(1rem);                                       }
  .prompt-arrow                    { padding-left: 8rem; transform: rotate(270deg);                                                }
  .avatar                          { width: 10rem; height: 10rem;                                                                  }
  .ray-box                         { padding-left: 6rem; width: 15rem;                                                             }
  .ray-data                        { left: 9rem; width: 14rem;                                                                     }

}

</style>