import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, TrendingUp, Users, Coins, BarChart3, DollarSign, Copy, CheckCircle, Globe, Shield, Zap, Target } from 'lucide-react'
import { useWeb3 } from '../contexts/Web3Context'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const TokenInfo = () => {
  const { isConnected, provider } = useWeb3()
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
    blockchain: 'BSC (币安智能链)',
    decimals: 18,
    network: 'BNB Smart Chain'
  }

  // 分配方案饼图数据
  const distributionData = {
    labels: ['社区发行'],
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
      console.error('复制失败:', err)
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
      console.error('获取代币数据失败:', error)
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
            YES代币信息
          </h1>
          <p className="text-xl text-gray-300">
            了解YesCoin的详细信息和经济模型
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
                代币概览
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">代币名称:</span>
                  <span className="font-semibold">{tokenInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">代币符号:</span>
                  <span className="font-semibold text-green-400">{tokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">区块链:</span>
                  <span className="font-semibold flex items-center">
                    <Globe className="mr-1" size={16} />
                    {tokenInfo.blockchain}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">代币精度:</span>
                  <span className="font-semibold">{tokenInfo.decimals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">总供应量:</span>
                  <span className="font-semibold">{tokenStats.totalSupply}</span>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">合约地址:</span>
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
                    <p className="text-green-400 text-sm mt-2">✓ 地址已复制到剪贴板</p>
                  )}
                </div>
              </div>
            </div>

            {/* 分配方案图表 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BarChart3 className="mr-3 text-green-400" size={24} />
                代币分配方案
              </h3>
              <div className="h-64">
                <Pie data={distributionData} options={chartOptions} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-green-400 font-semibold">100% 社区发行</p>
                <p className="text-gray-300 text-sm mt-1">无团队预留，公平发行</p>
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
                价格走势图表
              </h2>
              <div className="bg-gray-700/50 rounded-xl p-8 text-center">
                <div className="mb-4">
                  <BarChart3 className="mx-auto text-green-400" size={64} />
                </div>
                <h3 className="text-xl font-semibold mb-2">实时价格图表</h3>
                <p className="text-gray-300 mb-4">
                  集成DEXTools或PancakeSwap图表
                </p>
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    📊 此处将显示YES-BNB交易对的实时K线图
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    数据来源: PancakeSwap / DEXTools
                  </p>
                </div>
              </div>
            </div>

            {/* 关键指标列表 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <DollarSign className="mr-3 text-green-400" size={24} />
                关键市场指标
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">当前价格</p>
                  <p className="text-2xl font-bold text-green-400">{tokenStats.price}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">24h交易量</p>
                  <p className="text-2xl font-bold text-blue-400">{tokenStats.volume24h}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">市值</p>
                  <p className="text-2xl font-bold text-purple-400">{tokenStats.marketCap}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">FDV</p>
                  <p className="text-2xl font-bold text-yellow-400">{tokenStats.fdv}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">流通供给量</p>
                  <p className="text-lg font-bold text-orange-400">{tokenStats.circulatingSupply}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center">
                  <p className="text-gray-300 text-sm mb-1">持有者数量</p>
                  <p className="text-lg font-bold text-pink-400">{tokenStats.holders}</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 text-center col-span-2">
                  <p className="text-gray-300 text-sm mb-1">数据更新时间</p>
                  <p className="text-sm text-gray-400">实时更新 • 数据来源: BSCScan</p>
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
            YesCoin 经济模型详解
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 公平发行理念 */}
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Shield className="mr-3 text-green-400" size={24} />
                  公平发行理念
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span><strong className="text-white">100% 社区分发：</strong>所有代币完全用于社区，无团队预留份额</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span><strong className="text-white">无私募预售：</strong>拒绝内部人利益，保证社区主导权</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span><strong className="text-white">透明公开：</strong>所有分配过程完全透明，可在区块链上验证</span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Zap className="mr-3 text-blue-400" size={24} />
                  交易机制
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-blue-400 mr-2">⚡</span>
                    <span><strong className="text-white">零交易税：</strong>买卖无任何手续费，纯净交易体验</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-400 mr-2">⚡</span>
                    <span><strong className="text-white">无通胀机制：</strong>总量固定，不会增发稀释持有者权益</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-400 mr-2">⚡</span>
                    <span><strong className="text-white">社区驱动：</strong>完全由社区自主发展，无中心化控制</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 流动性与安全 */}
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <DollarSign className="mr-3 text-purple-400" size={24} />
                  初始流动性来源
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-purple-400 mr-2">💧</span>
                    <span><strong className="text-white">PancakeSwap池：</strong>开发团队自筹资金建立YES-BNB流动性池</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-purple-400 mr-2">🔒</span>
                    <span><strong className="text-white">流动性锁定：</strong>LP代币已锁定，确保交易安全稳定</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-purple-400 mr-2">🛡️</span>
                    <span><strong className="text-white">安全保障：</strong>通过DXLock平台锁仓，可公开验证</span>
                  </p>
                </div>
                <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-300">
                    <strong>锁仓证明：</strong> 可在BSCScan查看流动性锁定状态
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Target className="mr-3 text-yellow-400" size={24} />
                  未来发展规划
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-2">🎯</span>
                    <span><strong className="text-white">治理投票：</strong>持有者参与社区重大决策投票</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-2">🎮</span>
                    <span><strong className="text-white">游戏支付：</strong>在生态游戏中作为支付和奖励代币</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-2">🌟</span>
                    <span><strong className="text-white">生态扩展：</strong>逐步构建完整的DeFi生态系统</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 核心优势总结 */}
          <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-xl font-bold mb-4 text-center text-green-400">
              YesCoin 核心优势
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-semibold text-white mb-1">公平发行</h4>
                <p className="text-sm text-gray-300">100%社区分发，无团队预留</p>
              </div>
              <div>
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-semibold text-white mb-1">零手续费</h4>
                <p className="text-sm text-gray-300">买卖无税，纯净交易</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-white mb-1">安全可靠</h4>
                <p className="text-sm text-gray-300">流动性锁定，资金安全</p>
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
            阅读白皮书
          </button>
          
          <button 
            onClick={fetchTokenData}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-['Press_Start_2P'] text-sm px-8 py-4 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />}
            刷新数据
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default TokenInfo
