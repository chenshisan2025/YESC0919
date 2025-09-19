import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 设置文件
    setupFiles: ['./tests/setup.js'],
    
    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'backend',
      '.git',
      '.cache'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        'backend/',
        '**/*.config.js',
        '**/*.config.ts',
        'src/main.jsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 并发设置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },
    
    // 监听模式配置
    watch: {
      ignore: [
        'node_modules/**',
        'dist/**',
        'backend/**',
        'coverage/**'
      ]
    },
    
    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-reports/results.json',
      html: './test-reports/index.html'
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './tests')
    }
  },
  
  // 定义全局变量
  define: {
    __TEST__: true
  }
})