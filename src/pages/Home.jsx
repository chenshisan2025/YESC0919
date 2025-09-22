import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import teamDon from '../assets/team-don.svg'
import teamKnight from '../assets/team-knight.svg'
import teamGuard from '../assets/team-guard.svg'
import teamHorn from '../assets/team-horn.svg'









export default function Home() {
  const { t } = useTranslation()

  const stats = [
    { label: t('home.stats.holders'), value: '12,345' },
    { label: t('home.stats.marketCap'), value: '$12.3M' },
    { label: t('home.stats.nftMinted'), value: '5,678' },
    { label: t('home.stats.airdropParticipants'), value: '23,456' },
  ]

  const features = [
    { title: t('home.features.fairLaunch.title'), desc: t('home.features.fairLaunch.desc') },
    { title: t('home.features.pureMeme.title'), desc: t('home.features.pureMeme.desc') },
    { title: t('home.features.pixelStyle.title'), desc: t('home.features.pixelStyle.desc') },
    { title: t('home.features.communityDriven.title'), desc: t('home.features.communityDriven.desc') },
  ]

  const roadmap = [
    { time: '2025 Q4', icon: '🚀', text: t('home.roadmap.q4_2025'), current: true },
    { time: '2026 Q1', icon: '📈', text: t('home.roadmap.q1_2026'), current: false },
    { time: '2026 Q2', icon: '🎮', text: t('home.roadmap.q2_2026'), current: false },
    { time: '2026 H2', icon: '🏛️', text: t('home.roadmap.h2_2026'), current: false },
  ]

  const team = [
    { img: teamDon, name: t('home.team.don.name'), role: t('home.team.don.role') },
    { img: teamKnight, name: t('home.team.knight.name'), role: t('home.team.knight.role') },
    { img: teamGuard, name: t('home.team.guard.name'), role: t('home.team.guard.role') },
    { img: teamHorn, name: t('home.team.horn.name'), role: t('home.team.horn.role') },
  ]
  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.section 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl mb-4 text-brown">{t('home.hero.title')}</h1>
        <p className="text-lg md:text-xl text-brown/80 mb-8 font-pixel">
          {t('home.hero.subtitle')}<br/>
          {t('home.hero.tagline')}<br/><br/>
          {t('home.hero.description')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/airdrop" className="pixel-button-primary">{t('home.hero.cta')}</Link>
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
        <h2 className="font-pixel text-xl text-center mb-6 text-brown">{t('home.features.title')}</h2>
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
        <h2 className="font-pixel text-xl text-center mb-6 text-brown">{t('home.roadmap.title')}</h2>
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
              {r.current && <div className="mt-2 text-xs pixel-badge bg-gold text-brown">{t('home.roadmap.currentStage')}</div>}
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
        <h2 className="font-pixel text-xl text-center mb-6 text-brown">{t('home.team.title')}</h2>
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
          <h2 className="font-pixel text-xl mb-4 text-brown">{t('home.cta.title')}</h2>
          <p className="mb-6 text-brown/80 font-pixel">{t('home.cta.description')}</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/nft" className="pixel-button-primary">{t('home.cta.button')}</Link>
          </motion.div>
        </motion.div>
      </motion.section>
    </div>
  )
}
