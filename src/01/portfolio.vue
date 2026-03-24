<script setup> 
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'
import authorpic from '../../content/assets/kaste.jpg'

const router            = useRouter()
const store             = useStore()
const portfolioProjects = computed(() => store.notesIndex.filter(n => n.type === 'diseño' || n.type === 'desarrollo').slice(0, 8))
const currentProject    = ref(null)
const prevSelectedIdx   = ref(-1)
const rayAngles         = ref([])
const absIndices        = ref([])

const bounds = { top: -70, bottom: 70, gapUp: -15, gapDown: 45 }

function getSlots(length, hasSelection) { 

  const slots = new Array(length).fill(0)
  const virtualCenter = Math.floor(length / 2)

  if (!hasSelection) {
    const step = (bounds.bottom - bounds.top) / (length - 1 || 1)
    for (let i = 0; i < length; i++) { let angle = bounds.top + i * step; slots[(i - virtualCenter + length) % length] = angle < 0 ? angle + 360 : angle }
    return slots
  }

  const spanUp = bounds.gapUp - bounds.top
  const spanDown = bounds.bottom - bounds.gapDown
  const step = (length - 1) > 1 ? (spanUp + spanDown) / (length - 2) : 0

  let upSlots = []
  let downSlots = []

  for (let i = 0; i < length - 1; i++) {
    const x = i * step
    if (x <= spanUp + 0.001) upSlots.push(bounds.top + x)
    else downSlots.push(bounds.gapDown + (x - spanUp))
  }

  slots[0] = 0
  for (let i = 0; i < downSlots.length; i++) slots[i + 1] = downSlots[i]
  for (let i = 0; i < upSlots.length; i++)   slots[i + 1 + downSlots.length] = upSlots[i] + 360

  return slots

}

watch([currentProject, portfolioProjects], () => { 

  const length = portfolioProjects.value.length
  if (length === 0) return

  const selectedIdx = currentProject.value ? portfolioProjects.value.findIndex(p => p.slug === currentProject.value.slug) : -1
  const activeIdx = selectedIdx !== -1 ? selectedIdx : Math.floor(length / 2)
  const slots = getSlots(length, selectedIdx !== -1)

  if (absIndices.value.length !== length) {
    absIndices.value = Array.from({ length }, (_, i) => i - activeIdx)
  } else {
    const targetLap = Math.round((rayAngles.value[activeIdx] - slots[0]) / 360)
    const shift = absIndices.value[activeIdx] - (targetLap * length)
    for (let i = 0; i < length; i++) absIndices.value[i] -= shift
  }

  rayAngles.value = Array.from({ length }, (_, i) => {
    const absIndex = absIndices.value[i]
    const slotIdx = ((absIndex % length) + length) % length
    return slots[slotIdx] + Math.floor(absIndex / length) * 360
  })

  prevSelectedIdx.value = selectedIdx

}, { immediate: true })

function handleRayClick(proj) { if (currentProject.value?.slug === proj.slug) router.push(`/${proj.type}/${proj.slug}`); else currentProject.value = proj  }
function openAuthor()         { window.open('https://x.com/octantes', '_blank', 'noopener,noreferrer') }
function closePortfolio()     { router.push('/') }

onMounted(()   => { if (!store.notesLoaded) store.loadNotesIndex() })

</script>

<template> 

  <div class="portfolio">

    <button class="close-btn" @click="closePortfolio" title="volver al inicio" aria-label="cerrar el portfolio">X</button>
      
    <div class="hover-box"> 

      <div class="message-box">

        <h2>kaste</h2>
        <p class="subtitle">diseñador y desarrollador multimedia</p>
        <br>
        <p>construyendo interfaces de alta fidelidad, sistemas de diseño y portales interactivos; el foco está en la multimedialidad y la autonomía técnica.</p>

      </div>

      <img class="avatar" tabindex="0" @click="openAuthor" @keydown.enter="openAuthor" role="button" title="abrir perfil de twitter" aria-label="abrir perfil de twitter de kaste" :src="authorpic" alt="avatar kaste" />

    </div>

    <div class="prompt-arrow"> <span class="ray-text">&lt;</span> </div>

    <div class="rays-container">
      
      <div v-for="(proj, i) in portfolioProjects" :key="proj.slug" class="ray-box" :class="[{ selected: currentProject && currentProject.slug === proj.slug }, `ray-${proj.type}`]" :style="{ transform: `rotate(${rayAngles[i]}deg)` }" @click="handleRayClick(proj)" role="button" :title="'seleccionar proyecto ' + proj.title">
        
        <div class="ray-line"></div>
        <span class="ray-text">{{ proj.title }}</span>

        <div v-if="currentProject && currentProject.slug === proj.slug" class="ray-portal" :title="'abrir nota de ' + proj.title">
          <div class="portal-line"></div>
          <div class="portal-trigger">▶</div>
        </div>

        <div v-if="currentProject && currentProject.slug === proj.slug" class="ray-data">
          <p class="desc">{{ proj.description || 'sin descripción' }}</p>
          <div class="tags"> <span v-for="tag in proj.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span> </div>
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
  /* BORDER */ border: none; border-radius: 0;

}

