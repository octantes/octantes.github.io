<script setup> 
import { computed } from 'vue'

const props = defineProps({ metadata: { type: Object, default: () => ({}) } })
function openAuthor() { window.open(data.value.author.link, '_blank', 'noopener,noreferrer') }

const data = computed(() => {

    const handle = props.metadata.handle || 'kaste'
    const authors = { 

        kaste: { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },
        octantes: { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },

    }

    return {

        title: props.metadata.title || 'bienvenido a octantes.net!',
        description: props.metadata.description || 'toca una nota de la tabla para cargarla y empezar a leer, o tambien podes filtrar segun el tipo de post que queres encontrar en la pagina',
        author: authors[handle] || { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },
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

<style scoped> 

.card { 

  /* LAYOUT */ display: flex; flex-direction: row; align-items: stretch;
  /* BOX    */ width: 100%;

}

.text { 

  /* BOX    */ width: 100%;
  /* FILL   */ background: linear-gradient(125deg, var(--cristal) 0%, var(--lirio) 100%);
  /* BORDER */ border-radius: var(--radius-ss);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { filter: brightness(95%); }

}

.info { 

  /* LAYOUT */ display: flex; flex-direction: column; justify-content: center;
  /* FONT   */ font-family: var(--font-mono);
  /* BOX    */ width: 100%; height: 100%; min-width: 50%; padding: 1.5rem; gap: 1rem;
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { transform: var(--scale-min); }

  & hr { 

    /* BORDER */ border: none; border-top: var(--small-outline) var(--carbon);
    /* BOX    */ margin: 0;

  }

}

.title { font-size: 1.25rem; }

.description { 

  /* BOX    */ height: calc(1.25rem * 2);
  /* FONT   */ font-style: italic; overflow: hidden; line-height: 1.25rem;

}

.profile { 

  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: inline-flex; flex-direction: row; align-items: center;
  /* BORDER */ border-radius: 9999px;
  /* BOX    */ padding: .5rem 1rem .5rem .6rem; gap: .65rem;
  /* FILL   */ background-color: var(--carbon25);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover  { cursor: pointer; background-color: var(--carbon50); }
  &:active { transform: var(--scale-min); }
  
}

.author { 

  /* LAYOUT */ border-radius: 50%;
  /* BOX    */ width: 25px; height: auto;

}

.cover { 

  /* LAYOUT */ max-width: 50%;
  /* FILL   */ background-color: var(--lirio);
  /* MOTION */ transition: all var(--animate-mid);

  &:hover { filter: grayscale() }
  & img   { display: block; width: 100%; height: 100%; object-fit: cover; }

}

</style>