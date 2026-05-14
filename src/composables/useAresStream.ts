import { onMounted, onUnmounted } from 'vue'
import { useMissionStore } from '../stores/missionStore'
import type { MedicalReading } from '@/types/mission'

export function useAresStream() {
  const store = useMissionStore()
  let intervalId: any

  const crewMembers = ['CMDR. STEVENS', 'DR. ARYA', 'ENG. CHEN']

  const generateCrewData = () => {
    // THE LOOP (Scalability)
    crewMembers.forEach((member) => {
      
      // PHYSIOLOGICAL LOGIC
      const hr = Math.floor(65 + Math.random() * 30) // 65-95 BPM
      const spo2 = +(95 + Math.random() * 5).toFixed(1) // 95-100%
      const roomO2 = +(20.8 + Math.random() * 0.4).toFixed(1) // Atmospheric O2

      // DATA PACKET
      const reading: MedicalReading = {
      timestamp: Date.now(),
      crewId: member,
      heartRate: hr,
      spo2: spo2,
      roomO2: roomO2,
      status: (hr > 110 || spo2 < 93) ? 'critical' : 'stable'
   }

      // SHIP TO STORE
      store.addNewData(reading)

      // INTELLIGENT LOGGING
      if (reading.status === 'critical') {
        store.pushLog(`ALERT: Abnormal vitals detected for ${member}`, 'alert')
      }
    })
  }

  onMounted(() => {
    // generate data for all crew every 2 seconds
    intervalId = setInterval(generateCrewData, 2000)
    store.pushLog("ARES-OS: Multi-crew biometric link active.", "nominal")
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })
}