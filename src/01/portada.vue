<script setup> 
import { computed } from 'vue'

const props = defineProps({ metadata: { type: Object, default: () => ({}) } })
function openAuthor(link) { window.open(link, '_blank', 'noopener,noreferrer') }

const authorsMap = {
    incognito: { img: '/assets/incognito.webp', link: 'https://x.com/octantes' },
    kaste: { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },
    octantes: { img: '/assets/kaste.webp', link: 'https://x.com/octantes' },
}

const data = computed(() => {

    let rawHandle = props.metadata.handle || 'kaste'
    const handles = Array.isArray(rawHandle) ? rawHandle : [rawHandle]
    
    const postAuthors = handles.map(h => {

        const handleName = String(h).replace(/^@/, '')
        const authorInfo = authorsMap[handleName] || authorsMap['kaste'] // fallback a kaste
        
        return {
            handle: handleName,
            img: authorInfo.img,
            link: authorInfo.link,
            // el primer autor lleva la fecha y el flag de full-width
            full: h === handles[0], 
            date: h === handles[0] ? props.metadata.date || '2026' : null,
        }
    })

    return {
        title: props.metadata.title || 'bienvenido a octantes.net!',
        description: props.metadata.description || 'toca una nota de la tabla para cargarla y empezar a leer, o tambien podes filtrar segun el tipo de post que queres encontrar en la pagina',
        authors: postAuthors,
        portada: props.metadata.portada || '',
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

        <div class="authors-list">
          
          <div v-for="author in data.authors" :key="author.handle" class="profile" :class="{ 'profile-full': author.full }" @click="openAuthor(author.link)" >

                <img class="author" :src="author.img" />
                <span>@{{ author.handle }}<span v-if="author.date"> - {{ author.date }}</span></span>

          </div>

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

.authors-list {

    /* LAYOUT */ display: flex; flex-direction: row; gap: .25rem;
    /* BOX    */ flex-wrap: wrap;

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

.profile-full {

  /* LAYOUT */ flex-grow: 1; justify-content: flex-start;

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