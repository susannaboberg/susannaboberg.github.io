import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const r = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        index: r('./index.html'),
        about: r('./about.html'),
        sideScribble: r('./side-scribble.html'),
        timeFreeze: r('./time-freeze.html'),
        studentServices: r('./student-services.html'),
      },
    },
  },
});
