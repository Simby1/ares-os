import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import type { MedicalReading, MissionLog } from '../types/mission'

export const useMissionStore = defineStore('mission', () => {
  const readings = shallowRef<MedicalReading[]>([])
  const logs = ref<MissionLog[]>([])
  const isPaused = ref(false)
  const timeRange = ref(5)
  
  // handle time filtering
  const filteredReadings = computed(() => {
    const cutoff = Date.now() - (timeRange.value * 60 * 1000) 
    return readings.value.filter(r => r.timestamp > cutoff)
  })

  // --- ACTIONS (The Procedures) ---
  const addNewData = (data: MedicalReading) => {
    // 1. If paused, freeze state. No new data enters.
    if (isPaused.value) return 

    // 2. Comprehensive Medical Validation
    const isSafe = 
      data.heartRate >= 30 && data.heartRate <= 250 && // Human heart limits
      data.spo2 >= 0 && data.spo2 <= 100 &&           // Percentage limits
      data.roomO2 >= 0 && data.roomO2 <= 100;         // Atmospheric limits

    if (!isSafe) {
      pushLog("ERROR: Malformed or out-of-range telemetry detected.", "alert")
      return
    }

    // 3. Performance Update: Create new array and keep last 100 readings.. prevent memory leak
    readings.value = [...readings.value, data].slice(-100)
  }

  const pushLog = (message: string, status: MissionLog['status']) => {
    const newLog: MissionLog = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString(),
      message,
      status
    }

    // Newest first logic, then keep only the last 50
    logs.value = [newLog, ...logs.value].slice(0, 50)
  }

  return { 
    readings, 
    filteredReadings, 
    logs, 
    isPaused, 
    timeRange, 
    addNewData, 
    pushLog 
  }
})