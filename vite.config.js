/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
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
    sourcemap: false,
    // 더 안정적인 빌드를 위한 옵션
    target: 'es2015', // 더 넓은 브라우저 호환성
    minify: 'esbuild', // 빠른 minification
    reportCompressedSize: false, // 빌드 속도 향상
    // 에러 발생 시에도 빌드 계속 진행
    emptyOutDir: true
  },
  server: {
    proxy: {
      // 한강홍수통제소 API 프록시 (새 API 엔드포인트)
      '/api/hanriver': {
        target: 'https://api.hrfco.go.kr',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/hanriver/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🌊 한강홍수통제소 API 요청:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ 한강홍수통제소 API 응답:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ 한강홍수통제소 API 프록시 에러:', err.message);
          });
        }
      },
      // 기상청 API 프록시
      '/api/kma': {
        target: 'http://apis.data.go.kr',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/kma/, '/1360000'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🌦️ 기상청 API 요청:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ 기상청 API 응답:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ 기상청 API 프록시 에러:', err.message);
          });
        }
      },
      // OpenWeatherMap API 프록시
      '/api/weather': {
        target: 'https://api.openweathermap.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/weather/, '/data/2.5'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('☁️ OpenWeather API 요청:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ OpenWeather API 응답:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ OpenWeather API 프록시 에러:', err.message);
          });
        }
      },
      // WAMIS (국가수자원관리종합정보시스템) 프록시 (크롤링용)
      '/api/wamis': {
        target: 'https://www.wamis.go.kr',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/wamis/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🌐 WAMIS 크롤링 요청:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ WAMIS 응답:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ WAMIS 프록시 에러:', err.message);
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