import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream']
    })
  ],
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react-dom']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
});