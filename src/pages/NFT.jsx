import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWeb3 } from '../contexts/Web3Context'
import { toast } from 'sonner'

const NFT = () => {
  const { isConnected, address, provider, connectMetaMask } = useWeb3()
  const [totalMinted, setTotalMinted] = useState(0)
  const [isMinting, setIsMinting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [referralCount, setReferralCount] = useState(0)
  const maxSupply = 55315
  const mintPrice = 0.01
  const progress = (totalMinted / maxSupply) * 100

  // 获取合约实例
  const getContract = () => {
    if (!provider) return null
    // 这里应该返回实际的合约实例
    return null
  }

  // 加载合约数据
  const loadContractData = async () => {
    try {
      const contract = getContract()
      if (contract) {
        // 获取已铸造数量
        // const minted = await contract.methods.totalSupply().call()
        // setTotalMinted(parseInt(minted))
        
        // 模拟数据
        setTotalMinted(Math.floor(Math.random() * 1000) + 500)
      }
    } catch (error) {
      console.error('加载合约数据失败:', error)
    }
  }

  // 生成邀请链接
  const generateInviteLink = () => {
    if (address) {
       const link = `${window.location.origin}/nft?ref=${address}`
      setInviteLink(link)
    }
  }

  // 处理铸造
  const handleMint = async () => {
    if (!isConnected) {
      await connectMetaMask()
      return
    }

    setIsMinting(true)
    try {
      const contract = getContract()
      if (contract) {
        // 实际铸造逻辑
        // await contract.methods.mint().send({
        //   from: account,
        //   value: web3.utils.toWei(mintPrice.toString(), 'ether')
        // })
        
        // 模拟铸造
        await new Promise(resolve => setTimeout(resolve, 2000))
        toast.success('NFT 铸造成功！')
        loadContractData()
      }
    } catch (error) {
      console.error('铸造失败:', error)
      toast.error('铸造失败，请重试')
    } finally {
      setIsMinting(false)
    }
  }

  // 复制邀请链接
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('邀请链接已复制到剪贴板')
  }

  useEffect(() => {
    loadContractData()
  }, [provider])

  useEffect(() => {
    generateInviteLink()
  }, [address])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4 space-y-8">
      {/* NFT系列介绍 */}
      <section className="pixel-card p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-400/30">
        <motion.h1 
          className="font-press text-2xl mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          🛡️ YesCoin Guardian NFT 系列
        </motion.h1>
        
        <motion.div 
          className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-400/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg leading-relaxed text-gray-200 mb-4">
            <span className="text-yellow-400 font-bold">YesCoin Guardian</span> 是 YesCoin 宇宙的限量NFT系列，总计 <span className="text-cyan-400 font-bold">{maxSupply.toLocaleString()}</span> 个。每一枚 Guardian 都是精心设计的像素形象，灵感源自科幻和经典游戏——有的威武如银河战士，有的诙谐似太空冒险者。
          </p>
          <p className="text-gray-300">
            Guardian NFT 不仅是收藏品，更代表了 <span className="text-yellow-400 font-bold">YesCoin 社区的荣耀勋章</span>！每个持有者都将成为 YesCoin 生态的核心建设者，享受专属权益和无限可能。
          </p>
        </motion.div>
      </section>



      {/* NFT铸造区域 */}
      <section className="pixel-card p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-400/30">
        {/* 顶部四张图片展示区域 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-press text-lg mb-4 text-center text-purple-300">🌌 Guardian 宇宙系列预览</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              className="aspect-square bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg p-2 border border-purple-400/30"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=8-bit%20pixel%20art%20astronaut%20character%2C%20white%20spacesuit%20with%20YES%20logo%2C%20blue%20helmet%20visor%2C%20floating%20in%20space%20with%20meteors%20and%20coins%2C%20retro%20gaming%20style%2C%20detailed%20pixel%20sprite%2C%20dark%20space%20background%2C%20neon%20accents&image_size=square_hd"
                alt="Guardian Type 1"
                className="w-full h-full object-cover rounded-lg"
              />
            </motion.div>
            <motion.div 
              className="aspect-square bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-lg p-2 border border-orange-400/30"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=8-bit%20pixel%20art%20astronaut%20character%2C%20orange%20spacesuit%20with%20YES%20logo%2C%20happy%20face%20visible%20through%20helmet%2C%20waving%20hand%2C%20floating%20with%20coins%20and%20asteroids%2C%20retro%20gaming%20style%2C%20detailed%20pixel%20sprite%2C%20dark%20space%20background&image_size=square_hd"
                alt="Guardian Type 2"
                className="w-full h-full object-cover rounded-lg"
              />
            </motion.div>
            <motion.div 
              className="aspect-square bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg p-2 border border-green-400/30"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=8-bit%20pixel%20art%20astronaut%20character%2C%20white%20spacesuit%20with%20YES%20logo%2C%20brown%20skin%20visible%20through%20helmet%2C%20floating%20in%20space%20with%20rockets%20and%20planets%2C%20retro%20gaming%20style%2C%20detailed%20pixel%20sprite%2C%20dark%20space%20background&image_size=square_hd"
                alt="Guardian Type 3"
                className="w-full h-full object-cover rounded-lg"
              />
            </motion.div>
            <motion.div 
              className="aspect-square bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-lg p-2 border border-cyan-400/30"
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=8-bit%20pixel%20art%20space%20scene%2C%20multiple%20astronauts%20floating%2C%20spaceships%20and%20space%20stations%2C%20planets%20and%20meteors%2C%20YES%20coins%20floating%2C%20retro%20gaming%20style%2C%20detailed%20pixel%20art%2C%20cosmic%20background%20with%20stars&image_size=square_hd"
                alt="Guardian Universe"
                className="w-full h-full object-cover rounded-lg"
              />
            </motion.div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">每个 Guardian 都拥有独特的像素形象和稀有属性</p>
        </motion.div>



        {/* 铸造进度和按钮区域 */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.h3 
              className="font-press text-2xl mb-6 text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent"
              animate={{ 
                textShadow: [
                  '0 0 10px rgba(255, 215, 0, 0.5)',
                  '0 0 20px rgba(255, 165, 0, 0.8)',
                  '0 0 10px rgba(255, 215, 0, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
            >
              🎯 铸造进度
            </motion.h3>
            <div className="mb-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-6 border-2 border-purple-400/40">
              <div className="flex justify-between text-lg mb-4">
                <span className="text-gray-200 font-semibold">已铸造</span>
                <motion.span 
                  className="text-yellow-400 font-bold text-xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    color: ['#FBBF24', '#F59E0B', '#FBBF24']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {totalMinted} / {maxSupply}
                </motion.span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden border-2 border-gray-600 shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    scale: { duration: 1.5, repeat: Infinity },
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' }
                  }}
                >
                  🔥
                </motion.div>
              </div>
              <motion.p 
                className="text-center mt-3 text-sm font-semibold"
                animate={{ 
                  color: ['#10B981', '#F59E0B', '#EF4444', '#10B981']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                进度: {progress.toFixed(1)}% 完成
              </motion.p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <motion.div 
                className="text-center bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-400/20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-xs text-gray-400 mb-1">💰 铸造价格</p>
                <p className="font-press text-lg text-green-400">{mintPrice} BNB</p>
              </motion.div>
              <motion.div 
                className="text-center bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-400/20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-xs text-gray-400 mb-1">⏰ 剩余数量</p>
                <p className="font-press text-lg text-orange-400">{maxSupply - totalMinted}</p>
              </motion.div>
            </div>
            
            <motion.button
              onClick={handleMint}
              disabled={isMinting || (isConnected && totalMinted >= maxSupply)}
              className={`w-full py-4 px-6 rounded-lg font-press text-lg transition-all duration-300 ${
                isMinting || totalMinted >= maxSupply
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/25'
              }`}
              whileHover={!isMinting && totalMinted < maxSupply ? { scale: 1.02 } : {}}
              whileTap={!isMinting && totalMinted < maxSupply ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              {isMinting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  铸造中...
                </div>
              ) : !isConnected ? (
                '连接钱包'
              ) : totalMinted >= maxSupply ? (
                '已售罄'
              ) : (
                '🚀 立即铸造 Guardian NFT'
              )}
            </motion.button>
            
            <motion.p 
              className="text-xs text-gray-400 text-center mt-4 bg-blue-900/20 rounded-lg p-3 border border-blue-400/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              💡 每个钱包限制铸造 5 个 NFT &nbsp;|&nbsp; ⚡ 支持 BSC 网络
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 邀请奖励区域 */}
      <section className="pixel-card p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
        <h2 className="font-press text-sm mb-2">邀请好友，同享荣耀 🤑</h2>
        <p className="mb-3">
          通过你的专属邀请链接，好友每成功铸造 1 个 NFT，你将获得 <strong>0.005 BNB</strong> 返佣奖励，以及 <strong>1,000,000 枚 YES 代币</strong> 空投奖励！
        </p>
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <p className="text-yellow-400 font-bold mb-2">推荐奖励：</p>
          <p className="text-green-400">• 每邀请1人：0.005 BNB</p>
          <p className="text-green-400">• 每邀请1人：1,000,000 YES代币</p>
          {isConnected && referralCount > 0 && (
            <p className="text-blue-400 mt-2">• 您已邀请：{referralCount} 人</p>
          )}
        </div>
        
        {isConnected && inviteLink ? (
          <motion.div 
            className="bg-gray-800 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-gray-400 mb-2">您的邀请链接：</p>
            <div className="flex items-center gap-2">
              <input readOnly className="flex-1 bg-gray-700 text-white px-3 py-2 rounded text-sm" value={inviteLink} />
              <motion.button 
                className="pixel-button pixel-button-secondary font-pixel" 
                onClick={copyInviteLink}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '3px 3px 0px #B8651A'
                }}
                whileTap={{ 
                  scale: 0.98,
                  boxShadow: '1px 1px 0px #B8651A'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                复制
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">连接钱包后即可获得专属邀请链接</p>
          </div>
        )}
      </section>

      {/* NFT持有者权益 - 移至页面底部 */}
      <section className="pixel-card p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-400/30">
        <motion.h2 
          className="font-press text-xl mb-6 text-center text-green-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          💎 Guardian 持有者专属权益
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-400/20">
            <h3 className="font-bold text-green-300 mb-3 flex items-center">
              <span className="mr-2">⚡</span>质押挖矿收益加成
            </h3>
            <p className="text-sm text-gray-300">
              持有 Guardian NFT 可享受质押挖矿 <span className="text-yellow-400 font-bold">20% 收益加成</span>，
              让您的 YES 代币获得更高回报。
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-400/20">
            <h3 className="font-bold text-purple-300 mb-3 flex items-center">
              <span className="mr-2">🎁</span>空投任务额外奖励
            </h3>
            <p className="text-sm text-gray-300">
              完成社区空投任务时获得 <span className="text-yellow-400 font-bold">双倍奖励</span>，
              优先参与新项目空投活动。
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-blue-400/20">
            <h3 className="font-bold text-blue-300 mb-3 flex items-center">
              <span className="mr-2">🗳️</span>社区治理投票权
            </h3>
            <p className="text-sm text-gray-300">
              参与 YesCoin 生态重大决策投票，每个 Guardian NFT 拥有 <span className="text-yellow-400 font-bold">10 票投票权</span>，
              共同塑造项目未来。
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-400/20">
            <h3 className="font-bold text-orange-300 mb-3 flex items-center">
              <span className="mr-2">🎪</span>独家活动参与资格
            </h3>
            <p className="text-sm text-gray-300">
              优先参与线上线下独家活动，包括 <span className="text-yellow-400 font-bold">私人 AMA、限量商品抢购、游戏内测</span> 等特殊体验。
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-900/20 rounded-lg p-4 border border-yellow-400/30">
          <p className="text-yellow-300 font-bold text-center mb-2">🌟 持有即享受，权益永久有效！</p>
          <p className="text-sm text-gray-300 text-center">
            Guardian NFT 的所有权益将伴随您的持有期间持续生效，无需额外操作或费用。
          </p>
        </div>
      </section>
    </div>
  )
}

export default NFT
