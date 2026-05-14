<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Activity, 
  AlertTriangle, 
  Thermometer, 
  Wind, 
  Users, 
  Terminal, 
  Play, 
  Pause, 
  Clock,
  Heart,
  Droplets,
  LayoutDashboard,
  MessageSquare
} from 'lucide-vue-next'
import { useAresStream } from './composables/useAresStream'
import { useMissionStore } from './stores/missionStore'
import TelemetryChart from './components/TelemetryChart.vue'

// 1. Initialize data stream and store
useAresStream()
const store = useMissionStore()

const crewNames = ['CMDR. STEVENS', 'DR. ARYA', 'ENG. CHEN']

// Mobile tabs state
const activeMobileTab = ref<'bio' | 'data' | 'logs'>('bio')

// 2. Latest stats for the Personnel cards
const latestStats = computed(() => {
  return crewNames.map(name => {
    const personReadings = store.readings.filter(r => r.crewId === name)
    const last = personReadings[personReadings.length - 1]
    return last || { 
      crewId: name, heartRate: 0, spo2: 0, roomO2: 20.9, psi: 14.7, status: 'stable'
    }
  })
})

// 3. Environmental stats for the Header
const env = computed(() => {
  const last = store.readings[store.readings.length - 1]
  return {
    o2: last?.roomO2 || '20.9',
    psi: last?.psi || '14.7'
  }
})

// 4. Logs
const displayLogs = computed(() => {
  return store.logs.slice(0, 15)
})

const togglePause = () => {
  store.isPaused = !store.isPaused
  store.pushLog(store.isPaused ? "COMMAND: Telemetry Stream Paused" : "COMMAND: Telemetry Stream Resumed", "warning")
}

const setTimeRange = (mins: number) => {
  store.timeRange = mins
}
</script>

