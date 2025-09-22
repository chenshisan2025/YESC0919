import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, TrendingUp, Users, Coins, BarChart3, DollarSign, Copy, CheckCircle, Globe, Shield, Zap, Target } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { useTranslation } from 'react-i18next'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const TokenInfo = () => {
  const { isConnected, provider } = useWeb3()
  const { t } = useTranslation()
  const [tokenStats, setTokenStats] = useState({
    totalSupply: '1,000,000,000,000,000', // 1000万亿
    circulatingSupply: '500,000,000,000,000', // 500万亿
    holders: '25,847',
    price: '$0.000014',
    marketCap: '$134,000',
    volume24h: '$8,432',
    fdv: '$14,000,000' // 完全稀释市值
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // YesCoin合约信息
  const tokenInfo = {
    name: 'YesCoin',
    symbol: 'YES',
    contractAddress: '0x1234567890123456789012345678901234567890', // 示例地址
    blockchain: t('common.bscNetwork'),
    decimals: 18,
    network: 'BNB Smart Chain'
  }

  // 分配方案饼图数据
  const distributionData = {
    labels: [t('common.communityDistribution')],
    datasets: [
      {
        data: [100],
        backgroundColor: ['#10B981'],
        borderColor: ['#059669'],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E5E7EB',
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%'
          }
        }
      }
    }
  }

  // 复制合约地址功能
  const copyContractAddress = async () => {
    try {
      await navigator.clipboard.writeText(tokenInfo.contractAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  useEffect(() => {
    fetchTokenData()
  }, [isConnected])

  const fetchTokenData = async () => {
    try {
      setLoading(true)
      // 模拟API调用获取代币数据
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 这里可以集成真实的API或区块链数据
      setTokenStats({
        totalSupply: '1,000,000,000',
        circulatingSupply: '100,000,000', 
        holders: Math.floor(Math.random() * 1000 + 12000).toLocaleString(),
        price: '$0.000' + Math.floor(Math.random() * 9 + 1),
        marketCap: '$' + Math.floor(Math.random() * 50000 + 10000).toLocaleString(),
        volume24h: '$' + Math.floor(Math.random() * 10000 + 1000).toLocaleString()
      })
    } catch (error) {
      console.error('Failed to fetch token data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            {t('tokenInfo.title')}
          </h1>
          <p className="text-xl text-gray-300">
            {t('tokenInfo.subtitle')}
          </p>
        </motion.div>

        {/* 主要内容区域 - 三区域布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 基本信息区（左侧） */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* 代币概览 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Coins className="mr-3 text-green-400" size={28} />
                {t('tokenInfo.overview.title')}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('tokenInfo.overview.tokenName')}:</span>
                  <span className="font-semibold">{tokenInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('tokenInfo.overview.tokenSymbol')}:</span>
                  <span className="font-semibold text-green-400">{tokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('tokenInfo.overview.blockchain')}:</span>
                  <span className="font-semibold flex items-center">
                    <Globe className="mr-1" size={16} />
                    {tokenInfo.blockchain}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('tokenInfo.overview.decimals')}:</span>
                  <span className="font-semibold">{tokenInfo.decimals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{t('tokenInfo.overview.totalSupply')}:</span>
                  <span className="font-semibold">{tokenStats.totalSupply}</span>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{t('tokenInfo.overview.contractAddress')}:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-700 px-3 py-2 rounded text-sm flex-1 truncate">
                      {tokenInfo.contractAddress}
                    </code>
                    <button
                      onClick={copyContractAddress}
                      className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded transition-colors flex items-center"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-green-400 text-sm mt-2">✓ {t('tokenInfo.messages.addressCopied')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 分配方案图表 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="mr-3 text-green-400" size={24} />
                {t('tokenInfo.distribution.title')}
              </h3>
              <div className="h-64">
                <Pie data={distributionData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-green-400 font-semibold">{t('tokenInfo.distribution.community')}</p>
                <p className="text-gray-300 text-sm mt-1">{t('tokenInfo.distribution.fairLaunch')}</p>
              </div>
            </div>
          </motion.div>

          {/* 价格与指标区（右侧） */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* 实时价格图表区域 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="mr-3 text-green-400" size={28} />
                {t('tokenInfo.chart.title')}
              </h2>
              <div className="bg-gray-700/50 rounded-xl p-8 text-center">
                <div className="mb-4">
                  <BarChart3 className="mx-auto text-green-400" size={64} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('common.realTimePriceChart')}</h3>
                <p className="text-gray-300 mb-4">
                  {t('common.integrateChart')}
                </p>
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {t('common.chartPlaceholder')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {t('common.dataSource')}
                  </p>
                </div>
              </div>
            </div>

            {/* 关键指标列表 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <DollarSign className="mr-3 text-green-400" size={24} />
                {t('tokenInfo.metrics.title')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">{t('tokenInfo.metrics.currentPrice')}</p>
                  <p className="text-2xl font-bold text-green-400">{tokenStats.price}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">{t('tokenInfo.metrics.volume24h')}</p>
                  <p className="text-2xl font-bold text-blue-400">{tokenStats.volume24h}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">{t('tokenInfo.metrics.marketCap')}</p>
                  <p className="text-2xl font-bold text-purple-400">{tokenStats.marketCap}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">{t('tokenInfo.metrics.fdv')}</p>
                  <p className="text-2xl font-bold text-yellow-400">{tokenStats.fdv}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">{t('tokenInfo.metrics.circulatingSupply')}</p>
                  <p className="text-lg font-bold text-orange-400">{tokenStats.circulatingSupply}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">{t('common.holdersCount')}</p>
                  <p className="text-lg font-bold text-pink-400">{tokenStats.holders}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center col-span-2">
                  <p className="text-gray-300 text-sm mb-1">{t('common.dataUpdateTime')}</p>
                  <p className="text-sm text-gray-400">{t('common.realTimeUpdate')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 经济模型说明区（下方） */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-12"
        >
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            {t('tokenInfo.economics.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 公平发行理念 */}
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Shield className="mr-3 text-green-400" size={24} />
                  {t('tokenInfo.economics.fairLaunch.title')}
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span><strong className="text-white">{t('common.communityDistributionFull')}：</strong>{t('tokenInfo.descriptions.communityDistributionDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span><strong className="text-white">{t('common.noPrivateSale')}：</strong>{t('tokenInfo.descriptions.noPrivateSaleDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span><strong className="text-white">{t('common.transparentOpen')}：</strong>{t('tokenInfo.descriptions.transparentOpenDesc')}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Zap className="mr-3 text-blue-400" size={24} />
                  {t('tokenInfo.economics.trading.title')}
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-blue-400 mr-2">⚡</span>
                    <span><strong className="text-white">{t('common.zeroTradingTax')}：</strong>{t('tokenInfo.descriptions.zeroTradingTaxDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-400 mr-2">⚡</span>
                    <span><strong className="text-white">{t('common.noInflationMechanism')}：</strong>{t('tokenInfo.descriptions.noInflationMechanismDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-400 mr-2">⚡</span>
                    <span><strong className="text-white">{t('common.communityDriven')}：</strong>{t('tokenInfo.descriptions.communityDrivenDesc')}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 流动性与安全 */}
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <DollarSign className="mr-3 text-purple-400" size={24} />
                  {t('tokenInfo.economics.liquidity.title')}
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-purple-400 mr-2">💧</span>
                    <span><strong className="text-white">{t('common.pancakeSwapPool')}：</strong>{t('tokenInfo.descriptions.pancakeSwapPoolDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-purple-400 mr-2">🔒</span>
                    <span><strong className="text-white">{t('common.liquidityLocked')}：</strong>{t('tokenInfo.descriptions.liquidityLockedDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-purple-400 mr-2">🛡️</span>
                    <span><strong className="text-white">{t('common.securityGuarantee')}：</strong>{t('tokenInfo.descriptions.securityGuaranteeDesc')}</span>
                  </p>
                </div>
                <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-300">
                    <strong>{t('common.lockProof')}：</strong> {t('tokenInfo.descriptions.lockProofDesc')}
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Target className="mr-3 text-yellow-400" size={24} />
                  {t('tokenInfo.economics.future.title')}
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-2">🎯</span>
                    <span><strong className="text-white">{t('common.governanceVoting')}：</strong>{t('tokenInfo.descriptions.governanceVotingDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-2">🎮</span>
                    <span><strong className="text-white">{t('common.gamePayment')}：</strong>{t('tokenInfo.descriptions.gamePaymentDesc')}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-2">🌟</span>
                    <span><strong className="text-white">{t('common.ecosystemExpansion')}：</strong>{t('tokenInfo.descriptions.ecosystemExpansionDesc')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 核心优势总结 */}
          <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-xl font-bold mb-4 text-center text-green-400">
              {t('tokenInfo.advantages.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-semibold text-white mb-1">{t('tokenInfo.advantages.fairDistribution.title')}</h4>
                <p className="text-sm text-gray-300">{t('tokenInfo.advantages.fairDistribution.description')}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-white mb-1">{t('tokenInfo.advantages.lowCost.title')}</h4>
                <p className="text-sm text-gray-300">{t('tokenInfo.advantages.lowCost.description')}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-white mb-1">{t('tokenInfo.advantages.security.title')}</h4>
                <p className="text-sm text-gray-300">{t('tokenInfo.advantages.security.description')}</p>
              </div>
            </div>
          </div>
        </motion.div>



        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button 
            onClick={() => window.open('https://yescoin.site/whitepaper.pdf', '_blank')}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-['Press_Start_2P'] text-sm px-8 py-4 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            {t('tokenInfo.actions.readWhitepaper')}
          </button>
          
          <button 
            onClick={fetchTokenData}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-['Press_Start_2P'] text-sm px-8 py-4 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
            {t('tokenInfo.actions.refreshData')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default TokenInfo
