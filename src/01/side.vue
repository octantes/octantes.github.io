<script setup> 
import { useStore } from '../04/store.js'
import { storeToRefs } from 'pinia'
import authorpic from '../../content/assets/kaste.jpg'

const store = useStore()
const { activeFilter } = storeToRefs(store)

const loadReference = (type, slug) => { store.loadContent(type, slug) }

</script>

<template> 

  <div class="side">

    <img class="profilepic" :src="authorpic" alt="kaste profile pic"/>

    <div v-if="activeFilter === 'full'"> 

      <p>

        buenas! soy <i>kaste</i> y lo que estás viendo es mi base de operaciones     <br>

        <br>

        armé <b>octantes</b> para centralizar toda mi producción fuera de las redes  <br>
        recuperando los fundamentos, sin algoritmos, reglas o intermediarios         <br>
        vas a encontrar proyectos de todo tipo, vos elegís lo que querés ver         <br>
        desde música, textos y diseño hasta videojuegos y software propio            <br>

        <br>

        la página me permite adaptar el formato al contenido que voy creando         <br>
        y pensar mis proyectos se vuelve más fácil con outputs definidos             <br>

        <br>

        usá las pestañas superiores de la tabla para filtrar por sección             <br>
        cuando un posteo te llame la atención, clickealo para cargarlo acá           <br>

      </p>

      <br><hr><br>
    
      <p>si querés saber más <i>sobre el proyecto</i> podes leer estos posteos</p> <br>

      <a href="#" @click.prevent="loadReference('textos', 'por qué decidi armar una página')">por qué decidi armar una página en 2025?</a> <br>

    </div>

    <div v-if="activeFilter === 'diseño'"> 

      <p>

        estás viendo la sección de <i>diseño</i>, acá viven mis proyectos multimedia <br>

        <br>

        disfruto mucho armar <b>identidades</b> y pensar assets que las acompañen    <br>
        algunos de estos trabajos son solo de práctica, excusas para aprender        <br>
        otros son encargos reales, puestos a prueba en distintos entornos            <br>
        mi foco es la multimedialidad, lograr una fusión interesante de medios       <br>

        <br>

        vas a encontrar trabajos de branding, diseño web y piezas editoriales        <br>
        desde interfaces hasta logotipos, fanzines, stickers y otros objetos         <br>

        <br>

        si te interesa algún proyecto, clickealo para ver el desglose completo       <br>
        vas a encontrar la galería, el proceso, las herramientas e influencias       <br>

      </p>

      <br><hr><br>
    
      <p>si querés saber más <i>sobre mis diseños</i> podes leer estos posteos</p> <br>

      <a href="#" @click.prevent="loadReference('textos', 'lo que me interesa al diseñar')">lo que me interesa al diseñar</a> <br>

    </div>

    <div v-if="activeFilter === 'desarrollo'"> 

      <p>

        estás viendo la sección de <i>desarrollo</i>, acá armo mis herramientas    <br>

        <br>

        desde que aprendí a <b>programar</b>, se me abrieron muchas posibilidades  <br>
        ahora cuando no encuentro algo que necesito, puedo armarlo de cero         <br>
        también me permite implementar diseños propios en entornos reales          <br>
        esta sección muestra la parte que ya es pública de esos desarrollos        <br>


        <br>

        vas a encontrar software, experimentos gráficos y otras utilidades         <br>
        desde herramientas de producción y productividad hasta shaders             <br>

        <br>

        si te interesa algún proyecto, clickealo para ver el desglose completo     <br>
        vas a encontrar el repositorio, el proceso, las herramientas e imágenes    <br>

      </p>

      <br><hr><br>
    
      <p>si querés saber más <i>sobre mi desarrollo</i> podes leer estos posteos</p> <br>

      <a href="#" @click.prevent="loadReference('textos', 'mi roadmap de desarrollo')">mi roadmap de desarrollo</a> <br>

    </div>

    <div v-if="activeFilter === 'musica'"> 

      <p>

        estás viendo la sección de <i>música</i>, acá es donde tejo hechizos          <br>

        <br>

        desde el primer tema que hice, <b>producir</b> se volvió una necesidad total  <br>
        cuando no entro seguido en ese estado de trance, pierdo la templanza          <br>
        armar canciones en el sentido tradicional no es mi principal interés          <br>
        me llama mucho más crear paisajes que transmitan una emoción                  <br>

        <br>

        vas a ver álbumes, acompañados por experimentos audiovisuales                 <br>
        desde proyectos terminados hasta descartes y demos sin mezclar                <br>

        <br>

        si te interesa escuchar algo, clickealo para ver el video en youtube          <br>
        también vas a encontrar el disco en spotify y otras plataformas               <br>

      </p>

      <br><hr><br>
    
      <p>si querés saber más <i>sobre mi música</i> podes leer estos posteos</p> <br>

      <a href="#" @click.prevent="loadReference('textos', 'por qué hago música?')">por qué hago música?</a> <br>

    </div>

    <div v-if="activeFilter === 'textos'"> 

      <p>

        estás viendo la sección de <i>textos</i>, acá desarrollo mis intereses        <br>

        <br>

        para mí, <b>escribir</b> siempre fue la mejor forma de ordenar las ideas      <br>
        en ese proceso aparecen borradores que acá traduzco a artículos               <br>
        la idea es conectar los puntos entre distintos desarrollos de la página       <br>
        para aportar un marco teórico a la práctica y disparar nuevos procesos        <br>

        <br>

        vas a encontrar bitácoras, reflexiones y análisis de cosas variadas           <br>
        escritas en formato de blog personal, sin demasiada formalidad                <br>

        <br>

        si querés leer algunos de mis pensamientos, clickeá un posteo                 <br>
        a lo largo de distintas notas se van desarrollando las temáticas              <br>

      </p>

      <br><hr><br>
    
      <p>si querés saber más <i>sobre lo que escribo</i> podes leer estos posteos</p> <br>

      <a href="#" @click.prevent="loadReference('textos', 'por qué y cómo escribo?')">por qué y cómo escribo?</a> <br>

    </div>

    <div v-if="activeFilter === 'juegos'"> 

      <p>

        estás viendo la sección de <i>videojuegos</i>, mi principal laboratorio       <br>

        <br>

        diseñar <b>fichines</b> siempre ha sido mi endgame, el objetivo final         <br>
        participé en gamejams y armé prototipos para practicar un poco                <br>
        pero siempre quise desarrollar cosas jugables desde el navegador              <br>
        porque la web es de los pocos lugares donde aún hay límites técnicos          <br>

        <br>

        vas a encontrar juegos centrados en lo mecánico y otros en lo narrativo       <br>
        lo que más me interesa es pensar el juego como sistema y ver qué sale         <br>

        <br>

        si querés probar algún prototipo, simplemente cargalo desde la tabla          <br>
        la mayoría corren en el navegador y otros pueden ser descargables             <br>

      </p>

      <br><hr><br>
    
      <p>si querés saber más <i>sobre el proyecto</i> podes leer estos posteos</p> <br>

      <a href="#" @click.prevent="loadReference('textos', 'mi proceso para hacer fichines')">mi proceso para hacer fichines</a> <br>

    </div>

  </div>

