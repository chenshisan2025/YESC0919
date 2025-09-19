// NEW - API客户端配置和HTTP请求封装

const API_BASE_URL = 'http://localhost:3002'

// 存储和获取JWT token
const TOKEN_KEY = 'yescoin_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY)
}

// HTTP请求封装类
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = tokenStorage.get()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      
      // 处理401未授权错误
      if (response.status === 401) {
        tokenStorage.remove()
        throw new Error('登录已过期，请重新连接钱包')
      }
      
      // 处理其他HTTP错误
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API请求失败 [${endpoint}]:`, error)
      throw error
    }
  }

  // GET请求
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  // POST请求
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // PUT请求
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // DELETE请求
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient()

// 用户认证相关API
export const authAPI = {
  // 获取nonce
  getNonce: (walletAddress) => 
    apiClient.get('/api/auth/nonce', { walletAddress }),
  
  // 登录/注册
  login: (walletAddress, signature, nonce) => 
    apiClient.post('/api/auth/login', { walletAddress, signature, nonce }),
  
  // 获取用户资料
  getProfile: () => 
    apiClient.get('/api/users/profile'),
  
  // 获取用户统计
  getStats: () => 
    apiClient.get('/api/users/stats')
}

// 任务相关API
export const taskAPI = {
  // 获取任务列表
  getTasks: () => 
    apiClient.get('/api/tasks'),
  
  // 完成任务
  completeTask: (taskId, verificationData = {}) => 
    apiClient.post(`/api/tasks/${taskId}/complete`, verificationData)
}

// 空投相关API
export const airdropAPI = {
  // 检查空投资格
  checkEligibility: () => 
    apiClient.get('/api/airdrop/eligibility'),
  
  // 领取空投
  claimAirdrop: () => 
    apiClient.post('/api/airdrop/claim'),
  
  // 获取领取历史
  getClaimHistory: () => 
    apiClient.get('/api/airdrop/history'),
  
  // 获取空投统计
  getStats: () => 
    apiClient.get('/api/airdrop/stats')
}

// 推荐相关API
export const referralAPI = {
  // 获取推荐信息
  getReferralInfo: () => 
    apiClient.get('/api/referrals/info'),
  
  // 获取推荐奖励
  getReferralRewards: () => 
    apiClient.get('/api/referrals/rewards')
}

// 健康检查
export const healthCheck = () => 
  apiClient.get('/health')

export default apiClient