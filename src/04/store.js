import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('store', () => {

  // states

  const processing = ref(false)

  // layout

  const isCentered = ref(false)

  // acciones

  function toggleView() { isCentered.value = !isCentered.value }
  function setProcessing(val) { processing.value = val }

  return {

    /* STATES */ processing,
    /* LAYOUT */ isCentered,
    /* USAGES */ toggleView, setProcessing

  }

})