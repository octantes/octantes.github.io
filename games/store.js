import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DICT } from '@/04/lang.js'
import { other } from '@/04/map.js'

function remembered() { try { return localStorage.getItem('lang') } catch { return null } }

function detected() { return (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en' }

export const useStore = defineStore('store', () => {

  const lang        = ref(remembered() || detected())
  const t           = computed(() => DICT[lang.value])
  const processing  = ref(false)
  const groundLight = ref(null)
  const barContent  = ref('/ '.repeat(300))

  document.documentElement.lang = lang.value

  function setLang(value) {
    lang.value = value
    document.documentElement.lang = value
    try { localStorage.setItem('lang', value) } catch { }
  }

  function toggleLang()          { setLang(other(lang.value)) }
  function setProcessing(value)  { processing.value = value; document.body.style.cursor = value ? 'wait' : '' }

  return { lang, t, processing, groundLight, barContent, toggleLang, setProcessing }

})