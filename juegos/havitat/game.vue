<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'
import Havitat from '../../src/01/havitat.vue'
import { direct } from './director.js'

const place = ref({ kind: 'havitat' })
const view  = ref(null)

let stop = null

function go(target) { if (typeof target !== 'string') place.value = target }

onMounted(() => { stop = direct(() => view.value?.room) })

onBeforeUnmount(() => stop?.())

</script>

<template>

  <Havitat ref="view" :place="place" watching @go="go" />

</template>
