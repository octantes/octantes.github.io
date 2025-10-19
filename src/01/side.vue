<script setup> 

</script>

<template> 

  <div class="side">
    
  </div>

</template>

<style scoped> 

.side { 

  /* LAYOUT */ display: flex; flex-direction: column;
  /* BOX    */ padding: 1rem;
  /* FILL   */ background-color: var(--carbon); color: var(--niebla);
  /* BORDER */ border: var(--small-outline) var(--humo25); border-radius: var(--radius-xs);

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

</style>