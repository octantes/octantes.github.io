<script setup> 
import { useStore } from '../04/store.js'
import sigil from '../../content/assets/sigil.png'

const store           = useStore()                                                                                                    // initializes global store

</script>

<template> 

  <div class="backdrop" @click="store.togglePopup">

    <div class="popup">

      <img  class="sigil" :src="sigil" alt="sigilo" />
      
      <button class="closebutton" @click.stop="store.togglePopup" title="cerrar notificacion" aria-label="cerrar la notificación popup">✘</button>

      <div class="postbox">
        
        <div class="poptext">

          <span v-html="store.popString"></span>
          
        </div>
        
        <a :href="store.popLink" class="ghostlink" target="_blank" @click="store.togglePopup" :title="'ir al enlace: ' + store.popString" :aria-label="'abrir enlace de la notificación: ' + store.popString"></a>

      </div>

      <div class="underbox"/>

    </div>

  </div>

</template>

<style scoped> 

.backdrop { 

  /* LAYOUT */ position: absolute; display: flex; align-items: center; justify-content: center; z-index: 50; inset: 0;
  /* FILL   */ background-color: var(--carbon99); backdrop-filter: blur(8px);
  /* MOTION */ animation: fadeIn var(--animate-mid);

}

.popup { position: relative; animation: fadeIn var(--animate-mid); }

.sigil { 
  
  /* CURSOR */ user-select: none;
  /* LAYOUT */ display: block; position: absolute; z-index: 20;
  /* BOX    */ width: 5rem; top: -1.5rem; left: -1.5rem;
  /* IMAGE  */ image-rendering: pixelated; transform: translateZ(0); backface-visibility: hidden; pointer-events: none;

}

.postbox { 

  /* LAYOUT */ position: relative; display: flex; align-items: center; justify-content: center; z-index: 2;
  /* BOX    */ width: 480px; height: 480px;
  /* FILL   */ background-color: var(--niebla);
  /* SHAPE  */ clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%); filter: drop-shadow(0 0 1px var(--ceniza));
  /* IMAGE  */ background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, var(--humo25) 2px, var(--humo25) 4px);

  &:hover { box-shadow: inset 0rem 0rem 5rem var(--ceniza); }
  &::after { content: ""; position: absolute; inset: 0; background-color: var(--arcilla); opacity: 0; transition: opacity var(--animate-fast); pointer-events: none; }
  &:hover::after { opacity: 0.25; }
  
}

.ghostlink { position: absolute; inset: 0; z-index: 10; cursor: pointer; }

.poptext { 

  /* LAYOUT */ text-align: center; line-height: 1.5;
  /* FONT   */ font-family: var(--font-mono); font-weight: bold; font-size: 1.5rem;
  /* FILL   */ color: var(--carbon);
  /* BORDER */ text-shadow: .5px .5px 0px var(--arcilla80);
  
}

.underbox { 
  
  /* LAYOUT */ position: absolute; z-index: 1;
  /* BOX    */ width: 480px; height: 480px; inset: 0; scale: 96%;
  /* BORDER */ border: .35rem solid var(--ceniza); box-shadow: inset 0 0 0 1rem var(--arcilla), inset 0 0 0 calc(1rem + .35rem) var(--ceniza);

}

.closebutton { 

  /* CURSOR */ cursor: pointer;
  /* LAYOUT */ user-select: none; display: block; position: absolute; z-index: 20;
  /* BOX    */ top: -1rem; right: -1rem; width: 3rem; height: 3rem;
  /* FILL   */ color: var(--ceniza); background: var(--arcilla);
  /* FONT   */ font-size: 1.5rem; font-weight: bold;
  /* BORDER */ border: none; box-shadow: inset 0 0 0 .25rem var(--ceniza), inset 0rem 0rem .8rem var(--ceniza);
  /* MOTION */ transition: all var(--animate-fast);

  &:hover { color: var(--ceniza); background: var(--humo); }
  
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 1080px) { .popup { scale: 50%; } }

</style>