<script setup> 
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../04/store.js'

const authorpic = '/assets/kaste.webp'

const router            = useRouter()
const store             = useStore()

const WELCOME_SLUG  = '__welcome'

const welcomeRay = computed(() => ({
  slug: WELCOME_SLUG,
  type: 'welcome',
  title: store.t.portfolio.welcomeTitle,
  description: store.t.portfolio.welcomeDesc,
  tags: [],
}))

const realProjects      = computed(() => store.notesIndex.filter(n => n.type === 'diseño' || n.type === 'desarrollo'))

const portfolioProjects = computed(() => {
  const list = realProjects.value
  if (!list.length) return []
  return [...list.filter(n => n.type === 'diseño'), welcomeRay.value, ...list.filter(n => n.type === 'desarrollo')]
})

const welcomeIndex = computed(() => portfolioProjects.value.findIndex(p => p.slug === WELCOME_SLUG))
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

function handleRayClick(proj) {
  if (proj.slug === WELCOME_SLUG) { currentProject.value = proj; return }                                                              // nothing to open behind it
  if (currentProject.value?.slug === proj.slug) router.push(`/${proj.type}/${proj.slug}`); else currentProject.value = proj
}
function openGithub()         { window.open('https://github.com/octantes', '_blank', 'noopener noreferrer')                                                }
function closePortfolio()     { router.push('/')                                                                                                           }

onMounted(()   => { if (!store.notesLoaded) store.loadNotesIndex() })

</script>

<template> 

  <div class="portfolio">

    <div class="top-actions">
      <button class="close-btn lang-btn" @click="store.toggleLang" :title="store.t.portada.langTitle" :aria-label="store.t.portada.langTitle">{{ store.lang.toUpperCase() }}</button>
      <button class="close-btn" @click="closePortfolio" :title="store.t.portfolio.close" :aria-label="store.t.portfolio.close">✘</button>
    </div>

    <div class="profile-group"> 

      <div class="message-box">

        <h2>Facundo Gerbino</h2>

        <p class="subtitle">{{ store.t.portfolio.subtitle }}</p>

        <div class="stack">

          <span>Figma</span>
          <span>Vue.js</span>
          <span>Rust</span>
          <span>Tauri</span>

        </div>

        <p v-html="store.t.portfolio.desc"></p>

      </div>

      <img class="avatar" tabindex="0" @click="openGithub" @keydown.enter="openGithub" role="button" :title="store.t.portfolio.githubProfile" :aria-label="store.t.portfolio.openGithub" :src="authorpic" :alt="store.t.portfolio.githubProfile" />    
    
    </div>

    <div class="rays-wrapper">

      <div class="rays-container">
        
        <div v-for="(proj, i) in portfolioProjects" :key="proj.slug" class="ray-box" :class="[{ selected: currentProject && currentProject.slug === proj.slug }, `ray-${proj.type}`]" :style="{ transform: `rotate(${rayAngles[i]}deg)`, '--i': i, '--n': portfolioProjects.length }" @click="handleRayClick(proj)" @keydown.enter.prevent="handleRayClick(proj)" @keydown.space.prevent="handleRayClick(proj)" role="button" tabindex="0" :title="store.t.portfolio.select + ((store.lang === 'en' && proj.bilingual && proj.titleEn) ? proj.titleEn : proj.title)">
          
          <div class="ray-line"></div>
          <span class="ray-text">{{ (store.lang === 'en' && proj.bilingual && proj.titleEn) ? proj.titleEn : proj.title }}</span>

          <div v-if="currentProject && currentProject.slug === proj.slug && proj.slug !== WELCOME_SLUG" class="ray-portal" :title="store.t.portfolio.open + ((store.lang === 'en' && proj.bilingual && proj.titleEn) ? proj.titleEn : proj.title)">
            <div class="portal-line"></div>
            <div class="portal-trigger"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.2 2.6 L9.4 6 L4.2 9.4 Z" /></svg></div>
          </div>

          <div v-if="currentProject && currentProject.slug === proj.slug" class="ray-data">
            <p v-if="proj.slug !== WELCOME_SLUG" class="meta">
              <span class="year">{{ String(proj.date || proj.isoDate || '').slice(-4) }}</span><span class="sep">//</span>
              <span class="role">{{ store.t.nav.tabs[proj.type] || proj.type }}</span><span class="sep">//</span>
              <span class="tag">{{ (proj.tags || []).slice(0, 3).join(', ') }}</span>
            </p>
            <p v-else class="legend"><span class="key dis"></span>{{ store.t.nav.tabs['diseño'] }}<span class="key dev"></span>{{ store.t.nav.tabs['desarrollo'] }}</p>
            <p class="desc" :class="{ welcome: proj.slug === WELCOME_SLUG }">{{ (store.lang === 'en' && proj.bilingual && proj.descriptionEn) ? proj.descriptionEn : (proj.description || store.t.portfolio.noDesc) }}</p>
          </div>

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
  /* FILL   */ background: radial-gradient(circle at center, var(--carbon) 0%, #000000 100%); color: var(--humo);
  /* BORDER */ border: none; border-radius: var(--radius-ss);

}

