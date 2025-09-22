<script setup>
import { computed } from 'vue'

const metadata = defineProps({ metadata: Object })
const authors = { 
    kaste: { img: 'content/assets/kaste.jpg', link: 'https://x.com/octantes' },
    octantes: { img: 'content/assets/kaste.jpg', link: 'https://x.com/octantes' },
}

const data = computed(() => ({
    ...metadata,
    portada: metadata?.portada || 'https://octantes.github.io/posts/test/portal.webp',
    title: metadata?.title || 'titulo del post',
    description: metadata?.description || 'descripcion del post derivada de las primeras lineas descripcion del post derivada de las primeras lineas',
    handle: metadata?.handle || 'kaste',
    date: metadata?.date || '10/10/25',
}))

const author = computed( () => authors[data.value.handle] || { img: 'content/assets/kaste.jpg', link: 'https://x.com/octantes' } )
function openAuthor() { window.open(author.value.link, '_blank') }

</script>

<template>

  <div class="card">

    <div class="text">

        <div class="info">
            
            <div class="title">{{ data.title }}</div>
            <div class="description">{{ data.description }}</div>
            <hr />
            <div class="profile" @click="openAuthor">
                <img class="author" :src="author.img" />
                <span>@{{ data.handle }} - {{ data.date }}</span>
            </div>

        </div>

    </div>

    <div class="cover">
        <img :src="data.portada" alt="" />
    </div>  

  </div>

</template>

<style>

.card { display: flex; flex-direction: row; width: 100%; align-items: stretch; }
.text { background: linear-gradient(125deg, #8AB6BB 0%, #986C98 100%); }
.title { font-size: 1.25rem; }
.description { font-style: italic; }
.author { width: 25px; height: auto; border-radius: 50%; }

.cover { max-width: 50%; background-color: #986C98; transition: filter .5s ease;}
.cover img { display: block; width: 100%; height: 100%; object-fit: cover;}
.cover:hover { filter: grayscale() }

.info {
    font-family: 'Inconsolata';
    display: flex; flex-direction: column;
    justify-content: center;
    width: 100%; height: 100%;
    padding: 1.5rem;
    min-width: 50%;
    gap: 1rem;
    transition: transform 0.3s ease, background-color 0.3s ease;
}
.info hr { border:none; border-top: 1px solid #1B1C1C; margin: 0;  }
.info:hover { transform: scale(0.99); background-color: #1B1C1C15;}

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