.close-btn { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ position: absolute; top: 1rem; right: 2rem; z-index: 50;
  /* BOX    */ padding: .8rem 1rem .8rem 1rem;
  /* FILL   */ background-color: var(--niebla50); color: var(--carbon);
  /* BORDER */ border: none; border-radius: 9999px;
  /* MOTION */ transition: background-color var(--animate-fast);

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
  /* MOTION */ transform: translateX(2rem); transition: transform var(--animate-mid), opacity var(--animate-mid);

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
  /* MOTION */ transition: filter var(--animate-mid), opacity var(--animate-mid);
  /* BORDER */ border-radius: 50%; box-shadow: inset 0 0 0 4px var(--lirio);

}

.prompt-arrow { 

  /* LAYOUT */ position: absolute; left: 50%; top: 50%; z-index: 5; pointer-events: none;
  /* BOX    */ width: 25rem; height: 3rem; margin-top: -1.5rem; padding-left: 11rem; transform-origin: left center;
  /* MOTION */ transform: rotate(180deg); transition: transform var(--animate-mid), opacity var(--animate-mid); display: flex; align-items: center;

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
  /* LAYOUT */ position: absolute; left: 0; top: -1.5rem; display: flex; align-items: center; justify-content: flex-start;
  /* BOX    */ width: 35rem; height: 3rem; padding-left: 9rem; transform-origin: left center;
  /* MOTION */ transition: transform var(--animate-mid);

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
  /* MOTION */ transition: color var(--animate-fast), background-color var(--animate-fast), border-color var(--animate-fast);

}

.ray-portal {

  /* LAYOUT */ position: relative; display: flex; align-items: center; z-index: 1; pointer-events: none;
  /* MOTION */ animation: spawnData var(--animate-fast) forwards;

}

.portal-line {

  /* LAYOUT */ position: relative; z-index: 1; flex-shrink: 0;
  /* BOX    */ width: 1.5rem; height: 1px;
  /* MOTION */ transition: width var(--animate-fast);

}

.portal-trigger {

  /* LAYOUT */ position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  /* BOX    */ width: 1.5rem; height: 1.5rem; padding-left: 1px; padding-top: 1px;
  /* FILL   */ color: var(--carbon);
  /* BORDER */ border-radius: 50%;
  /* FONT   */ font-family: var(--font-mono); font-size: 0.8rem;  
  /* MOTION */ transition: transform var(--animate-fast), box-shadow var(--animate-fast);

}

.ray-data {

  /* LAYOUT */ position: absolute; top: 2.5rem; display: flex; flex-direction: column; z-index: 1; pointer-events: none;
  /* BOX    */ width: 22rem; gap: 0.5rem; padding: .5rem;
  /* FONT   */ text-shadow: 1px 1px 2px var(--carbon);
  /* MOTION */ animation: spawnData var(--animate-fast) forwards;

  & .desc {

    /* BOX    */ margin: 0;
    /* FONT   */ font-family: var(--font-mono); color: var(--humo); font-size: 0.85rem; line-height: 1.5;

  }

  & .tag {

    /* BOX    */ padding: 0; 
    /* FONT   */ font-family: var(--font-mono); font-size: 0.7rem; color: var(--humo50);

  }

  & .tags { display: flex; flex-wrap: wrap; gap: 0.6rem; }

}

.ray-diseño { 

  & .ray-text { border: 1px solid var(--lirio80); }

  & .portal-line,    & .portal-trigger    { background-color: var(--lirio); }
  &:hover .ray-line, &.selected .ray-line { background-color: var(--lirio); width: 2.5rem; }
  &:hover .ray-text, &.selected .ray-text { color: var(--carbon); background-color: var(--lirio); border-color: var(--lirio); box-shadow: none; }

  &:hover .ray-portal .portal-line        { width: 4rem; }
  
  & .tag { color: var(--cristal); }

}

.ray-desarrollo { 

  & .ray-text { border: 1px solid var(--cristal80); }

  & .portal-line,    & .portal-trigger    { background-color: var(--cristal); }
  &:hover .ray-line, &.selected .ray-line { background-color: var(--cristal); width: 2.5rem; }
  &:hover .ray-text, &.selected .ray-text { color: var(--carbon); background-color: var(--cristal); border-color: var(--cristal); box-shadow: none; }

  &:hover .ray-portal .portal-line { width: 4rem; }
  
  & .tag { color: var(--lirio); }

}

@keyframes spawnData { 0% { opacity: 0; } 100% { opacity: 1; } }

@media (max-width: 1080px) { 

  .hover-box                       { flex-direction: column;                                                                       }
  .message-box                     { right: auto; bottom: 100%; margin-right: 0; margin-bottom: 2rem; transform: translateY(2rem); }
  .message-box::after              { right: 50%; top: auto; bottom: -7px; transform: translateX(50%) rotate(135deg);               }
  .hover-box:hover                 { transform: translateY(8rem);                                                                  }
  .hover-box:hover   .message-box  { transform: translateY(0);                                                                     }
  .hover-box:hover ~ .prompt-arrow { opacity: 0; transform: rotate(270deg) translateX(1rem);                                       }
  .prompt-arrow                    { padding-left: 8rem; transform: rotate(270deg);                                                }
  .avatar                          { width: 10rem; height: 10rem;                                                                  }
  .ray-box                         { padding-left: 6rem; width: 25rem;                                                             }
  .ray-data                        { width: 16rem;                                                                                 }

}

</style>