<script setup>
defineProps({ html: String })
</script>

<template>
  <div class="note">
    <div class="text" v-html="html"></div>
      <div class="text">
        <a href="ttps://www.fontsquirrel.com/fonts/uncut-sans">testaskdosihfbaofhsoi</a>
        <p>la tesis del proyecto es pensar las <strong>secciones</strong> necesarias para presentarlas en dos visores
      de esta forma la pagina se mantiene coherente al ser siempre el mismo layout para todo
      es importante vincular los proyectos <i>principales a través de notas</i> que aporten contexto
      elevando el valor final de la publicación al integrar soportes visuales, referencias y datos</p>
        <ul>
        <li>visor con la presentación del sitio, la navegacion, las novedades y links externos</li>
        <li>visor dinámico de contenido para presentar todos los artículos y los proyectos</li>
        <li>statusbar integrando elementos dinámicos, datos en real time y toggle idioma</li>
        </ul>
        <p><img src="https://octantes.github.io/posts/test/portal.webp" width="1200" height="630" loading="lazy" alt="holahola"></p>
        <p>el visor de <strong>proyectos</strong> integra distintos layouts según el contenido que debe presentar
        se suman funcionalidades exclusivas, como una barra de scroll o el shader de espera</p>
        <h2>holahola</h2>
        <ol>
        <li>asemicdos y sellosiete usan el layout de landing page, integrando sus stylesheets</li>
        <li>nubenueve usa el layout de nota pero integra los embeds de youtube y de spotify</li>
        <li>signoseis usa el layout de nota pero sin integrar embeds, con un stylesheet unico</li>
        </ol>
    </div>
  </div>
</template>

<style>

.text {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
  color: #AAABAC;
  font-size: 1rem;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: break-word;
  padding: 1rem;
}

.text img {
  display: block;
  max-width: 100%;
  height: auto;
}

</style>