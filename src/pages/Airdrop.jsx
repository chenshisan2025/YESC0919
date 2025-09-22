import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'sonner';
import { Copy, ExternalLink, CheckCircle, Clock, Users, Gift, Twitter, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Airdrop = () => {
  const { isConnected, address, connectWallet } = useWeb3();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: t('airdrop.tasks.followTwitter.title'),
      description: t('airdrop.tasks.followTwitter.description'),
      reward: '2,000,000 YES',
      completed: false,
      verified: false,
      action: 'external',
      link: 'https://twitter.com/yescoin_official',
      icon: Twitter
    },
    {
      id: 2,
      title: t('airdrop.tasks.joinTelegram.title'),
      description: t('airdrop.tasks.joinTelegram.description'),
      reward: '2,000,000 YES',
      completed: false,
      verified: false,
      action: 'external',
      link: 'https://t.me/yescoin_official',
      icon: MessageCircle
    },
    {
      id: 3,
      title: t('airdrop.tasks.retweetPost.title'),
      description: t('airdrop.tasks.retweetPost.description'),
      reward: '3,000,000 YES',
      completed: false,
      verified: false,
      action: 'external',
      link: 'https://twitter.com/yescoin_official/status/123456789',
      icon: Twitter
    },
    {
      id: 4,
      title: t('airdrop.tasks.inviteFriends.title'),
      description: t('airdrop.tasks.inviteFriends.description'),
      reward: '3,000,000 YES',
      completed: false,
      verified: false,
      action: 'auto',
      link: null,
      icon: Users
    }
  ]);
  const [airdropEligible, setAirdropEligible] = useState(false);
  const [claimHistory, setClaimHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [userStats, setUserStats] = useState({
    totalParticipants: 15420,
    totalClaimed: 8930,
    totalDistributed: '89,300,000,000'
  });

  // 从后端API获取用户任务状态
  const fetchUserTasks = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      // 模拟API调用
      const response = await fetch(`/api/airdrop/tasks/${address}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(prevTasks => 
          prevTasks.map(task => ({
            ...task,
            completed: data.completedTasks?.includes(task.id) || false,
            verified: data.verifiedTasks?.includes(task.id) || false
          }))
        );
        setReferralCount(data.referralCount || 0);
      }
    } catch (error) {
      console.error(t('common.getTaskStatusFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  // 监听钱包连接状态变化
  useEffect(() => {
    if (isConnected && address) {
      fetchUserTasks();
    }
  }, [isConnected, address]);

  // 验证任务完成
  const verifyTask = async (taskId) => {
    if (!address) {
      toast.error(t('airdrop.errors.connectWalletFirst'));
      return;
    }

    try {
      setLoading(true);
      
      // 调用后端API验证任务
      const response = await fetch('/api/airdrop/verify-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          taskId
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTasks(prevTasks =>
            prevTasks.map(task =>
              task.id === taskId
                ? { ...task, completed: true, verified: true }
                : task
            )
          );
          toast.success(t('airdrop.messages.taskVerified'));
        } else {
          toast.error(data.message || t('airdrop.errors.taskVerificationFailed'));
        }
      } else {
        toast.error(t('airdrop.errors.verificationRequestFailed'));
      }
    } catch (error) {
      console.error(t('common.taskVerificationFailed'), error);
      toast.error(t('airdrop.errors.verificationError'));
    } finally {
      setLoading(false);
    }
  };

  // 处理外部链接任务
  const handleExternalTask = (task) => {
    if (task.link) {
      window.open(task.link, '_blank');
      // 打开链接后，显示验证按钮
      setTimeout(() => {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === task.id
              ? { ...t, action: 'verify' }
              : t
          )
        );
      }, 2000);
    }
  };

  // 处理任务操作
  const handleTaskAction = async (task) => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (task.action === 'external') {
      handleExternalTask(task);
    } else if (task.action === 'verify') {
      await verifyTask(task.id);
    } else if (task.action === 'auto') {
      // 自动验证任务（如邀请好友）
      if (task.id === 4) {
        // 检查邀请数量
        if (referralCount >= 3) {
          await verifyTask(task.id);
        } else {
          toast.error(t('airdrop.errors.needMoreInvites', { current: referralCount, required: 3 }));
        }
      }
    }
  };

  // 领取空投
  const handleClaimAirdrop = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!airdropEligible) {
      toast.error(t('airdrop.errors.completeAllTasks'));
      return;
    }

    setClaiming(true);
    try {
      // 调用后端API领取空投
      const response = await fetch('/api/airdrop/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const claimAmount = 10000000;
          const newClaim = {
            id: Date.now(),
            amount: claimAmount,
            timestamp: new Date(),
            txHash: data.txHash || '0x' + Math.random().toString(16).substr(2, 64)
          };
          
          setClaimHistory(prev => [newClaim, ...prev]);
          setTotalRewards(prev => prev + claimAmount);
          setMessage(t('airdrop.messages.claimSuccess'));
          toast.success(t('airdrop.messages.claimSuccessToast', { amount: claimAmount.toLocaleString() }));
          
          // 更新统计数据
          setUserStats(prev => ({
            ...prev,
            totalClaimed: prev.totalClaimed + 1,
            totalDistributed: (parseInt(prev.totalDistributed.replace(/,/g, '')) + claimAmount).toLocaleString()
          }));
        } else {
          toast.error(data.message || t('airdrop.errors.claimFailed'));
        }
      } else {
        toast.error(t('airdrop.errors.claimRequestFailed'));
      }
    } catch (error) {
      console.error(t('common.claimFailed'), error);
      toast.error(t('airdrop.errors.claimError'));
    } finally {
      setClaiming(false);
    }
  };

  // 复制推荐链接
  const handleCopyReferralLink = async () => {
    if (!address) {
      toast.error(t('airdrop.errors.connectWalletFirst'));
      return;
    }

    try {
      const referralLink = `${window.location.origin}/?ref=${address}`;
      await navigator.clipboard.writeText(referralLink);
      toast.success(t('airdrop.messages.referralLinkCopied'));
    } catch (error) {
      console.error(t('common.copyReferralLinkFailed'), error);
      toast.error(t('airdrop.errors.copyReferralLinkFailed'));
    }
  };

  // 检查是否可以领取空投
  const canClaimAirdrop = () => {
    return tasks.every(task => task.completed && task.verified);
  };

  // 获取领取按钮文本
  const getClaimButtonText = () => {
    if (claiming) return t('airdrop.buttons.claiming');
    if (!isConnected) return t('common.connectWallet');
    if (!canClaimAirdrop()) return t('airdrop.buttons.completeAllTasks');
    return t('airdrop.buttons.claimTokens');
  };

  // 更新空投资格状态
  useEffect(() => {
    setAirdropEligible(canClaimAirdrop());
  }, [tasks]);

  // 格式化数字
  const formatNumber = (num) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  // 格式化日期
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('airdrop.title')}</h1>
          <p className="text-lg text-gray-600">{t('airdrop.subtitle')}</p>
          {isConnected && address && (
            <div className="mt-4 text-sm text-gray-500">
              {t('airdrop.welcomeBack', { address: `${address.slice(0, 6)}...${address.slice(-4)}` })}
            </div>
          )}
        </div>

        {!isConnected ? (
          /* 未连接钱包状态 */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{t('airdrop.startJourney.title')}</h2>
            <p className="text-gray-600 mb-6">{t('airdrop.startJourney.description')}</p>
            <button 
              onClick={connectWallet}
              disabled={loading}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('common.connecting')}
                </>
              ) : (
                t('common.connectWallet')
              )}
            </button>
          </div>
        ) : (
          /* 已连接钱包状态 */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 任务列表 */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">{t('airdrop.tasks.title')}</h2>
                <div className="text-sm text-gray-500">
                  {t('airdrop.tasks.completed', { completed: tasks.filter(t => t.completed).length, total: tasks.length })}
                </div>
              </div>
              
              <div className="space-y-4">
                {tasks.map(task => {
                  const IconComponent = task.icon;
                  return (
                    <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            task.completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}>
                            {task.completed ? (
                              <CheckCircle className="w-6 h-6 text-white" />
                            ) : (
                              <IconComponent className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            <div className="flex items-center text-sm text-green-600">
                              <Gift className="w-4 h-4 mr-1" />
                              {t('airdrop.tasks.reward')}: {task.reward}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {task.completed ? (
                            <span className="text-green-600 font-medium flex items-center font-pixel">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('airdrop.tasks.status.completed')}
                            </span>
                          ) : (
                            <>
                              {task.link && (
                                <motion.a 
                                  href={task.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="pixel-button bg-orange text-brown text-sm flex items-center"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {t('airdrop.tasks.buttons.goComplete')}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </motion.a>
                              )}
                              <motion.button 
                                onClick={() => verifyTask(task.id)}
                                disabled={loading}
                                className="pixel-button bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white text-sm flex items-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {loading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                    {t('airdrop.tasks.status.verifying')}
                                  </>
                                ) : (
                                  t('airdrop.tasks.buttons.verify')
                                )}
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {t('airdrop.tasks.noTasks')}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧面板 */}
            <div className="space-y-6">
              {/* 空投领取 */}
              <motion.div 
                className="pixel-card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-xl font-pixel text-gold mb-4 flex items-center gap-2">
                  <Gift className="w-6 h-6" />
                  {t('airdrop.claim.title')}
                </h2>
                
                <div className="space-y-4">
                  <div className="pixel-card-inner p-4">
                    <div className="text-sm text-brown/70 mb-2 font-pixel">{t('airdrop.claim.claimableAmount')}</div>
                    <div className="text-2xl font-bold text-gold font-pixel">
                      10,000,000 YES
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-brown/70 font-pixel">{t('airdrop.claim.taskProgress')}</span>
                      <span className="text-brown font-pixel">
                        {tasks.filter(t => t.completed).length} / {tasks.length}
                      </span>
                    </div>
                    <div className="pixel-progress-bar">
                      <motion.div 
                        className="pixel-progress-fill bg-magenta"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` 
                        }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={!isConnected ? connectWallet : handleClaimAirdrop}
                    disabled={claiming || (isConnected && !canClaimAirdrop())}
                    className="w-full pixel-button-primary py-3 text-sm flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {claiming && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brown" />}
                    {getClaimButtonText()}
                  </motion.button>
                  
                  {claimHistory.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-brown/20">
                      <div className="text-sm text-brown/70 mb-2 font-pixel">{t('airdrop.claim.history.title')}</div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {claimHistory.slice(0, 3).map((claim) => (
                          <div key={claim.id} className="text-xs text-brown font-pixel flex justify-between">
                            <span>{formatNumber(claim.amount)} YES</span>
                            <span>{formatDate(claim.timestamp)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 推荐系统 */}
              <motion.div 
                className="pixel-card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-xl font-pixel text-gold mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  {t('airdrop.referral.title')}
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="pixel-card-inner p-3 text-center">
                      <div className="text-sm text-brown/70 font-pixel">{t('airdrop.referral.referredUsers')}</div>
                      <div className="text-xl font-bold text-orange font-pixel">
                        {referralCount}
                      </div>
                    </div>
                    <div className="pixel-card-inner p-3 text-center">
                      <div className="text-sm text-brown/70 font-pixel">{t('airdrop.referral.totalRewards')}</div>
                      <div className="text-xl font-bold text-magenta font-pixel">
                        {formatNumber(totalRewards)}
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={handleCopyReferralLink}
                    disabled={!isConnected}
                    className="w-full pixel-button-secondary py-2 text-sm flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy className="w-4 h-4" />
                    {t('airdrop.referral.copyLink')}
                  </motion.button>
                  
                  <div className="text-xs text-brown/70 text-center font-pixel">
                    {t('common.referralRewardDescription')}
                  </div>
                </div>
              </motion.div>

              {/* 统计信息 */}
              <motion.div 
                className="pixel-card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-xl font-pixel text-gold mb-4 flex items-center gap-2">
                  📊 {t('airdrop.stats.title')}
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-brown/70 font-pixel">{t('airdrop.stats.totalParticipants')}</span>
                    <span className="font-semibold text-brown font-pixel">{formatNumber(userStats.totalParticipants)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brown/70 font-pixel">{t('airdrop.stats.totalClaimed')}</span>
                    <span className="font-semibold text-magenta font-pixel">{formatNumber(userStats.totalClaimed)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-brown/70 font-pixel">{t('airdrop.stats.totalDistributed')}</span>
                    <span className="font-semibold text-orange font-pixel">
                      {userStats.totalDistributed} YES
                    </span>
                  </div>
                  <div className="pt-2 border-t border-brown/20">
                    <div className="text-sm text-brown/70 text-center font-pixel">
                      {t('airdrop.stats.claimRate')}: {((userStats.totalClaimed / userStats.totalParticipants) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Airdrop
