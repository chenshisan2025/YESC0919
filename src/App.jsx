import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TokenInfo from './pages/TokenInfo'
import NFT from './pages/NFT'
import Airdrop from './pages/Airdrop'
import FAQ from './pages/FAQ'
import { Web3Provider as Web3ModalProvider } from './components/Web3Provider'
import { Web3Provider } from './contexts/Web3Context'
import './i18n'

function App() {
  return (
    <Web3ModalProvider>
      <Web3Provider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/token" element={<TokenInfo />} />
            <Route path="/nft" element={<NFT />} />
            <Route path="/airdrop" element={<Airdrop />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </Layout>
      </Web3Provider>
    </Web3ModalProvider>
  )
}

export default App
