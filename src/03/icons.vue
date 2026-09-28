<script setup>

defineProps({ type: { type: String, default: 'portal' } })

</script>

<template>

  <svg class="mark-svg" viewBox="0 0 12 12" aria-hidden="true" focusable="false">

    <g v-if="type === 'diseño'" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
      <path d="M6 1.4a3.1 3.1 0 0 1 1.9 5.6c-0.4 0.3-0.6 0.7-0.6 1.1H4.7c0-0.4-0.2-0.8-0.6-1.1A3.1 3.1 0 0 1 6 1.4z" />
      <path d="M4.9 9.4h2.2M5.3 10.7h1.4" />
    </g>

    <g v-else-if="type === 'desarrollo'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="butt">
      <path d="M6 1.6v1.5M6 8.9v1.5M1.6 6h1.5M8.9 6h1.5M2.9 2.9l1.05 1.05M8.05 8.05l1.05 1.05M9.1 2.9L8.05 3.95M3.95 8.05L2.9 9.1" />
      <circle cx="6" cy="6" r="2.2" stroke-width="1" />
    </g>

    <g v-else-if="type === 'musica'" fill="currentColor" stroke="none">
      <rect x="6.6" y="1.2" width="1" height="7.2" />
      <path d="M7.6 1.2c1.6 0.3 2.8 0.9 2.8 2.1c-1-0.9-1.8-1-2.8-1.1z" />
      <ellipse cx="5" cy="8.7" rx="2.3" ry="1.8" transform="rotate(-18 5 8.7)" />
    </g>

    <g v-else-if="type === 'textos'" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round">
      <path d="M2 10l1-2.6 5-5 1.6 1.6-5 5z" />
      <path d="M7.4 1.8l1.6 1.6" />
    </g>

    <g v-else-if="type === 'juegos'" stroke="currentColor" stroke-width="1" stroke-linecap="round" fill="none">
      <path d="M6 8.2V4.6" />
      <circle cx="6" cy="3" r="1.7" fill="currentColor" stroke="none" />
      <path d="M2.6 10.4c0-1.2 1.5-2.1 3.4-2.1s3.4 0.9 3.4 2.1z" fill="currentColor" stroke="none" />
    </g>

    <g v-else fill="none" stroke="currentColor" stroke-width="1">
      <circle cx="3.4" cy="6" r="2.2" />
      <circle cx="8.6" cy="6" r="2.2" />
    </g>

  </svg>

</template>

<style scoped>

.mark-svg {

  /* LAYOUT */ display: block; flex: none;
  /* BOX    */ width: .88em; height: .88em;
  /* OPTIC  */ transform: translateY(.045em);
  /* FILL   */ color: inherit;

}

</style>
