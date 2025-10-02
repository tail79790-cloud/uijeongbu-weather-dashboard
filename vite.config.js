/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리를 별도 청크로 분리
          'react-vendor': ['react', 'react-dom'],
          // TanStack Query를 별도 청크로 분리
          'query-vendor': ['@tanstack/react-query'],
          // Recharts를 별도 청크로 분리 (큰 라이브러리)
          'charts-vendor': ['recharts'],
          // date-fns를 별도 청크로 분리
          'date-vendor': ['date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 600,
    // CSS 코드 스플리팅
    cssCodeSplit: true,
    // 소스맵 비활성화로 빌드 크기 감소
    sourcemap: false
  },
  server: {
    proxy: {
      // 한강홍수통제소 API 프록시
      '/api/hanriver': {
        target: 'http://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hanriver/, '/B500001/rwis/waterLevel/list'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('한강홍수통제소 API 요청:', req.url);
          });
        }
      },
      // 기상청 API 프록시
      '/api/kma': {
        target: 'http://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kma/, '/1360000'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('기상청 API 요청:', req.url);
          });
        }
      },
      // OpenWeatherMap API 프록시
      '/api/weather': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, '/data/2.5'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('날씨 API 요청:', req.url);
          });
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
      ]
    }
  }
})