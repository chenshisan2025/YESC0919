// NEW - Wagmi配置文件
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { bsc, bscTestnet } from 'wagmi/chains'
import { cookieStorage, createStorage } from 'wagmi'
import { http } from 'viem'

// 获取项目ID（需要从WalletConnect Cloud获取）
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f5a6c8b9d3e1a4f7c2b8e5d9a1c4f6b'

// 自定义链配置，添加更好的RPC端点
const customBsc = {
  ...bsc,
  rpcUrls: {
    default: {
      http: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://bsc-dataseed3.binance.org'
      ]
    },
    public: {
      http: [
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org'
      ]
    }
  }
}

const customBscTestnet = {
  ...bscTestnet,
  rpcUrls: {
    default: {
      http: [
        'https://data-seed-prebsc-1-s1.binance.org:8545',
        'https://data-seed-prebsc-2-s1.binance.org:8545'
      ]
    },
    public: {
      http: [
        'https://data-seed-prebsc-1-s1.binance.org:8545'
      ]
    }
  }
}

// 定义支持的链
const chains = [customBsc, customBscTestnet] as const

// 应用元数据
const metadata = {
  name: 'YesCoin',
  description: 'YesCoin Web3 Application - 预见健康，奖励未来',
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`]
}

// 创建wagmi配置
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [customBsc.id]: http(),
    [customBscTestnet.id]: http()
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
  enableEmail: false
})

// 导出链信息
export { chains }
export { projectId }

// 默认导出配置
export default config