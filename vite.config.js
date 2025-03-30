import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import electron from 'vite-plugin-electron/simple'

export default defineConfig({
    plugins: [
        vue(),
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