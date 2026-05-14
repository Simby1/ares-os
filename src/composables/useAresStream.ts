import { onMounted, onUnmounted } from 'vue'
import { useMissionStore } from '../stores/missionStore'
import type { MedicalReading } from '@/types/mission'

export function useAresStream() {
  const store = useMissionStore()
  let intervalId: any
  const crewMembers = ['CMDR. STEVENS', 'DR. ARYA', 'ENG. CHEN']

  const generateCrewData = () => {
    if (store.isPaused) return

    const isCrisis = Math.random() < 0.05
    
    // Shared environment
    const baseO2 = 20.9
    const basePSI = 14.7
    
    const sharedRoomO2 = isCrisis ? (17.0 + Math.random() * 2) : (20.5 + Math.random() * 0.8)
    const sharedPSI = isCrisis ? (11.0 + Math.random() * 2) : (14.2 + Math.random() * 1.0)

    const lastLog = store.logs[0]
    if (isCrisis && sharedPSI < 12.5 && (!lastLog || !lastLog.message.includes("pressure drop"))) {
      store.pushLog("CRITICAL: Habitat pressure drop!", "alert")
    }

    crewMembers.forEach((member) => {
      // Different profiles for different members
      let baseHR = 70
      if (member === 'ENG. CHEN') baseHR = 85 // Higher physical activity
      if (member === 'DR. ARYA') baseHR = 65 // Calm
      
      const hrVariance = isCrisis ? (60 + Math.random() * 20) : (Math.random() * 10)
      const hr = Math.floor(baseHR + hrVariance)
      
      const spo2 = isCrisis ? (88 + Math.random() * 5) : (97 + Math.random() * 3)

      const reading: MedicalReading = {
        timestamp: Date.now(),
        crewId: member,
        heartRate: hr,
        spo2: parseFloat(spo2.toFixed(1)),
        roomO2: parseFloat(sharedRoomO2.toFixed(1)),
        psi: parseFloat(sharedPSI.toFixed(1)), 
        status: (hr > 120 || spo2 < 90) ? 'critical' : (hr > 100 ? 'stressed' : 'stable')
      }

      const memberReadings = store.readings.filter(r => r.crewId === member)
      const previousStatus = memberReadings[memberReadings.length - 1]?.status

      store.addNewData(reading)

      if (reading.status === 'critical' && previousStatus !== 'critical') {
        store.pushLog(`ALERT: ${member} vital distress`, 'alert')
      }
    })
  }

  onMounted(() => {
    intervalId = setInterval(generateCrewData, 500)
    store.pushLog("ARES-OS: Link Active. Mars-Base-Alpha telemetry online.", "nominal")
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })
}