.top-actions {

  /* LAYOUT */ position: absolute; top: 1.5rem; right: 2rem; z-index: 50; display: flex;
  /* BOX    */ gap: 0.75rem;

}

.close-btn { 

  /* CURSOR */ cursor: pointer; user-select: none;
  /* LAYOUT */ position: relative;
  /* FILL   */ background: transparent; color: var(--humo-a60);
  /* BORDER */ border: none; box-shadow: none;
  /* FONT   */ font-family: var(--font-mono); font-size: 1.5rem; line-height: 1;
  /* FX     */ mix-blend-mode: difference;
  /* MOTION */ transition: color var(--animate-fast);

  &:hover { color: var(--lirio); }

}

.lang-btn { font-size: 1rem; font-weight: bold; }

.profile-group { position: relative; display: flex; align-items: center; z-index: 20; }

.message-box { 

  /* LAYOUT */ position: absolute; right: 100%; z-index: 1; pointer-events: none;
  /* BOX    */ width: 28rem; margin-right: 2rem;
  /* FONT   */ text-align: right;

  & p  { font-size: 0.95rem; line-height: 1.5; color: var(--humo); }
  & h2 { color: var(--lirio); margin: 0 0 0.5rem 0; font-size: 1.5rem; }

  & .subtitle { font-family: var(--font-mono); font-style: italic; font-size: 0.9rem; color: var(--humo-a60); margin: 0; }

}

.stack { 

  /* LAYOUT */ display: flex; flex-wrap: wrap; justify-content: flex-end;
  /* BOX    */ margin-top: 1rem; gap: 0.5rem;

  & span {

    /* BOX    */ padding: 0.2rem 0.5rem;
    /* FILL   */ background-color: var(--carbon-a15); color: var(--cristal);
    /* BORDER */ border: 1px solid var(--cristal-a31); border-radius: var(--radius-ss);
    /* FONT   */ font-family: var(--font-mono); font-size: 0.75rem;

  }

}

.avatar { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ position: relative; z-index: 2; overflow: hidden;
  /* BOX    */ width: 15rem; height: 15rem; flex-shrink: 0; object-fit: cover;
  /* FILL   */ background-color: var(--carbon);
  /* BORDER */ border-radius: 50%; border: 2px solid var(--humo-a15);
  /* MOTION */ transition: transform var(--animate-fast), filter var(--animate-fast);

  &:hover { transform: scale(.95); filter: brightness(1.25); }

}

.rays-wrapper { 

  /* LAYOUT */ position: absolute; inset: 0; z-index: 10; pointer-events: none;
  /* FX     */ mask-image: radial-gradient(ellipse 25rem 20rem at calc(50% - 12rem) 50%, transparent 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 75%, black 100%); -webkit-mask-image: radial-gradient(ellipse 25rem 20rem at calc(50% - 12rem) 50%, transparent 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 75%, black 100%);

}

