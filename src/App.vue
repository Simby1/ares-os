<script setup lang="ts">
import { useAresStream } from './composables/useAresStream'
import { useMissionStore } from './stores/missionStore'

// Start the data truck
useAresStream()
const store = useMissionStore()
</script>

<template>
  <div class="min-h-screen bg-black text-white p-8 font-mono mission-control">
    <!-- Header Area -->
    <header class="border-b border-ares-orange/50 pb-4 mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-4xl font-bold text-ares-orange tracking-tighter">ARES-OS // MISSION CONTROL</h1>
        <p class="text-xs text-ares-orange/70 tracking-[0.2em]">STATION: MARS-BASE-ALPHA</p>
      </div>
      <div class="text-right">
        <div class="text-2xl">{{ new Date().toLocaleDateString() }}</div>
        <div :class="store.isPaused ? 'text-red-500' : 'text-green-500'" class="text-xs animate-pulse">
          ● SYSTEM {{ store.isPaused ? 'PAUSED' : 'LIVE' }}
        </div>
      </div>
    </header>
  </div>
</template>