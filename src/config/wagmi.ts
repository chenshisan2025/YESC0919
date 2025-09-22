// NEW - Wagmi配置文件
import { configureChains, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

// 获取项目ID（需要从WalletConnect Cloud获取）
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f5a6c8b9d3e1a4f7c2b8e5d9a1c4f6b'

// 定义支持的链
const chains = [bsc, bscTestnet]

// 配置链和提供者
const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  [publicProvider()]
)

// 创建连接器
const connectors = [
  new InjectedConnector({
    chains,
    options: {
      name: 'Injected',
      shimDisconnect: true,
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      projectId,
      metadata: {
        name: 'YesCoin',
        description: 'YesCoin Web3 Application - 预见健康，奖励未来',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`]
      }
    },
  }),
]

// 创建wagmi配置
export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

// 导出链信息
export { chains }
export { projectId }

// 默认导出配置
export default config