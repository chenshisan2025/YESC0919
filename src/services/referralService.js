// NEW - 推荐系统服务
import { referralAPI } from '../utils/api'

// 推荐系统状态管理
class ReferralService {
  constructor() {
    this.referralInfo = null
    this.referralRewards = []
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
      referralInfo: this.referralInfo,
      referralRewards: this.referralRewards
    }))
  }

  // 获取推荐信息
  async getReferralInfo() {
    try {
      console.log('获取推荐信息...')
      const info = await referralAPI.getReferralInfo()
      
      this.referralInfo = {
        referralCode: info.referralCode,
        referralLink: info.referralLink,
        totalReferrals: info.totalReferrals || 0,
        totalRewards: info.totalRewards || 0,
        pendingRewards: info.pendingRewards || 0,
        referredBy: info.referredBy,
        isReferred: !!info.referredBy
      }
      
      console.log('推荐信息获取成功:', this.referralInfo)
      this.notifyListeners()
      return this.referralInfo
    } catch (error) {
      console.error('获取推荐信息失败:', error)
      
      // 设置默认推荐信息
      this.referralInfo = {
        referralCode: null,
        referralLink: null,
        totalReferrals: 0,
        totalRewards: 0,
        pendingRewards: 0,
        referredBy: null,
        isReferred: false
      }
      
      this.notifyListeners()
      throw error
    }
  }

  // 获取推荐奖励列表
  async getReferralRewards() {
    try {
      console.log('获取推荐奖励列表...')
      const rewards = await referralAPI.getReferralRewards()
      
      this.referralRewards = rewards.map(reward => ({
        id: reward.id,
        referredUser: reward.referredUser,
        amount: reward.amount,
        status: reward.status,
        type: reward.type,
        createdAt: reward.createdAt,
        claimedAt: reward.claimedAt
      }))
      
      console.log('推荐奖励列表获取成功:', this.referralRewards)
      this.notifyListeners()
      return this.referralRewards
    } catch (error) {
      console.error('获取推荐奖励列表失败:', error)
      this.referralRewards = []
      this.notifyListeners()
      throw error
    }
  }

  // 生成推荐链接
  generateReferralLink(userAddress) {
    if (!userAddress) {
      console.warn('无法生成推荐链接：用户地址为空')
      return null
    }
    
    const baseUrl = window.location.origin
    const referralLink = `${baseUrl}?referral=${userAddress}`
    
    console.log('生成推荐链接:', referralLink)
    return referralLink
  }

  // 复制推荐链接
  async copyReferralLink(userAddress) {
    const link = this.generateReferralLink(userAddress)
    if (!link) {
      throw new Error('无法生成推荐链接')
    }
    
    try {
      await navigator.clipboard.writeText(link)
      console.log('推荐链接已复制到剪贴板')
      return true
    } catch (error) {
      console.error('复制推荐链接失败:', error)
      
      // 降级方案：使用传统方法复制
      try {
        const textArea = document.createElement('textarea')
        textArea.value = link
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        console.log('推荐链接已复制到剪贴板（降级方案）')
        return true
      } catch (fallbackError) {
        console.error('降级复制方案也失败:', fallbackError)
        throw new Error('复制失败，请手动复制链接')
      }
    }
  }

  // 处理推荐参数
  handleReferralParam() {
    const urlParams = new URLSearchParams(window.location.search)
    const referralAddress = urlParams.get('referral')
    
    if (referralAddress && this.isValidAddress(referralAddress)) {
      // 存储推荐人地址
      localStorage.setItem('referral_address', referralAddress)
      console.log('检测到有效推荐链接:', referralAddress)
      
      // 清理URL参数
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
      
      return referralAddress
    }
    
    return null
  }

  // 验证地址格式
  isValidAddress(address) {
    // 简单的以太坊地址格式验证
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // 获取推荐人地址
  getReferralAddress() {
    return localStorage.getItem('referral_address')
  }

  // 清除推荐人地址
  clearReferralAddress() {
    localStorage.removeItem('referral_address')
  }

  // 计算推荐奖励
  calculateReferralReward(baseAmount = 10000000) {
    // 推荐人获得被推荐人空投金额的10%
    return Math.floor(baseAmount * 0.1)
  }

  // 获取推荐状态文本
  getReferralStatusText(status) {
    switch (status) {
      case 'pending':
        return '待发放'
      case 'completed':
        return '已发放'
      case 'failed':
        return '发放失败'
      default:
        return '未知状态'
    }
  }

  // 格式化推荐奖励显示
  formatReferralReward(reward) {
    return {
      ...reward,
      formattedAmount: this.formatTokenAmount(reward.amount),
      statusText: this.getReferralStatusText(reward.status),
      formattedDate: new Date(reward.createdAt).toLocaleDateString('zh-CN')
    }
  }

  // 格式化代币数量
  formatTokenAmount(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M'
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K'
    }
    return amount.toString()
  }

  // 获取推荐统计
  getReferralStats() {
    if (!this.referralInfo) {
      return {
        totalReferrals: 0,
        totalRewards: 0,
        pendingRewards: 0,
        completedRewards: 0
      }
    }
    
    const completedRewards = this.referralRewards
      .filter(reward => reward.status === 'completed')
      .reduce((total, reward) => total + reward.amount, 0)
    
    return {
      totalReferrals: this.referralInfo.totalReferrals,
      totalRewards: this.referralInfo.totalRewards,
      pendingRewards: this.referralInfo.pendingRewards,
      completedRewards
    }
  }

  // 重置状态
  reset() {
    this.referralInfo = null
    this.referralRewards = []
    this.notifyListeners()
  }
}

// 创建推荐服务实例
export const referralService = new ReferralService()

// 初始化时处理推荐参数
referralService.handleReferralParam()

export default referralService