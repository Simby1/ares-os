<script setup lang="ts">
import { useAresStream } from './composables/useAresStream'
// turn on the whole "Truck" system.. aresStream
useAresStream()
</script>

<template>
  <div class="mission-control">
    <h1>ARES-OS IS ONLINE</h1>
    <!-- UI here next -->
  </div>
</template>