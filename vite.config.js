// vite.config.js for DRC Hotel and DRC Police
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Export named configs for hotel and police
export const hotelConfig = defineConfig({
  plugins: [react()],
  base: '/hotel/', // This sets the base path for the app
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          api: ['axios', '@tanstack/react-query']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 5173,
    host: true
  }
})

export const policeConfig = defineConfig({
  plugins: [react()],
  base: '/police/', // This sets the base path for the app
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          api: ['axios', '@tanstack/react-query']
        }
      }
    }
  },
  server: {
    port: 5174,
    host: true
  },
  preview: {
    port: 5174,
    host: true
  }
})

// To use a specific config, import { hotelConfig } or { policeConfig } in your build scripts.