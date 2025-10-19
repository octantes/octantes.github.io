<script setup> 

</script>

<template> 

  <div class="sidecontent">
    
  </div>

</template>

<style scoped> 

.sidecontent { 

  /* LAYOUT */ display: flex; flex-direction: column;
  /* BOX    */ padding: 1rem;
  /* FILL   */ background-color: var(--carbon); color: var(--niebla);
  /* BORDER */ border: var(--small-outline) var(--humo25); border-radius: var(--radius-xs);

  &:disabled { cursor: not-allowed; opacity: var(--alpha-disabled); }

}

</style>