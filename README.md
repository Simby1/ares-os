# Ares-OS

A high-performance real-time telemetry visualization platform for Mars exploration missions.

## Architecture

- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia (Modular stores)
- **Data Streaming**: Simulated WebSocket stream via Vue Composables
- **Visualization**: ApexCharts for low-latency real-time updates
- **Styling**: Tailwind CSS with custom thematic variables

## Key Features

- **Real-Time Streaming**: Simulated high-frequency telemetry data with individual crew profiles.
- **Biometric Monitoring**: Live heart rate and SpO2 tracking for three crew members.
- **Environmental Analytics**: Habitat pressure and atmospheric oxygen levels monitored in real-time.
- **Interactive Terminal**: Live event logs with severity levels (Nominal, Warning, Alert).
- **Control Center**: Pause/Resume telemetry and adjust data window range (1m to 60m).
- **Responsive Design**: Mission-critical UI that adapts from widescreen monitors to tablets.

## Performance Optimizations

1. **Memory Management**: Data buffers are capped at 1000 records to prevent memory leaks during long-running sessions.
2. **Reactivity Optimization**: Uses `shallowRef` for large telemetry arrays to reduce reconciliation overhead.
3. **Throttled Updates**: Telemetry generation and chart reconciliation are decoupled to maintain 60fps UI performance.
4. **Clean-up**: Lifecycles are managed via `onUnmounted` to ensure all intervals and subscriptions are destroyed.

## Setup Instructions

1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. `npm run build` - Create production bundle
