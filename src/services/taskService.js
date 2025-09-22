// NEW - 任务管理服务
import { taskAPI } from '../utils/api'
import i18n from '../i18n'

// 任务状态管理
class TaskService {
  constructor() {
    this.tasks = []
    this.listeners = new Set()
  }

  // 添加状态监听器
  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // 通知状态变化
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.tasks))
  }

  // 获取任务列表
  async getTasks() {
    try {
      console.log(i18n.t('common.gettingTasks'))
      const tasks = await taskAPI.getTasks()
      
      // 转换任务数据格式以适配前端
      this.tasks = tasks.map(task => ({
        id: task.id,
        text: task.title || task.description,
        description: task.description,
        type: task.type || 'SOCIAL_FOLLOW',
        url: task.url || '#',
        points: task.points || 0,
        done: task.isCompleted || false,
        link: this.getTaskLink(task)
      }))
      
      console.log(i18n.t('common.getTasksSuccess'), this.tasks)
      this.notifyListeners()
      return this.tasks
    } catch (error) {
      console.error(i18n.t('common.getTasksFailed'), error)
      
      // 如果API失败，返回默认任务
      this.tasks = this.getDefaultTasks()
      this.notifyListeners()
      throw error
    }
  }

  // 完成任务
  async completeTask(taskId, verificationData = {}) {
    try {
      console.log(i18n.t('common.completingTask'), taskId, verificationData)
      
      const result = await taskAPI.completeTask(taskId, verificationData)
      
      // 更新本地任务状态
      this.tasks = this.tasks.map(task => 
        task.id === taskId 
          ? { ...task, done: true }
          : task
      )
      
      this.notifyListeners()
      console.log(i18n.t('common.taskCompleteSuccess'), result)
      return result
    } catch (error) {
      console.error(i18n.t('common.taskCompleteFailed'), error)
      throw error
    }
  }

  // 验证任务（本地标记为完成）
  verifyTask(taskId) {
    this.tasks = this.tasks.map(task => 
      task.id === taskId 
        ? { ...task, done: true }
        : task
    )
    this.notifyListeners()
    
    // 异步提交到后端
    this.completeTask(taskId).catch(error => {
      console.warn(i18n.t('common.backendSubmitFailed'), error)
      // 可以选择回滚本地状态或显示警告
    })
  }

  // 获取任务链接
  getTaskLink(task) {
    switch (task.type) {
      case 'TELEGRAM_JOIN':
        return task.url || 'https://t.me/yescoin_official'
      case 'TWITTER_FOLLOW':
        return task.url || 'https://twitter.com/yescoin_official'
      case 'TWITTER_RETWEET':
        return task.url || 'https://twitter.com/yescoin_official'
      case 'SOCIAL_SHARE':
        return task.url || '#'
      case 'WALLET_CONNECT':
        return '#'
      default:
        return task.url || '#'
    }
  }

  // 获取默认任务（API失败时的备用）
  getDefaultTasks() {
    return [
      {
        id: 1,
        text: i18n.t('common.joinTelegramGroup'),
        description: i18n.t('common.joinTelegramDesc'),
        type: 'TELEGRAM_JOIN',
        url: 'https://t.me/yescoin_official',
        points: 1000,
        done: false,
        link: 'https://t.me/yescoin_official'
      },
      {
        id: 2,
        text: i18n.t('common.followTwitter'),
        description: i18n.t('common.followTwitterDesc'),
        type: 'TWITTER_FOLLOW',
        url: 'https://twitter.com/yescoin_official',
        points: 1500,
        done: false,
        link: 'https://twitter.com/yescoin_official'
      },
      {
        id: 3,
        text: i18n.t('common.socialShare'),
        description: i18n.t('common.socialShareDesc'),
        type: 'SOCIAL_SHARE',
        url: '#',
        points: 2000,
        done: false,
        link: '#'
      },
      {
        id: 4,
        text: i18n.t('common.connectWalletTask'),
        description: i18n.t('common.connectWalletTaskDesc'),
        type: 'WALLET_CONNECT',
        url: '#',
        points: 500,
        done: false,
        link: '#'
      }
    ]
  }

  // 检查所有任务是否完成
  areAllTasksCompleted() {
    return this.tasks.length > 0 && this.tasks.every(task => task.done)
  }

  // 获取已完成任务数量
  getCompletedTasksCount() {
    return this.tasks.filter(task => task.done).length
  }

  // 获取总积分
  getTotalPoints() {
    return this.tasks
      .filter(task => task.done)
      .reduce((total, task) => total + (task.points || 0), 0)
  }

  // 重置任务状态
  reset() {
    this.tasks = []
    this.notifyListeners()
  }
}

// 创建任务服务实例
export const taskService = new TaskService()

export default taskService