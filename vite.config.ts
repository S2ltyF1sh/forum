import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // 代理所有以/api开头的请求
      '/api': {
        target: 'http://115.190.112.102:8080', // 目标服务器地址
        changeOrigin: true
      },
      // 如果需要代理多个路径，可以继续添加配置
      // '/other': {
      //   target: 'http://115.190.112.102:8080',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/other/, '/api/other')
      // }
    }
  }
})
