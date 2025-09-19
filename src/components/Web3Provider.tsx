// NEW - Web3Modal提供者组件
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config, projectId } from '../config/wagmi'
import { ReactNode, Component, ErrorInfo } from 'react'

// 创建查询客户端，添加错误处理
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5分钟
    },
    mutations: {
      retry: 1,
    },
  },
})

// 错误边界组件
class Web3ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Web3 Provider Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Web3连接错误
            </h2>
            <p className="text-red-600 mb-4">
              钱包连接出现问题，请刷新页面重试
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 创建Web3Modal实例
try {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false, // 禁用分析避免跨域问题
    enableOnramp: false, // 禁用入金功能避免额外请求
    themeMode: 'light',
    themeVariables: {
      '--w3m-color-mix': '#FFD700',
      '--w3m-color-mix-strength': 20,
      '--w3m-font-family': '"Press Start 2P", monospace',
      '--w3m-border-radius-master': '4px',
      '--w3m-z-index': '1000'
    },
    featuredWalletIds: [
      // MetaMask
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
      // WalletConnect
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'
    ]
  })
} catch (error) {
  console.error('Failed to create Web3Modal:', error)
}

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <Web3ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </Web3ErrorBoundary>
  )
}