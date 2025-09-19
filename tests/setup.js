import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

// 全局测试设置文件
afterEach(() => {
  cleanup()
})

// 模拟Web3对象
global.window = global.window || {}
global.window.ethereum = {
  request: async ({ method, params }) => {
    switch (method) {
      case 'eth_requestAccounts':
        return ['0x1234567890123456789012345678901234567890']
      case 'eth_chainId':
        return '0x61' // BSC Testnet
      case 'wallet_switchEthereumChain':
        return null
      case 'wallet_addEthereumChain':
        return null
      case 'eth_getBalance':
        return '0x1bc16d674ec80000' // 2 ETH
      case 'eth_sendTransaction':
        return '0x1234567890123456789012345678901234567890123456789012345678901234'
      case 'eth_call':
        return '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000' // 1000 tokens
      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  },
  on: (event, handler) => {
    // 模拟事件监听
  },
  removeListener: (event, handler) => {
    // 模拟事件移除
  }
}

// 模拟localStorage
const localStorageMock = {
  getItem: (key) => {
    return localStorageMock[key] || null
  },
  setItem: (key, value) => {
    localStorageMock[key] = value
  },
  removeItem: (key) => {
    delete localStorageMock[key]
  },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key]
      }
    })
  }
}
global.localStorage = localStorageMock

// 模拟sessionStorage
global.sessionStorage = { ...localStorageMock }

// 模拟fetch API
global.fetch = async (url, options) => {
  // 根据URL返回模拟数据
  if (url.includes('/api/health')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok', timestamp: Date.now() })
    }
  }
  
  if (url.includes('/api/tasks')) {
    return {
      ok: true,
      status: 200,
      json: async () => ([
        {
          id: 1,
          title: '关注Twitter',
          description: '关注YesCoin官方Twitter账号',
          reward: 100,
          completed: false,
          type: 'social'
        },
        {
          id: 2,
          title: '加入Telegram',
          description: '加入YesCoin官方Telegram群组',
          reward: 150,
          completed: false,
          type: 'social'
        }
      ])
    }
  }
  
  if (url.includes('/api/contracts/info')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        yescoinContract: '0x1234567890123456789012345678901234567890',
        guardianNftContract: '0x0987654321098765432109876543210987654321',
        airdropContract: '0x1111222233334444555566667777888899990000',
        totalSupply: '1000000000',
        nftTotalSupply: '10000',
        nftMinted: '1234'
      })
    }
  }
  
  // 默认返回空响应
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' })
  }
}

// 模拟IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟matchMedia
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {}
})

// 模拟URL.createObjectURL
global.URL.createObjectURL = () => 'mocked-url'
global.URL.revokeObjectURL = () => {}

// 扩展 expect 匹配器
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received && received.ownerDocument && received.ownerDocument.contains(received)
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    }
  },
})

// Mock Web3 Context
const mockWeb3Context = {
  account: null,
  address: null,
  formattedAddress: null,
  chainId: 97, // BSC Testnet
  isConnected: false,
  isConnecting: false,
  error: null,
  provider: global.window.ethereum,
  connectMetaMask: vi.fn(),
  connectWalletConnect: vi.fn(),
  disconnect: vi.fn(),
  switchNetwork: vi.fn(),
}

// Mock Web3Provider
const MockWeb3Provider = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'mock-web3-provider' }, children)
}

// Mock useWeb3 hook
vi.mock('../src/contexts/Web3Context', () => ({
  useWeb3: () => mockWeb3Context,
  Web3Provider: MockWeb3Provider,
}))

// Test wrapper component
export const TestWrapper = ({ children }) => {
  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(MockWeb3Provider, null, children)
  )
}

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
  useSwitchChain: vi.fn(),
  useChainId: vi.fn(),
  WagmiProvider: ({ children }) => children,
  createStorage: vi.fn(() => ({
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  })),
  cookieStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}))

// 导出测试工具函数
export const createMockWeb3 = () => mockWeb3Context

export const createMockContract = () => ({
  mint: vi.fn().mockResolvedValue({ hash: '0xmockhash' }),
  balanceOf: vi.fn().mockResolvedValue(BigInt(1000)),
  totalSupply: vi.fn().mockResolvedValue(BigInt(5000)),
  transfer: vi.fn().mockResolvedValue({ hash: '0xmockhash' }),
})