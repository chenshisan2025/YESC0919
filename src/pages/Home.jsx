import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import teamDon from '../assets/team-don.svg'
import teamKnight from '../assets/team-knight.svg'
import teamGuard from '../assets/team-guard.svg'
import teamHorn from '../assets/team-horn.svg'

const stats = [
  { label: '持币地址数', value: '12,345' },
  { label: '当前市值', value: '$12.3M' },
  { label: '已铸造NFT', value: '5,678' },
  { label: '空投参与人数', value: '23,456' },
]

const features = [
  { title: '公平发射', desc: '100% 面向社区，无私募与团队预留。' },
  { title: '纯粹 MEME', desc: '社区文化驱动，梗力十足。' },
  { title: '像素情怀', desc: '8-bit 复古像素风致敬经典。' },
  { title: '社群驱动', desc: '提案共识，协力共建。' },
]

const roadmap = [
  { time: '2025 Q4', icon: '🚀', text: 'YesCoin 上线 & Guardian NFT 发布', current: true },
  { time: '2026 Q1', icon: '📈', text: '登录 CMC / CG', current: false },
  { time: '2026 Q2', icon: '🎮', text: 'Guardian NFT 交易市场上线', current: false },
  { time: '2026 H2', icon: '🏛️', text: '探索 DAO 治理模型', current: false },
]

const team = [
  { img: teamDon, name: 'Yes教父', role: '幕后策划 / 社区教父' },
  { img: teamKnight, name: 'Pixel骑士', role: '像素艺术 / 设计' },
  { img: teamGuard, name: '链上护卫', role: '合约与安全' },
  { img: teamHorn, name: 'Yes喇叭', role: '社区与传播' },
]

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.section 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl mb-4 text-brown">YesCoin Web3 宇宙</h1>
        <p className="text-lg md:text-xl text-brown/80 mb-8 font-pixel">
          拥抱下一个百万倍迷因传奇！<br/>
          100% 公平发射 · 社区驱动 · 像素复古风 Meme 币<br/><br/>
          YesCoin 是一个诞生于 BSC 链的全新 Meme 宇宙。在这里，没有预售、没有团队特权，每一枚代币都公平发放给社区！YesCoin 旨在用幽默和创造力将加密爱好者聚集在一起。拿起你的 YesCoin，一起对平庸说"不"，对未来大声说"YES"！
        </p>
        <div className="flex items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/airdrop" className="pixel-button-primary">立即加入 YES 革命！</Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, index) => (
            <motion.div 
              key={s.label} 
              className="pixel-card p-5 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-sm text-brown/70 font-pixel">{s.label}</div>
              <div className="mt-2 text-2xl font-pixel text-orange">{s.value}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="font-pixel text-xl text-center mb-6 text-brown">为什么选择 YesCoin?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, index) => (
            <motion.div 
              key={f.title} 
              className="pixel-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="font-pixel text-sm mb-2 text-brown">{f.title}</div>
              <p className="text-brown/80 font-pixel text-xs">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Roadmap */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <h2 className="font-pixel text-xl text-center mb-6 text-brown">路线图 · 星际探索</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {roadmap.map((r, index) => (
            <motion.div 
              key={r.time} 
              className={"pixel-card p-5 text-center " + (r.current ? "ring-4 ring-gold" : "")}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl">{r.icon}</div>
              <div className="font-pixel text-sm mt-2 text-brown">{r.time}</div>
              <div className="mt-2 text-brown/80 font-pixel text-xs">{r.text}</div>
              {r.current && <div className="mt-2 text-xs pixel-badge bg-gold text-brown">当前阶段</div>}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Team */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <h2 className="font-pixel text-xl text-center mb-6 text-brown">核心团队 · 传奇战士</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.map((t, index) => (
            <motion.div 
              key={t.name} 
              className="pixel-card p-5 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.img 
                src={t.img} 
                alt={t.name} 
                className="w-16 h-16 mx-auto mb-3 pixel-image" 
                whileHover={{ scale: 1.1 }}
              />
              <div className="font-pixel text-sm text-brown">{t.name}</div>
              <div className="text-xs text-brown/70 mt-1 font-pixel">{t.role}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Final CTA Banner */}
      <motion.section 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <motion.div 
          className="pixel-card p-8"
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="font-pixel text-xl mb-4 text-brown">准备好了吗？</h2>
          <p className="mb-6 text-brown/80 font-pixel">加入 YesCoin 宇宙，开启你的 Web3 冒险之旅！</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/nft" className="pixel-button-primary">立即铸造 NFT</Link>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  )
}
