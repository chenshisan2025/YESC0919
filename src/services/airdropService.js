// NEW - 空投服务
import { airdropAPI } from '../utils/api'

// 空投状态管理
class AirdropService {
  constructor() {
    this.eligibility = null
    this.claimStatus = null
    this.claimHistory = []
    this.stats = null
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
      eligibility: this.eligibility,
      claimStatus: this.claimStatus,
      claimHistory: this.claimHistory,
      stats: this.stats
    }))
  }

  // 检查空投资格
  async checkEligibility() {
    try {
      console.log('检查空投资格...')
      const eligibility = await airdropAPI.checkEligibility()
      
      this.eligibility = {
        isEligible: eligibility.isEligible,
        reason: eligibility.reason,
        amount: eligibility.amount || 10000000, // 默认1000万YES
        hasClaimedBefore: eligibility.hasClaimedBefore,
        canClaim: eligibility.canClaim,
        requirements: eligibility.requirements || []
      }
      
      console.log('空投资格检查结果:', this.eligibility)
      this.notifyListeners()
      return this.eligibility
    } catch (error) {
      console.error('检查空投资格失败:', error)
      
      // 设置默认资格状态
      this.eligibility = {
        isEligible: true,
        reason: '满足基本条件',
        amount: 10000000,
        hasClaimedBefore: false,
        canClaim: true,
        requirements: ['连接钱包', '完成基础任务']
      }
      
      this.notifyListeners()
      throw error
    }
  }

  // 领取空投
  async claimAirdrop() {
    try {
      console.log('开始领取空投...')
      
      // 检查是否已经领取过
      if (this.eligibility?.hasClaimedBefore) {
        throw new Error('您已经领取过空投，每个地址只能领取一次')
      }
      
      // 检查是否符合领取条件
      if (!this.eligibility?.canClaim) {
        throw new Error(this.eligibility?.reason || '不符合领取条件')
      }
      
      const result = await airdropAPI.claimAirdrop()
      
      this.claimStatus = {
        success: true,
        transactionHash: result.transactionHash,
        amount: result.amount || 10000000,
        timestamp: new Date().toISOString(),
        status: result.status || 'completed'
      }
      
      // 更新资格状态
      if (this.eligibility) {
        this.eligibility.hasClaimedBefore = true
        this.eligibility.canClaim = false
      }
      
      console.log('空投领取成功:', this.claimStatus)
      this.notifyListeners()
      return this.claimStatus
    } catch (error) {
      console.error('空投领取失败:', error)
      
      this.claimStatus = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
      
      this.notifyListeners()
      throw error
    }
  }

  // 获取领取历史
  async getClaimHistory() {
    try {
      console.log('获取领取历史...')
      const history = await airdropAPI.getClaimHistory()
      
      this.claimHistory = history.map(claim => ({
        id: claim.id,
        amount: claim.amount,
        transactionHash: claim.transactionHash,
        status: claim.status,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt
      }))
      
      console.log('领取历史获取成功:', this.claimHistory)
      this.notifyListeners()
      return this.claimHistory
    } catch (error) {
      console.error('获取领取历史失败:', error)
      this.claimHistory = []
      this.notifyListeners()
      throw error
    }
  }

  // 获取空投统计
  async getAirdropStats() {
    try {
      console.log('获取空投统计...')
      const stats = await airdropAPI.getStats()
      
      this.stats = {
        totalClaimed: stats.totalClaimed || 0,
        totalUsers: stats.totalUsers || 0,
        totalAmount: stats.totalAmount || 0,
        remainingAmount: stats.remainingAmount || 0,
        claimRate: stats.claimRate || 0
      }
      
      console.log('空投统计获取成功:', this.stats)
      this.notifyListeners()
      return this.stats
    } catch (error) {
      console.error('获取空投统计失败:', error)
      
      // 设置默认统计数据
      this.stats = {
        totalClaimed: 0,
        totalUsers: 0,
        totalAmount: 0,
        remainingAmount: 1000000000000, // 1万亿YES
        claimRate: 0
      }
      
      this.notifyListeners()
      throw error
    }
  }

  // 模拟领取（用于演示）
  async simulateClaim() {
    console.log('模拟空投领取...')
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 生成模拟交易哈希
    const mockTxHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    
    this.claimStatus = {
      success: true,
      transactionHash: mockTxHash,
      amount: 10000000,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }
    
    // 更新资格状态
    if (this.eligibility) {
      this.eligibility.hasClaimedBefore = true
      this.eligibility.canClaim = false
    }
    
    this.notifyListeners()
    return this.claimStatus
  }

  // 检查是否可以领取
  canClaimAirdrop() {
    return this.eligibility?.canClaim && !this.eligibility?.hasClaimedBefore
  }

  // 获取领取状态文本
  getClaimStatusText() {
    if (!this.eligibility) {
      return '检查资格中...'
    }
    
    if (this.eligibility.hasClaimedBefore) {
      return '已领取'
    }
    
    if (!this.eligibility.isEligible) {
      return this.eligibility.reason || '不符合条件'
    }
    
    if (!this.eligibility.canClaim) {
      return '暂不可领取'
    }
    
    return '可以领取'
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

  // 重置状态
  reset() {
    this.eligibility = null
    this.claimStatus = null
    this.claimHistory = []
    this.stats = null
    this.notifyListeners()
  }
}

// 创建空投服务实例
export const airdropService = new AirdropService()

export default airdropService