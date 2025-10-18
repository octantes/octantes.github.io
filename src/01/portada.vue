<script setup>
import { computed } from 'vue'

const props = defineProps({ metadata: { type: Object, default: () => ({}) } })
function openAuthor() { window.open(data.value.author.link, '_blank', 'noopener,noreferrer') }

const data = computed(() => {

    const handle = props.metadata.handle || 'kaste'

    const authors = { 
        kaste: { img: '/assets/kaste.jpg', link: 'https://x.com/octantes' },
        octantes: { img: '/assets/kaste.jpg', link: 'https://x.com/octantes' },
    }

    return {
        title: props.metadata.title || 'bienvenido a octantes.net!',
        description: props.metadata.description || 'toca una nota de la tabla para cargarla y empezar a leer, o tambien podes filtrar segun el tipo de post que queres encontrar en la pagina',
        author: authors[handle] || { img: '/assets/kaste.jpg', link: 'https://x.com/octantes' },
        date: props.metadata.date || '2025',
        portada: props.metadata.portada || '',
        handle,
    }

})

</script>

<template>

  <div class="card">

    <div class="text">

        <div class="info">
            
            <div class="title">{{ data.title }}</div>
            <div class="description">{{ data.description }}</div>
            <hr />
            <div class="profile" @click="openAuthor">
                <img class="author" :src="data.author.img" />
                <span>@{{ data.handle }} - {{ data.date }}</span>
            </div>

        </div>

    </div>

    <div class="cover" v-if="data.portada">
        <img :src="data.portada" alt="" />
    </div>

  </div>

</template>