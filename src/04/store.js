import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStore = defineStore('store', () => {

  const processing   = ref(false)                                                                                                     // disabled component state
  const isCentered   = ref(false)                                                                                                     // triple layout (centered note)
  const searchQuery  = ref('')                                                                                                        // searchbox current search
  const activeFilter = ref('full')                                                                                                    // active tab filter

  // acciones

  function toggleView()       { isCentered.value = !isCentered.value }
  function setProcessing(val) { processing.value = val }
  function setSearchQuery(query)   { searchQuery.value = query }
  function setActiveFilter(filter) { activeFilter.value = filter }

  return {

    /* STATES     */ processing, setProcessing,
    /* LAYOUT     */ isCentered, toggleView,
    /* NAVIGATION */ searchQuery, activeFilter, setSearchQuery, setActiveFilter

  }

})