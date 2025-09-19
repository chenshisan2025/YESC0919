// EDIT - 集成Web3功能和用户认证的WalletContext
import { createContext, useContext, useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { authService } from '../services/authService'

const WalletCtx = createContext(null)

export function WalletProvider({ children }) {
  const { address, isConnected, isConnecting } = useAccount()
  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  
  // 用户认证状态
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState(null)

  // 监听认证状态变化
  useEffect(() => {
    const unsubscribe = authService.addListener(({ user, isAuthenticated }) => {
      setUser(user)
      setIsAuthenticated(isAuthenticated)
    })
    
    // 初始化时检查认证状态
    authService.checkAuthStatus()
    
    return unsubscribe
  }, [])

  // 监听钱包连接状态变化
  useEffect(() => {
    console.log('钱包状态变化:', { isConnected, address, isAuthenticated, isAuthenticating })
    
    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      // 钱包连接后自动尝试登录
      console.log('钱包已连接，开始自动登录')
      handleLogin()
    } else if (!isConnected && isAuthenticated) {
      // 钱包断开后登出
      console.log('钱包已断开，执行登出')
      authService.logout()
    }
  }, [isConnected, address, isAuthenticated, isAuthenticating])

  // 连接钱包
  const connect = async () => {
    try {
      console.log('开始连接钱包...')
      setAuthError(null)
      await open()
      console.log('钱包连接成功')
    } catch (error) {
      console.error('连接钱包失败:', error)
      setAuthError(`连接钱包失败: ${error.message || '未知错误'}`)
    }
  }

  // 用户登录
  const handleLogin = async () => {
    if (!address || isAuthenticating) {
      console.log('登录条件不满足:', { address, isAuthenticating })
      return
    }
    
    console.log('开始用户登录...', address)
    setIsAuthenticating(true)
    setAuthError(null)
    
    try {
      await authService.loginWithWallet(address)
      console.log('用户登录成功')
    } catch (error) {
      console.error('登录失败:', error)
      setAuthError(`登录失败: ${error.message || '服务器错误'}`)
    } finally {
      setIsAuthenticating(false)
    }
  }

  // 断开连接
  const handleDisconnect = () => {
    authService.logout()
    disconnect()
  }

  // 格式化地址显示
  const formatAddress = (addr) => {
    if (!addr) return null
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const value = {
    // 钱包状态
    account: formatAddress(address),
    address,
    formattedAddress: formatAddress(address),
    isConnected,
    isConnecting,
    connect,
    connectWallet: connect, // 添加别名以兼容现有代码
    disconnect: handleDisconnect,
    error: authError,
    
    // 用户认证状态
    user,
    isAuthenticated,
    isAuthenticating,
    authError,
    login: handleLogin,
    
    // 清除错误
    clearAuthError: () => setAuthError(null)
  }

  return (
    <WalletCtx.Provider value={value}>
      {children}
    </WalletCtx.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletCtx)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
