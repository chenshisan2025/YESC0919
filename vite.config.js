import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3066,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['@web3modal/wagmi', '@wagmi/core', 'viem']
  }
})
