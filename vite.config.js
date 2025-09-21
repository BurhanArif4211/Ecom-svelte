import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy: {
      '/wp/wp-json/': {
        target: 'https://autogearlift.com',
        changeOrigin: true,
        secure: false, // If you're using https, set this to true
      },
    }
  },
  plugins: [
    svelte(),
    tailwindcss()
  ],
  build:{
    outDir:"dist",
    assetsDir:"assets",
    rollupOptions:{
      output: {
        // Customize filenames to remove hashes
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    }
  }
})
