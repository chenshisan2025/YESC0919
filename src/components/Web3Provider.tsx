// NEW - Web3提供者组件
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import { config } from '../config/wagmi'
import { ReactNode, Component, ErrorInfo } from 'react'
import { useTranslation } from 'react-i18next'

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

// Web3 错误边界内容组件
const Web3ErrorBoundaryContent = ({ error }: { error?: Error }) => {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {t('common.web3ConnectionError')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('common.walletConnectionProblem')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {t('common.refreshPage')}
        </button>
      </div>
    </div>
  )
}

// Web3 错误边界组件
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
    console.error('Web3 Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <Web3ErrorBoundaryContent error={this.state.error} />
    }

    return this.props.children
  }
}

// Web3Modal已移除，使用原生wagmi连接器

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <Web3ErrorBoundary>
      <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiConfig>
    </Web3ErrorBoundary>
  )
}