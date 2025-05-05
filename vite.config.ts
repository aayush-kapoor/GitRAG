import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    rollupOptions: {
      // Ensure these dependencies are properly bundled
      external: ['react/jsx-runtime'],
    }
  }
});
