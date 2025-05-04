import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import rollupNodePolyFill from 'rollup-plugin-polyfill-node';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Adds polyfills for Node.js core modules
    rollupNodePolyFill()
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify', // or 'rollup-plugin-node-polyfills/polyfills/crypto-browserify'
      stream: 'stream-browserify',
      buffer: 'buffer/',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['crypto-browserify', 'stream-browserify', 'buffer'],
  },
});
