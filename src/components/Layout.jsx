import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useWeb3 } from '../contexts/Web3Context'
import logo from '../assets/logo.svg'
import twitter from '../assets/twitter.svg'
import telegram from '../assets/telegram.svg'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg text-brown font-pixel">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 pb-16">{children}</main>
      <Footer />
    </div>
  )
}

function Header() {
  const { t, i18n } = useTranslation()
  const { 
    isConnected, 
    address, 
    formattedAddress, 
    connectMetaMask, 
    connectWalletConnect, 
    disconnect, 
    isConnecting,
    error 
  } = useWeb3()
  const [mobileOpen, setMobileOpen] = useState(false)

  // 语言切换功能和持久化
  const currentLang = i18n.language
  const toggleLanguage = () => {
    const newLang = currentLang === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(newLang)
    localStorage.setItem('language', newLang)
  }

  // 页面加载时恢复用户选择的语言
  useEffect(() => {
    const savedLang = localStorage.getItem('language')
    if (savedLang && savedLang !== currentLang) {
      i18n.changeLanguage(savedLang)
    }
  }, [])

  const WalletBtn = () => {
    if (isConnecting) {
      return (
        <button className="pixel-button-primary" disabled>
          {t('common.connecting')}
        </button>
      )
    }
    
    return isConnected ? (
      <div className="flex items-center gap-2">
        <div className="pixel-card bg-gold text-brown px-4 py-2 font-pixel text-sm">
          {formattedAddress}
        </div>
        <button 
          onClick={disconnect}
          className="pixel-button bg-red-500 hover:bg-red-600 text-white px-3 py-2 font-pixel text-sm"
        >
          {t('common.disconnect')}
        </button>
      </div>
    ) : (
      <button className="pixel-button-primary" onClick={connectMetaMask}>
        {t('common.connectWallet')}
      </button>
    )
  }

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-bg/95 border-b-2 border-brown">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-8 h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="YesCoin" className="w-10 h-10" />
          <span className="font-press text-lg text-yellow-400">YesCoin</span>
        </Link>

        <nav className="hidden md:flex gap-6 font-press text-xs">
          <NavLink className="pixel-nav-link" to="/">{t('nav.home')}</NavLink>
          <NavLink className="pixel-nav-link" to="/token">{t('nav.tokenInfo')}</NavLink>
          <NavLink className="pixel-nav-link" to="/nft">{t('nav.nft')}</NavLink>
          <NavLink className="pixel-nav-link" to="/airdrop">{t('nav.airdrop')}</NavLink>
          <NavLink className="pixel-nav-link" to="/faq">{t('nav.faq')}</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button className="pixel-button-secondary" onClick={toggleLanguage}>
            {currentLang === 'zh' ? '中文' : 'EN'}
          </button>
          <a className="pixel-button-secondary" target="_blank" href="https://pancakeswap.finance" rel="noreferrer">{t('common.buyYes')}</a>
          <WalletBtn />
        </div>

        <button className="md:hidden pixel-button-secondary" onClick={() => setMobileOpen(v=>!v)} aria-label="menu">
          {t('common.menu')}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t-2 border-brown bg-bg px-4 py-3 space-y-3">
          <div className="flex flex-col gap-2 font-press text-xs">
            <NavLink className="pixel-nav-link" to="/" onClick={()=>setMobileOpen(false)}>{t('nav.home')}</NavLink>
            <NavLink className="pixel-nav-link" to="/token" onClick={()=>setMobileOpen(false)}>{t('nav.tokenInfo')}</NavLink>
            <NavLink className="pixel-nav-link" to="/nft" onClick={()=>setMobileOpen(false)}>{t('nav.nft')}</NavLink>
            <NavLink className="pixel-nav-link" to="/airdrop" onClick={()=>setMobileOpen(false)}>{t('nav.airdrop')}</NavLink>
            <NavLink className="pixel-nav-link" to="/faq" onClick={()=>setMobileOpen(false)}>{t('nav.faq')}</NavLink>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <a className="pixel-button-secondary w-full text-center" target="_blank" href="https://pancakeswap.finance" rel="noreferrer">{t('common.buyYes')}</a>
            <WalletMobile />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button className="pixel-button-secondary" onClick={toggleLanguage}>
              {currentLang === 'zh' ? '中文' : 'EN'}
            </button>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><img className="w-5 h-5" src={twitter} alt="Twitter"/></a>
            <a href="https://t.me" target="_blank" rel="noreferrer"><img className="w-5 h-5" src={telegram} alt="Telegram"/></a>
          </div>
        </div>
      )}
    </header>
  )
}

function WalletMobile() {
  const { t } = useTranslation()
  const { 
    isConnected, 
    address, 
    formattedAddress, 
    connectMetaMask, 
    disconnect, 
    isConnecting,
    error 
  } = useWeb3()
  
  if (isConnecting) {
    return (
      <button className="pixel-button-primary w-full" disabled>
        {t('common.connecting')}
      </button>
    )
  }
  
  return isConnected ? (
    <div className="flex flex-col gap-2 w-full">
      <div className="pixel-card bg-gold text-brown px-4 py-2 font-pixel text-sm text-center">
        {formattedAddress}
      </div>
      <button 
        onClick={disconnect}
        className="pixel-button bg-red-500 hover:bg-red-600 text-white px-3 py-2 font-pixel text-sm"
      >
        {t('common.disconnectWallet')}
      </button>
      {error && (
        <div className="pixel-card bg-red-100 border border-red-400 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  ) : (
    <button className="pixel-button-primary w-full" onClick={connectMetaMask}>
      {t('common.connectWallet')}
    </button>
  )
}

function Footer() {
  return (
    <footer className="border-t-2 border-brown bg-card/70 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="pixel-badge bg-gold text-brown">
            <img src={twitter} alt="Twitter" className="w-4 h-4 inline-block mr-1" />Twitter
          </a>
          <a href="https://t.me" target="_blank" rel="noreferrer" className="pixel-badge bg-gold text-brown">
            <img src={telegram} alt="Telegram" className="w-4 h-4 inline-block mr-1" />Telegram
          </a>
        </div>
        <p className="text-sm font-pixel text-brown">&copy; 2025 YesCoin Community</p>
      </div>
    </footer>
  )
}