.rays-container { 

  /* LAYOUT */ position: absolute; left: 50%; top: 50%;
  /* BOX    */ width: 0; height: 0;

}

.ray-box { 

  /* CURSOR */ cursor: pointer; pointer-events: auto;
  /* FOCUS  */ &:focus { outline: none; } &:focus-visible .ray-text { outline: var(--small-outline) var(--humo); outline-offset: 3px; }
  /* LAYOUT */ position: absolute; left: 0; top: -1.5rem; display: flex; align-items: center; justify-content: flex-start;
  /* BOX    */ width: 35rem; height: 3rem; padding-left: 9rem; transform-origin: left center;
  /* MOTION */ transition: transform var(--animate-mid); will-change: transform;

}

.ray-line { 

  /* LAYOUT */ position: relative; z-index: 2; flex-shrink: 0;
  /* BOX    */ width: 1.5rem; height: 1px; margin-right: 0.5rem;
  /* FILL   */ background-color: var(--humo-a15);
  /* MOTION */ transition: background-color var(--animate-fast), width var(--animate-fast);

}

.ray-text { 

  /* LAYOUT */ position: relative; z-index: 2; display: flex; align-items: flex-end; justify-content: center;
  /* BOX    */ padding: 0.3rem 0.8rem; height: 1.5rem;
  /* FILL   */ color: var(--humo);
  /* BORDER */ border-radius: 9999px; corner-shape: superellipse(1.4);
  /* FONT   */ font-family: var(--font-mono); font-size: 0.8rem; white-space: nowrap;
  /* MOTION */ transition: color var(--animate-fast), background-color var(--animate-fast), border-color var(--animate-fast), box-shadow var(--animate-fast);

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
  /* BOX    */ width: 1.5rem; height: 1.5rem;
  /* FILL   */ color: var(--carbon);
  /* BORDER */ border-radius: 50%;
  /* MOTION */ transition: transform var(--animate-fast), box-shadow var(--animate-fast);

  & svg { width: 1.1rem; height: 1.1rem; display: block; fill: currentColor; }

}

.ray-data {

  /* LAYOUT */ position: absolute; top: 2.5rem; display: flex; flex-direction: column; z-index: 1; pointer-events: none;
  /* BOX    */ width: 22rem; gap: 0.5rem; padding: .5rem;
  /* FONT   */ text-shadow: 1px 1px 2px var(--carbon);
  /* MOTION */ animation: spawnData var(--animate-fast) forwards;

  & .meta {

    /* LAYOUT */ display: flex; align-items: center; flex-wrap: nowrap; gap: .4rem; overflow: hidden; white-space: nowrap;
    /* BOX    */ margin: 0 0 .15rem 0;
    /* FILL   */ color: var(--humo);
    /* FONT   */ font-family: var(--font-mono); font-size: 0.7rem; text-transform: lowercase; letter-spacing: .04em;

    & .sep  { color: var(--humo-a40); }

  }

  & .legend {

    /* LAYOUT */ display: flex; align-items: center; gap: .35rem;
    /* BOX    */ margin: 0 0 .15rem 0;
    /* FILL   */ color: var(--humo);
    /* FONT   */ font-family: var(--font-mono); font-size: 0.7rem;

    & .key      { width: .6rem; height: .6rem; border-radius: 2px; display: inline-block; }
    & .key.dis  { background-color: var(--lirio);   }
    & .key.dev  { background-color: var(--cristal); margin-left: .6rem; }

  }

  & .desc.welcome { white-space: pre-line; }

  & .desc {

    /* BOX    */ margin: 0;
    /* FONT   */ font-family: var(--font-mono); color: var(--humo); font-size: 0.85rem; line-height: 1.5;
    /* CLAMP  */ display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden;

  }

  & .tag {

    /* BOX    */ padding: 0; 
    /* FONT   */ font-family: var(--font-mono); font-size: 0.7rem; color: var(--humo-a31);

  }

  & .tags { display: flex; flex-wrap: wrap; gap: 0.6rem; }

}

