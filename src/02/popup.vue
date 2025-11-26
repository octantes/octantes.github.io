<script setup>
import { useStore } from '../04/store.js'
const store = useStore()
</script>

<template>
  <div class="backdrop">
    
    <div class="popup-frame">
      
      <div class="sidebar">
        <div class="glyph-container">
          <pre>
▓▓
░░
▓▓
▒▒
▓▓
          </pre>
        </div>
      </div>

      <div class="main-body">
        
        <button class="close-btn" @click="store.togglePopup">X</button>

        <div class="content">
          <slot>
            cien vientos rompen<br>hacia el cielo
          </slot>
        </div>

        <div class="corner-deco"></div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.backdrop {
  /* esto asegura que cubra SOLO al padre relativo (navigation) */
  position: absolute;
  inset: 0; 
  z-index: 50;
  
  /* oscurecimiento y blur */
  background-color: var(--carbon99); 
  backdrop-filter: blur(2px);
  
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* animación de entrada simple */
  animation: fadeIn var(--animate-fast);
}

.popup-frame {
  display: flex;
  box-shadow: 4px 4px 0px rgba(0,0,0,0.5);
  max-width: 90%;
}

.sidebar {
  background-color: #5d3a3a; /* tono rojizo de tu ref */
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--small-outline) var(--humo25);
  border-right: none;
}

.glyph-container pre {
  font-family: var(--font-mono);
  color: var(--brillo);
  line-height: 1;
  font-size: 10px;
  margin: 0;
}

.main-body {
  position: relative;
  background-color: var(--niebla); /* gris commodore */
  padding: 3rem 2rem;
  min-width: 260px;
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--small-outline) var(--humo25);
  
  /* patrón de grilla sutil */
  background-image: 
    linear-gradient(var(--humo25) 1px, transparent 1px),
    linear-gradient(90deg, var(--humo25) 1px, transparent 1px);
  background-size: 20px 20px;
}

.content {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--carbon);
  text-align: center;
  line-height: 1.6;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background: #5d3a3a;
  color: var(--brillo);
  border: none;
  border-bottom: var(--small-outline) var(--humo25);
  border-left: var(--small-outline) var(--humo25);
  cursor: pointer;
  padding: 0.5rem 0.8rem;
  font-family: var(--font-mono);
  font-weight: bold;
  transition: all var(--animate-fast);
}

.close-btn:hover {
  background-color: var(--lirio);
  color: var(--carbon);
}

.corner-deco {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 0; 
  height: 0; 
  border-left: 15px solid transparent;
  border-top: 15px solid transparent;
  border-bottom: 15px solid #5d3a3a;
  border-right: 15px solid #5d3a3a;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>