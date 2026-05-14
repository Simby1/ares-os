<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useMissionStore } from '../stores/missionStore'

const props = defineProps<{
  type: 'line' | 'area' | 'bar',
  metric: 'heartRate' | 'spo2' | 'psi' | 'roomO2',
  title: string,
  color: string
}>()

const store = useMissionStore()

const chartSeries = computed(() => {
  const crewNames = ['CMDR. STEVENS', 'DR. ARYA', 'ENG. CHEN']
  
  if (props.metric === 'psi' || props.metric === 'roomO2') {
    // Shared environmental data - only need one series
    const data = store.filteredReadings
      .filter((r, idx) => idx % 3 === 0) // Environmental data same for everyone, just take one per interval
      .map(r => ({
        x: r.timestamp,
        y: r[props.metric]
      }))
    
    return [{
      name: props.title,
      data: data
    }]
  }

  // Individual biometric data
  return crewNames.map(name => {
    const data = store.filteredReadings
      .filter(r => r.crewId === name)
      .map(r => ({
        x: r.timestamp,
        y: r[props.metric as 'heartRate' | 'spo2']
      }))
    
    return {
      name: name,
      data: data
    }
  })
})

const chartOptions = computed(() => ({
  chart: {
    id: `chart-${props.metric}`,
    background: 'transparent',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'linear',
      dynamicAnimation: {
        enabled: true,
        speed: 500
      }
    },
    foreColor: '#555',
    sparkline: { enabled: false }
  },
  colors: [props.color, '#ff5f1f', '#00ff41'],
  stroke: {
    curve: 'smooth',
    width: 2,
    dashArray: [0, 0, 0]
  },
  fill: {
    type: props.type === 'area' ? 'gradient' : 'solid',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.0,
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    type: 'datetime',
    range: store.timeRange * 60 * 1000,
    labels: {
      show: true,
      style: { colors: '#333', fontSize: '8px' },
      datetimeUTC: false
    },
    axisBorder: { show: true, color: 'rgba(255,255,255,0.05)' },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#444', fontSize: '9px' },
      formatter: (val: number) => val.toFixed(0)
    },
    tickAmount: 4,
    border: { show: true, color: 'rgba(255,255,255,0.05)' }
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    strokeDashArray: 2,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } }
  },
  markers: {
    size: 0,
    hover: { size: 4 }
  },
  tooltip: {
    theme: 'dark',
    x: { format: 'HH:mm:ss' },
    style: { fontSize: '10px' }
  },
  legend: {
    show: props.metric !== 'psi' && props.metric !== 'roomO2',
    position: 'top',
    horizontalAlign: 'right',
    fontSize: '9px',
    labels: { colors: '#666' },
    markers: { radius: 12 }
  },
  dataLabels: { enabled: false }
}))
</script>

<template>
  <div class="h-full w-full">
    <VueApexCharts
      width="100%"
      height="100%"
      :type="type"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>
