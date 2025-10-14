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
        description: props.metadata.description || 'toca una nota de la tabla para cargarla',
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

<style>

.card { display: flex; flex-direction: row; width: 100%; align-items: stretch; max-height: 25%;}
.title { font-size: 1.25rem; }
.description { font-style: italic; }
.author { width: 25px; height: auto; border-radius: 50%; }
.cover { max-width: 50%; background-color: #986C98; transition: filter .5s ease;}
.cover img { display: block; width: 100%; height: 100%; object-fit: cover;}
.cover:hover { filter: grayscale() }

.text { background: linear-gradient(125deg, #8AB6BB 0%, #986C98 100%); width: 100%; transition: filter 0.3s ease; border-radius: 3px;}
.text:hover { filter: brightness(95%); }

.info {
    font-family: 'Inconsolata';
    display: flex; flex-direction: column;
    justify-content: center;
    width: 100%; height: 100%;
    padding: 1.5rem;
    min-width: 50%;
    gap: 1rem;
    transition: transform 0.3s ease;
}
.info hr { border:none; border-top: 1px solid #1B1C1C; margin: 0;  }
.info:hover { transform: scale(0.99); }

.profile { 
    display: inline-flex;
    flex-direction: row ;
    padding: .5rem 1rem .5rem .6rem;
    gap: .65rem;
    align-items: center;
    background-color: #1B1C1C25;
    border-radius: 9999px;
    transition: background-color 0.3s ease;
    user-select: none;
}
.profile:hover { background-color: #1B1C1C50; cursor: pointer; }
.profile:active { transform: scale(0.99); }

</style>