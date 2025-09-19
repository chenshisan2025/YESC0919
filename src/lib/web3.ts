// 兼容性文件 - 重新导出wagmi配置
import wagmiConfig, { projectId as wagmiProjectId, chains as wagmiChains } from '../config/wagmi'

// 重新导出
export const config = wagmiConfig
export const projectId = wagmiProjectId
export const chains = wagmiChains

// 默认导出
export default wagmiConfig