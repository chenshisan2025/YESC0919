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
    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      // 钱包连接后自动尝试登录
      handleLogin()
    } else if (!isConnected && isAuthenticated) {
      // 钱包断开后登出
      authService.logout()
    }
  }, [isConnected, address, isAuthenticated, isAuthenticating])

  // 连接钱包
  const connect = async () => {
    try {
      setAuthError(null)
      await open()
    } catch (error) {
      console.error('连接钱包失败:', error)
      setAuthError('连接钱包失败')
    }
  }

  // 用户登录
  const handleLogin = async () => {
    if (!address || isAuthenticating) return
    
    setIsAuthenticating(true)
    setAuthError(null)
    
    try {
      await authService.loginWithWallet(address)
    } catch (error) {
      console.error('登录失败:', error)
      setAuthError(error.message)
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
    isConnected,
    isConnecting,
    connect,
    disconnect: handleDisconnect,
    
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
