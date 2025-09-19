import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TokenInfo from './pages/TokenInfo'
import NFT from './pages/NFT'
import Airdrop from './pages/Airdrop'
import FAQ from './pages/FAQ'
import WalletTest from './pages/WalletTest'
import { Web3Provider as Web3ModalProvider } from './components/Web3Provider'
import { WalletProvider } from './contexts/WalletContext'

function App() {
  return (
    <Web3ModalProvider>
      <WalletProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/token" element={<TokenInfo />} />
            <Route path="/nft" element={<NFT />} />
            <Route path="/airdrop" element={<Airdrop />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/wallet-test" element={<WalletTest />} />
          </Routes>
        </Layout>
      </WalletProvider>
    </Web3ModalProvider>
  )
}

export default App