</template>

<style scoped> 

.profilepic { 

  /* LAYOUT */ border-radius: 50%;
  /* BOX    */ width: 5rem; height: 5rem;
  /* FONT   */ align-self: center;
  /* BORDER */ border: var(--small-outline) var(--humo25);

}

.side { 

  /* LAYOUT */ display: flex; flex-direction: column; text-align: center;
  /* BOX    */ width: 100%; padding: 4rem 3rem 2rem 3rem; gap: 1rem; z-index: 1; overflow-wrap: break-word;
  /* FILL   */ background-color: var(--carbon); color: var(--humo);
  /* BORDER */ border: var(--small-outline) var(--humo10); border-radius: var(--radius-xs);
  /* FONT   */ font-size: .8vw; line-height: 1.5; word-break: break-word;

  &:disabled { cursor: not-allowed; opacity: var(--alpha-disabled); }

}

.logo { 

  /* LAYOUT */ display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
  /* BOX    */ width: 100%; overflow: hidden;
  /* FONT   */ font-size: .8vw;

  &.clickable { cursor: pointer; }

  & pre {
  
    /* LAYOUT */ flex-shrink: 0;
    /* BOX    */ margin-bottom: .25rem; margin-top: .8rem; overflow: visible;
    /* FILL   */ background: linear-gradient(125deg, var(--cristal), var(--lirio)); color: var(--lirio);
    /* FONT   */ font-family: monospace;
    /* WEBKIT */ -webkit-text-fill-color: transparent; -webkit-background-clip: text; background-clip: text;
  
  }

}

@media (max-width: 1400px) { .sidefilter { font-size: 0.9rem; } }

</style>