.ray-diseño { 

  & .ray-text { border: 1px solid var(--lirio-a60); }

  & .portal-line,    & .portal-trigger    { background-color: var(--lirio); }
  &:hover .ray-line, &.selected .ray-line { background-color: var(--lirio); width: 2.5rem; }
  &:hover .ray-text, &.selected .ray-text { color: var(--carbon); background-color: var(--lirio); border-color: var(--lirio); }

  &:hover    .ray-text { box-shadow: 0 0 .7rem  0 var(--lirio-a15); }
  &.selected .ray-text { box-shadow: 0 0 1.1rem 0 var(--lirio-a21), 0 0 .4rem 0 var(--lirio-a08); }

  &:hover .ray-portal .portal-line        { width: 4rem; }
  
  & .year { color: var(--cristal); }
  & .tag  { color: var(--lirio);   }

}

/* The welcome ray borrows the design palette but never behaves like a project:
   no portal trigger, no note behind it. */

.ray-welcome {

  & .ray-text { border: 1px solid var(--humo-a60); }

  &:hover .ray-line, &.selected .ray-line { background-color: var(--humo); width: 2.5rem; }
  &:hover .ray-text, &.selected .ray-text { color: var(--carbon); background-color: var(--humo); border-color: var(--humo); }

  &:hover    .ray-text { box-shadow: 0 0 .7rem  0 var(--humo-a15); }
  &.selected .ray-text { box-shadow: 0 0 1.1rem 0 var(--humo-a21), 0 0 .4rem 0 var(--humo-a08); }

}

.ray-desarrollo { 

  & .ray-text { border: 1px solid var(--cristal-a60); }

  & .portal-line,    & .portal-trigger    { background-color: var(--cristal); }
  &:hover .ray-line, &.selected .ray-line { background-color: var(--cristal); width: 2.5rem; }
  &:hover .ray-text, &.selected .ray-text { color: var(--carbon); background-color: var(--cristal); border-color: var(--cristal); }

  &:hover    .ray-text { box-shadow: 0 0 .7rem  0 var(--cristal-a15); }
  &.selected .ray-text { box-shadow: 0 0 1.1rem 0 var(--cristal-a21), 0 0 .4rem 0 var(--cristal-a08); }

  &:hover .ray-portal .portal-line { width: 4rem; }
  
  & .year { color: var(--lirio);   }
  & .tag  { color: var(--cristal); }

}

@keyframes spawnData { 0% { opacity: 0; } 100% { opacity: 1; } }

@media (max-width: 1000px) { 

  .fullscreen     { padding-bottom: 1rem !important;                                                                                                                                               }
  .portfolio      { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 5rem 1.5rem 4rem 1.5rem !important; overflow-y: auto; scrollbar-width: none; }
  .profile-group  { display: flex; flex-direction: column-reverse; align-items: center; width: 100%; max-width: 25rem; margin-bottom: 1.5rem; gap: 2rem;                                           }
  .message-box    { position: relative; right: auto; width: 100%; margin: 0; text-align: left;                                                                                                     }
  .avatar         { width: 10rem; height: 10rem; align-self: flex-start;                                                                                                                           }
  .rays-wrapper   { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 25rem; height: auto; margin: 0; mask-image: none; -webkit-mask-image: none;                 }
  .rays-container { position: relative; left: auto; top: auto; display: flex; flex-direction: column; width: 100%; gap: 1rem;                                                                      }

  .ray-box        { position: relative; left: auto; top: auto; display: flex; flex-wrap: wrap; width: 100%; height: auto;
                    padding-left: calc(var(--i) * 0.42rem);
                    transform: rotate(calc((var(--i) - (var(--n) - 1) / 2) * 1.15deg)) !important;
                    transform-origin: left center;                                                                                                 }
  .ray-data       { position: relative; top: auto; display: flex; width: 100%; padding: 1rem 1rem .5rem 1rem; margin: 0;                                                                           }
  .ray-line       { display: none;                                                                                                                                                                 }
  .stack          { justify-content: flex-start;                                                                                                                                                   }

}

</style>