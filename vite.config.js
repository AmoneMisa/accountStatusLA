import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import electron from 'vite-plugin-electron/simple'
import svgLoader from "vite-svg-loader";

export default defineConfig({
    plugins: [
        vue(),
        svgLoader(),
        electron({
            main: {
                entry: 'electron/main.js',
                onstart: function ({startup, reload}) {
                    startup(['.']);
                }
            },
            preload: {
                input: 'electron/preload.cjs'
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'renderer'),
        },
    }
});