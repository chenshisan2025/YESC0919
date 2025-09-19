import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqData = [
    {
      question: "什么是 YesCoin？",
      answer: "YesCoin 是一个基于区块链技术的创新数字货币项目，致力于构建去中心化的数字生态系统。我们通过公平分配机制和社区治理，为用户提供安全、透明、高效的数字资产服务。"
    },
    {
      question: "如何购买 YesCoin 代币？",
      answer: "您可以通过以下方式获得 YesCoin 代币：1) 参与我们的空投活动，完成指定任务即可免费获得；2) 铸造 Guardian NFT 获得奖励代币；3) 通过推荐好友参与项目获得推荐奖励；4) 在去中心化交易所购买（即将上线）。"
    },
    {
      question: "Guardian NFT 有什么用途？",
      answer: "Guardian NFT 是 YesCoin 生态系统的核心组成部分，持有者享有以下权益：1) 获得代币空投奖励；2) 参与社区治理投票；3) 享受平台手续费折扣；4) 获得独家活动参与资格；5) 未来生态应用的优先体验权。"
    },
    {
      question: "项目的安全性如何保障？",
      answer: "我们采用多重安全措施保障项目安全：1) 智能合约经过专业安全审计；2) 采用多签钱包管理资金；3) 代码开源，接受社区监督；4) 定期进行安全检查和更新；5) 与知名安全公司合作，持续监控潜在风险。"
    },
    {
      question: "代币的总供应量是多少？",
      answer: "YesCoin 总供应量为 10 亿枚，分配方案如下：40% 用于空投奖励，30% 分配给 NFT 持有者，20% 用于流动性挖矿，10% 用于团队开发。所有代币都通过公平机制分发，团队无预挖优势。"
    },
    {
      question: "如何参与社区治理？",
      answer: "持有 YesCoin 代币或 Guardian NFT 的用户都可以参与社区治理：1) 在治理平台提交提案；2) 对社区提案进行投票；3) 参与社区讨论和决策；4) 加入我们的 Discord 和 Telegram 群组；5) 关注官方社交媒体获取最新治理信息。"
    },
    {
      question: "项目的发展路线图是什么？",
      answer: "我们的发展路线图包括：Q1 2024 - 完成智能合约开发和审计；Q2 2024 - 启动 NFT 铸造和空投活动；Q3 2024 - 上线去中心化交易所；Q4 2024 - 推出治理平台和生态应用；2025 年 - 扩展更多区块链网络和合作伙伴。"
    },
    {
      question: "如何联系团队或获得技术支持？",
      answer: "您可以通过以下方式联系我们：1) 官方网站：yescoin.site；2) Telegram 群组：@YesCoinOfficial；3) Discord 服务器：discord.gg/yescoin；4) Twitter：@YesCoinProject；5) 邮箱：support@yescoin.site。我们的团队会及时回复您的问题。"
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="font-press text-2xl text-brown mb-4">
          常见问题
        </h1>
        <p className="font-pixel text-brown/80 max-w-3xl mx-auto leading-relaxed">
          关于 YesCoin 项目的常见问题解答，帮助您更好地了解我们的愿景和技术。
        </p>
      </motion.div>

      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1 * index,
              type: "spring",
              stiffness: 100
            }}
            className="pixel-faq-item"
          >
            <motion.button 
              onClick={() => toggleFAQ(index)}
              className="pixel-faq-header"
              whileHover={{ 
                scale: 1.02,
                boxShadow: '3px 3px 0px #2D2520'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <h3 className="font-pixel text-brown pr-4">
                {faq.question}
              </h3>
              <motion.div
                animate={{ 
                  rotate: openIndex === index ? 45 : 0,
                  scale: openIndex === index ? 1.1 : 1
                }}
                transition={{ 
                  duration: 0.3,
                  type: "spring",
                  stiffness: 200
                }}
                className="flex-shrink-0"
              >
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-magenta" />
                ) : (
                  <Plus className="w-5 h-5 text-gold" />
                )}
              </motion.div>
            </motion.button>
            
            <AnimatePresence mode="wait">
              {openIndex === index && (
                <motion.div
                  initial={{ 
                    height: 0, 
                    opacity: 0,
                    y: -10
                  }}
                  animate={{ 
                    height: "auto", 
                    opacity: 1,
                    y: 0
                  }}
                  exit={{ 
                    height: 0, 
                    opacity: 0,
                    y: -10
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: [0.04, 0.62, 0.23, 0.98],
                    opacity: { duration: 0.3 }
                  }}
                  className="overflow-hidden pixel-faq-content"
                >
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.1,
                      ease: "easeOut"
                    }}
                    className="p-4"
                  >
                    <p className="font-pixel text-sm text-brown/90 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default FAQ
