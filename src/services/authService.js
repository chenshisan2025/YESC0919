// NEW - 用户认证服务
import { authAPI, tokenStorage } from '../utils/api'
import { signMessage } from '@wagmi/core'
import { config } from '../config/wagmi'

// 认证状态管理
class AuthService {
  constructor() {
    this.user = null
    this.isAuthenticated = false
    this.listeners = new Set()
  }

  // 添加状态监听器
  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // 通知状态变化
  notifyListeners() {
    this.listeners.forEach(callback => callback({
      user: this.user,
      isAuthenticated: this.isAuthenticated
    }))
  }

  // 钱包签名登录流程
  async loginWithWallet(walletAddress) {
    try {
      console.log('开始钱包登录流程...', walletAddress)
      
      // 1. 获取nonce
      const { nonce } = await authAPI.getNonce(walletAddress)
      console.log('获取到nonce:', nonce)
      
      // 2. 构造签名消息
      const message = `欢迎来到YesCoin！\n\n请签名以验证您的钱包地址。\n\n随机数: ${nonce}\n地址: ${walletAddress}`
      
      // 3. 请求用户签名
      console.log('请求用户签名...')
      const signature = await signMessage(config, {
        message,
        account: walletAddress
      })
      console.log('签名成功:', signature)
      
      // 4. 发送登录请求
      const response = await authAPI.login(walletAddress, signature, nonce)
      console.log('登录响应:', response)
      
      // 5. 存储token和用户信息
      if (response.token) {
        tokenStorage.set(response.token)
        this.user = response.user
        this.isAuthenticated = true
        this.notifyListeners()
        
        console.log('登录成功:', response.user)
        return { success: true, user: response.user }
      } else {
        throw new Error('登录响应中缺少token')
      }
      
    } catch (error) {
      console.error('钱包登录失败:', error)
      
      // 处理用户拒绝签名
      if (error.message.includes('User rejected') || error.message.includes('用户拒绝')) {
        throw new Error('用户取消了签名，登录已取消')
      }
      
      // 处理其他错误
      throw new Error(error.message || '登录失败，请重试')
    }
  }

  // 检查现有token有效性
  async checkAuthStatus() {
    const token = tokenStorage.get()
    if (!token) {
      return false
    }
    
    try {
      const user = await authAPI.getProfile()
      this.user = user
      this.isAuthenticated = true
      this.notifyListeners()
      return true
    } catch (error) {
      console.log('Token已过期或无效')
      this.logout()
      return false
    }
  }

  // 登出
  logout() {
    tokenStorage.remove()
    this.user = null
    this.isAuthenticated = false
    this.notifyListeners()
    console.log('用户已登出')
  }

  // 获取用户信息
  async getUserProfile() {
    if (!this.isAuthenticated) {
      throw new Error('用户未登录')
    }
    
    try {
      const user = await authAPI.getProfile()
      this.user = user
      this.notifyListeners()
      return user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 获取用户统计
  async getUserStats() {
    if (!this.isAuthenticated) {
      throw new Error('用户未登录')
    }
    
    try {
      return await authAPI.getStats()
    } catch (error) {
      console.error('获取用户统计失败:', error)
      throw error
    }
  }

  // 处理推荐参数
  handleReferralParam() {
    const urlParams = new URLSearchParams(window.location.search)
    const referralAddress = urlParams.get('referral')
    
    if (referralAddress) {
      // 存储推荐人地址到localStorage
      localStorage.setItem('referral_address', referralAddress)
      console.log('检测到推荐链接:', referralAddress)
      
      // 清理URL参数
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
    
    return referralAddress
  }

  // 获取推荐人地址
  getReferralAddress() {
    return localStorage.getItem('referral_address')
  }

  // 清除推荐人地址
  clearReferralAddress() {
    localStorage.removeItem('referral_address')
  }
}

// 创建认证服务实例
export const authService = new AuthService()

// 初始化时检查推荐参数
authService.handleReferralParam()

export default authService