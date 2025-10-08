import { defineConfig } from 'vite';

export default defineConfig({
  base: '/vib34d-modular-rebuild/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 8765,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src',
      '@core': '/src/core',
      '@systems': '/src/systems',
      '@choreography': '/src/choreography',
      '@ai': '/src/ai',
      '@ui': '/src/ui',
      '@utils': '/src/utils'
    }
  }
});
