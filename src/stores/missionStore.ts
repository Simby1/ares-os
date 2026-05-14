import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import type { MedicalReading, MissionLog } from '../types/mission'

export const useMissionStore = defineStore('mission', () => {
  const readings = shallowRef<MedicalReading[]>([])
  const logs = ref<MissionLog[]>([])
  const isPaused = ref(false)
  const timeRange = ref(5) // minutes
  
  // handle time filtering
  const filteredReadings = computed(() => {
    const cutoff = Date.now() - (timeRange.value * 60 * 1000) 
    return readings.value.filter(r => r.timestamp > cutoff)
  })

  const addNewData = (data: MedicalReading) => {
    if (isPaused.value) return 

    const isSafe = 
      data.heartRate >= 30 && data.heartRate <= 250 && 
      data.spo2 >= 0 && data.spo2 <= 100 &&           
      data.roomO2 >= 0 && data.roomO2 <= 100;         

    if (!isSafe) {
      pushLog("ERROR: Malformed or out-of-range telemetry detected.", "alert")
      return
    }

    // Performance Update: Keep a window of data for charts
    // 500 readings is enough for 2 seconds * 3 people * 5-10 mins
    readings.value = [...readings.value, data].slice(-1000)
  }

  const pushLog = (message: string, status: MissionLog['status']) => {
    const newLog: MissionLog = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleTimeString(),
      message,
      status
    }

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
