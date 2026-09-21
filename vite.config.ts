import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * Názov GitHub repozitára — appka na GitHub Pages beží v podadresári
 * https://<user>.github.io/<REPO_NAME>/, takže build potrebuje túto `base` cestu.
 * Ak by si projekt niekedy presunul na vlastnú doménu (root), zmeň na '/'.
 */
const REPO_NAME = 'euka-timeline'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Dev server beží na roote, produkčný build (a `vite preview`) v podadresári
  // GitHub Pages. Rozlišujeme podľa `mode`, nie podľa `command` — `vite preview`
  // je tiež 'serve', ale musí servírovať rovnakú cestu ako ostrý build,
  // inak sa nasadenie nedá lokálne overiť.
  base: mode === 'production' ? `/${REPO_NAME}/` : '/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
