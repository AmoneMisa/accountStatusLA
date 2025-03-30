import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import electron from 'vite-plugin-electron'

export default defineConfig({
    root: path.resolve(__dirname, 'renderer'),
    base: "./",
    plugins: [
        vue(),
        // electron({
        //     entry: 'main.js'
        // })
    ],
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'renderer'),
        },
    }
});