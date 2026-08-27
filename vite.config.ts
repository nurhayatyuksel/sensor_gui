import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Backend E:\SAGAY\Servo\SensorApp\sensor_gui\dist klasörünü serve ediyor.
    // Doğrudan oraya yaz — elle kopyalama derdi bitsin.
    outDir: '../../SensorApp/sensor_gui/dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true,
        changeOrigin: true,
      },
      '/settings': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})

