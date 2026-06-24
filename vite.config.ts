import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' + relative assets so the game runs from any sub-path (platform portability standard).
export default defineConfig({
  base: './',
  plugins: [react()],
});