<template>
  <div class="min-h-screen bg-black text-white p-4 font-mono mission-control flex flex-col overflow-hidden relative">
    
    <!-- SCANLINE & GRID EFFECT -->
    <div class="scanline pointer-events-none opacity-[0.03]"></div>
    <div class="absolute inset-0 pointer-events-none opacity-[0.02]" 
         style="background-image: 
           linear-gradient(rgba(0, 243, 255, 0.5) 1px, transparent 1px), 
           linear-gradient(90deg, rgba(0, 243, 255, 0.5) 1px, transparent 1px); 
         background-size: 50px 50px;">
    </div>
    <div class="absolute inset-0 pointer-events-none opacity-[0.05]" 
         style="background-image: radial-gradient(#ffffff 0.5px, transparent 0.5px); background-size: 20px 20px;">
    </div>

    <!-- HEADER -->
    <header class="border-b border-ares-orange/30 pb-3 mb-4 flex flex-col md:flex-row justify-between items-start md:items-end relative z-10 gap-4">
      <div class="flex gap-4 md:gap-8 items-end">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-1.5 h-1.5 rounded-full bg-ares-orange animate-ping"></div>
            <span class="text-[7px] text-ares-orange tracking-[0.5em] uppercase font-bold">Signal: OSCILLATING // T-STAMP: {{ new Date().getFullYear() }}.05.14</span>
          </div>
          <h1 class="text-3xl font-black text-ares-orange tracking-tighter uppercase italic flex items-center gap-3 text-glow-orange">
            Ares-OS
          </h1>
          <p class="text-[9px] text-ares-orange/40 tracking-[0.4em] mt-1 uppercase font-bold">Sector: Mars-Base-Alpha <span class="ml-4 opacity-50 underline decoration-ares-orange/20">RELAY_STATION_04</span></p>
        </div>
        
        <!-- GLOBAL ENVIRONMENT -->
        <div class="hidden lg:flex gap-10 border-l border-white/5 pl-10 items-center">
          <div class="flex items-center gap-3">
            <Wind class="w-4 h-4 text-ares-cyan opacity-50" />
            <div>
              <p class="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Atm_O2</p>
              <p class="text-xl font-black transition-all duration-700 tabular-nums" 
                 :class="parseFloat(env.o2 as string) < 18.5 ? 'text-ares-red animate-pulse' : 'text-ares-cyan'">
                {{ env.o2 }}%
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Thermometer class="w-4 h-4 text-white opacity-50" />
            <div>
              <p class="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Pressure</p>
              <p class="text-xl font-black transition-all duration-700 tabular-nums"
                 :class="parseFloat(env.psi as string) < 12.5 ? 'text-ares-red animate-pulse' : 'text-white text-shadow-glow'">
                {{ env.psi }} <span class="text-[9px] font-normal opacity-40 uppercase tracking-normal">psi</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- CONTROLS -->
      <div class="flex items-center gap-2 md:gap-4 bg-white/[0.03] p-2 rounded border border-white/10 backdrop-blur-sm w-full md:w-auto overflow-x-auto">
        <div class="flex gap-1 mr-2 md:mr-4 bg-black/40 p-0.5 rounded border border-white/5 shrink-0">
          <button 
            v-for="range in [1, 5, 15, 60]" :key="range"
            @click="setTimeRange(range)"
            class="px-2 py-1 text-[8px] uppercase font-black tracking-tighter rounded-sm transition-all"
            :class="store.timeRange === range ? 'bg-ares-cyan text-black' : 'text-white/30 hover:bg-white/5 hover:text-white/60'"
          >
            {{ range }}m
          </button>
        </div>

        <button @click="togglePause" 
                class="flex items-center gap-2 px-4 py-1.5 rounded transition-all uppercase text-[9px] font-black tracking-widest border shrink-0"
                :class="store.isPaused ? 'bg-ares-orange/20 text-ares-orange border-ares-orange/40 hover:bg-ares-orange/30' : 'bg-ares-cyan/10 text-ares-cyan border-ares-cyan/30 hover:bg-ares-cyan/20'">
          <component :is="store.isPaused ? Play : Pause" class="w-3 h-3" />
          {{ store.isPaused ? 'EXEC_RESUME' : 'SYS_HALT' }}
        </button>

        <div class="text-right border-l border-white/10 pl-4 ml-2 shrink-0">
          <p class="text-[7px] text-white/20 uppercase tracking-[0.3em] mb-1 font-bold">OS_BUFFER</p>
          <div class="flex items-center gap-2 justify-end">
             <div class="w-1 h-1 rounded-full animate-ping" :class="store.isPaused ? 'bg-ares-orange' : 'bg-ares-cyan'"></div>
             <p class="text-[10px] uppercase font-black tracking-widest" :class="store.isPaused ? 'text-ares-orange' : 'text-ares-cyan'">{{ store.isPaused ? 'HELD' : 'LIVE' }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- MOBILE NAVIGATION (MOVED TO TOP) -->
    <nav class="flex lg:hidden w-full gap-1 p-1 bg-white/[0.05] rounded border border-white/10 mb-4 shrink-0 z-20">
      <button @click="activeMobileTab = 'bio'" 
              class="flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all text-[10px] font-black uppercase tracking-widest"
              :class="activeMobileTab === 'bio' ? 'bg-ares-orange text-black' : 'text-white/40 hover:bg-white/10'">
        <Users class="w-3 h-3" />
        <span class="hidden xs:inline">Crew</span>
      </button>
      <button @click="activeMobileTab = 'data'" 
              class="flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all text-[10px] font-black uppercase tracking-widest"
              :class="activeMobileTab === 'data' ? 'bg-ares-cyan text-black' : 'text-white/40 hover:bg-white/10'">
        <LayoutDashboard class="w-3 h-3" />
        <span class="hidden xs:inline">Data</span>
      </button>
      <button @click="activeMobileTab = 'logs'" 
              class="flex-1 flex items-center justify-center gap-2 py-2 rounded transition-all text-[10px] font-black uppercase tracking-widest"
              :class="activeMobileTab === 'logs' ? 'bg-ares-orange text-black' : 'text-white/40 hover:bg-white/10'">
        <Terminal class="w-3 h-3" />
        <span class="hidden xs:inline">Log</span>
      </button>
    </nav>

    <!-- MAIN GRID (MOBILE TABS) -->
    <div class="grid grid-cols-12 gap-6 flex-grow overflow-hidden relative z-10">
      
      <!-- LEFT: PERSONNEL -->
      <aside :class="{ 'hidden lg:flex': activeMobileTab !== 'bio', 'flex': activeMobileTab === 'bio' }" 
             class="col-span-12 lg:col-span-3 flex-col gap-4 overflow-y-auto custom-scrollbar h-full">
        <div class="ares-card flex-grow h-fit group border-ares-orange/10">
          <div class="flex items-center justify-between mb-6 border-b border-ares-orange/20 pb-2">
            <div class="flex items-center gap-2">
              <Users class="w-3 h-3 text-ares-orange" />
              <h2 class="text-ares-orange text-[9px] uppercase tracking-[.4em] font-black italic">
                CREW // BIO_INTEGRITY
              </h2>
            </div>
            <span class="text-[7px] opacity-30 font-bold uppercase tracking-widest">Active_Nodes: 03</span>
          </div>
          
          <div class="space-y-6">
            <div v-for="person in latestStats" :key="person.crewId" 
                 class="relative p-4 bg-white/[0.02] border border-white/5 rounded-sm hover:bg-white/[0.05] transition-all group/card">
              
              <!-- GLITCH OVERLAY ON CRITICAL -->
              <div v-if="person.status === 'critical'" class="absolute inset-0 bg-ares-red/5 animate-pulse pointer-events-none z-0"></div>
              
              <div class="relative z-10">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span class="text-[9px] tracking-[0.2em] text-white/50 block mb-1 font-bold group-hover/card:text-ares-cyan transition-colors">{{ person.crewId }}</span>
                    <div class="flex items-center gap-2">
                      <div class="w-1.5 h-1.5 rounded-full" :class="person.status === 'critical' ? 'bg-ares-red animate-ping' : 'bg-ares-cyan'"></div>
                      <p class="text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded border"
                         :class="person.status === 'critical' ? 'bg-ares-red/10 text-ares-red border-ares-red/30' : 'bg-ares-cyan/10 text-ares-cyan border-ares-cyan/30'">
                        {{ person.status }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div :class="person.status === 'critical' ? 'text-ares-red text-glow-red scale-110' : 'text-ares-cyan text-glow-cyan'" class="text-2xl font-black italic tabular-nums transition-all tracking-tighter">
                      {{ person.heartRate }} <span class="text-[8px] font-thin not-italic opacity-40 uppercase tracking-normal ml-0.5">BPM</span>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-4">
                  <div class="bg-black/40 p-2 rounded border border-white/5 flex flex-col items-center justify-center">
                    <p class="text-[7px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1">
                       O2_SAT
                    </p>
                    <p class="text-xs font-black tabular-nums" :class="person.spo2 < 92 ? 'text-ares-red' : 'text-white'">{{ person.spo2 }}%</p>
                  </div>
                  <div class="bg-black/40 p-2 rounded border border-white/5 flex flex-col items-center justify-center">
                     <p class="text-[7px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1">
                      LOAD
                    </p>
                    <p class="text-xs font-black tabular-nums" :class="person.status === 'critical' ? 'text-ares-red' : 'text-ares-cyan'">
                      {{ person.status === 'critical' ? 'MAX' : (person.status === 'stressed' ? 'HIGH' : 'NOM') }}
                    </p>
                  </div>
                </div>

                <!-- Visual Bar -->
                <div class="w-full bg-white/5 h-[2px] rounded-full overflow-hidden mt-1">
                  <div class="h-full transition-all duration-1000 ease-in-out" 
                       :class="person.status === 'critical' ? 'bg-ares-red shadow-[0_0_8px_#ff3131]' : 'bg-ares-cyan'"
                       :style="{ width: `${Math.min((person.heartRate / 180) * 100, 100)}%` }">
                  </div>
                </div>
              </div>

              <!-- Corner accent -->
              <div class="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>
            </div>
          </div>
        </div>
      </aside>

      <!-- CENTER: DATA VISUALIZATION -->
      <section :class="{ 'hidden lg:flex': activeMobileTab !== 'data', 'flex': activeMobileTab === 'data' }"
               class="col-span-12 lg:col-span-6 flex-col gap-4 overflow-hidden">
        
        <!-- HEART RATE OVERVIEW -->
        <div class="ares-card h-[45%] flex flex-col relative overflow-hidden bg-ares-cyan/[0.03] border-ares-cyan/30">
          <div class="flex justify-between items-center mb-4 border-b border-ares-cyan/10 pb-2">
            <h2 class="text-ares-cyan text-[10px] uppercase tracking-[0.4em] font-black italic flex items-center gap-2">
              <Activity class="w-3 h-3" /> Biometric_Stream // Heart_Rate
            </h2>
            <div class="flex gap-4">
               <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-ares-cyan"></div> <span class="text-[8px] opacity-60">STEVENS</span></div>
               <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-ares-orange"></div> <span class="text-[8px] opacity-60">CHARYA</span></div>
               <div class="flex items-center gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-[#00ff41]"></div> <span class="text-[8px] opacity-60">CHEN</span></div>
            </div>
          </div>
          <div class="flex-grow">
            <TelemetryChart type="line" metric="heartRate" title="HR Stream" color="#00f3ff" />
          </div>
          <!-- Corner Decors -->
          <div class="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-ares-cyan/20 m-1"></div>
        </div>

        <!-- LOWER GRIDS -->
        <div class="grid grid-cols-2 gap-4 flex-grow overflow-hidden">
          <div class="ares-card flex flex-col bg-white/[0.02]">
            <h2 class="text-white text-[9px] uppercase tracking-widest font-bold mb-3 border-b border-white/5 pb-1 opacity-60">
              Atmospheric_Pressure // PSI
            </h2>
            <div class="flex-grow">
              <TelemetryChart type="area" metric="psi" title="Habitat PSI" color="#ffffff" />
            </div>
          </div>
          <div class="ares-card flex flex-col bg-white/[0.02]">
            <h2 class="text-ares-red text-[9px] uppercase tracking-widest font-bold mb-3 border-b border-ares-red/10 pb-1 opacity-80">
              Oxygen_Sat // SpO2 %
            </h2>
            <div class="flex-grow">
               <TelemetryChart type="line" metric="spo2" title="O2 Sat" color="#ff3131" />
            </div>
          </div>
        </div>

      </section>

      <!-- RIGHT: EVENT TERMINAL -->
      <aside :class="{ 'hidden lg:flex': activeMobileTab !== 'logs', 'flex': activeMobileTab === 'logs' }"
             class="col-span-12 lg:col-span-3 flex-col gap-4 overflow-hidden h-full">
        <div class="ares-card flex-grow overflow-hidden flex flex-col bg-ares-orange/[0.02] border-ares-orange/20 shadow-[inset_0_0_50px_rgba(255,95,31,0.05)]">
          <div class="flex items-center gap-2 mb-4 border-b border-ares-orange/20 pb-2">
            <Terminal class="w-3 h-3 text-ares-orange" />
            <h2 class="text-ares-orange text-[10px] uppercase tracking-[.3em] font-black">
              Terminal // OS_System_Log
            </h2>
          </div>
          <div class="flex-grow overflow-y-auto pr-3 space-y-3 custom-scrollbar font-mono text-[9px]">
            <transition-group name="list">
              <div v-for="log in displayLogs" :key="log.id" 
                   class="log-entry group py-2 px-3 border-l-[1px] rounded-r bg-white/[0.02] transition-all duration-500 hover:bg-white/[0.05]"
                   :class="log.status === 'alert' ? 'border-ares-red bg-ares-red/5' : 'border-white/10'">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-[7px] text-white/30 font-bold tracking-[0.2em]">T+ {{ log.time }}</span>
                  <span class="text-[6px] opacity-30 group-hover:opacity-100 transition-opacity">SYS_ADMIN</span>
                </div>
                <p :class="{ 'text-ares-red font-bold animate-pulse': log.status === 'alert', 
                             'text-ares-orange/90': log.status === 'warning',
                             'text-white/70': log.status === 'nominal' }" 
                   class="uppercase tracking-tighter leading-tight relative">
                  <span v-if="log.status === 'alert'" class="inline-block mr-1">⚠️</span>
                  {{ log.message }}
                </p>
              </div>
            </transition-group>
          </div>
          
          <!-- TERMINAL INPUT MOCK -->
          <div class="mt-4 pt-3 border-t border-ares-orange/10 flex items-center gap-2">
            <span class="text-ares-orange animate-pulse font-bold">></span>
            <div class="text-[8px] text-white/20 uppercase tracking-widest">Awaiting Command...</div>
          </div>
        </div>
      </aside>

    </div>

    <!-- FOOTER STATUS -->
    <footer class="mt-4 pt-2 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[7px] text-white/30 uppercase tracking-[0.4em] font-black relative z-10 gap-4">
      <div class="flex gap-4 md:gap-8 items-center w-full md:w-auto justify-between md:justify-start">
        <div class="flex gap-2 items-center">
          <div class="w-1 h-1 bg-ares-cyan"></div>
          <span>NET_LNK: SECURE // 10.0.1.MARS</span>
        </div>
        <div class="flex gap-2 items-center">
          <div class="w-1 h-1 bg-ares-orange"></div>
          <span class="text-ares-cyan">LATENCY: {{ store.isPaused ? '---' : '720ms' }} (EARTH_RELAY)</span>
        </div>
        <div class="hidden md:flex gap-2 items-center">
          <div class="w-1 h-1 bg-white/20"></div>
          <span>TEMP: -63°C</span>
        </div>
      </div>
      <div class="flex gap-4 items-center">
        <span class="animate-pulse">● PROCESSOR_ACTIVE</span>
        <span class="opacity-50">ARES_V_5A</span>
      </div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,700;0,800;1,300;1,400;1,700;1,800&display=swap');

:root {
  --ares-orange: #ff5f1f;
  --ares-cyan: #00f3ff;
  --ares-red: #ff3131;
}

body {
  font-family: 'JetBrains Mono', monospace;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: black;
}

.text-ares-orange { color: var(--ares-orange); }
.text-ares-cyan { color: var(--ares-cyan); }
.text-ares-red { color: var(--ares-red); }
.bg-ares-orange { background-color: var(--ares-orange); }
.bg-ares-cyan { background-color: var(--ares-cyan); }
.bg-ares-red { background-color: var(--ares-red); }
.border-ares-orange { border-color: var(--ares-orange); }
.border-ares-cyan { border-color: var(--ares-cyan); }
.border-ares-red { border-color: var(--ares-red); }

.ares-card {
  position: relative;
}

.scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: white;
  z-index: 100;
  animation: scanline 8s linear infinite;
}

@keyframes scanline {
  0% { top: 0; }
  100% { top: 100%; }
}

.mission-control::after {
  content: "";
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%);
  pointer-events: none;
  z-index: 50;
}

/* Animations for logs */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px) translateX(-5px);
  filter: blur(4px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
