import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useAccount, useConnect, useDisconnect, useWalletClient } from 'wagmi'
import { walletConnect, metaMask } from 'wagmi/connectors'

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  // Initialize Web3 provider and signer when wallet is connected
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        if (isConnected && walletClient) {
          // Create ethers provider from wagmi wallet client
          const ethersProvider = new ethers.BrowserProvider(walletClient)
          const ethersSigner = await ethersProvider.getSigner()
          
          setProvider(ethersProvider)
          setSigner(ethersSigner)
          setIsInitialized(true)
          setError(null)
          
          console.log('Web3 initialized successfully:', {
            address,
            chainId: chain?.id,
            chainName: chain?.name
          })
        } else {
          // Reset when disconnected
          setProvider(null)
          setSigner(null)
          setIsInitialized(false)
        }
      } catch (err) {
        console.error('Failed to initialize Web3:', err)
        setError(err.message)
        setIsInitialized(false)
      }
    }

    initializeWeb3()
  }, [isConnected, walletClient, address, chain])

  // Connect to MetaMask
  const connectMetaMask = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      const metaMaskConnector = connectors.find(c => c.id === 'metaMask')
      if (metaMaskConnector) {
        await connect({ connector: metaMaskConnector })
      } else {
        throw new Error('MetaMask connector not found')
      }
    } catch (err) {
      console.error('Failed to connect MetaMask:', err)
      setError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  // Connect to WalletConnect
  const connectWalletConnect = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      const wcConnector = connectors.find(c => c.id === 'walletConnect')
      if (wcConnector) {
        await connect({ connector: wcConnector })
      } else {
        throw new Error('WalletConnect connector not found')
      }
    } catch (err) {
      console.error('Failed to connect WalletConnect:', err)
      setError(err.message)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      await disconnect()
      setProvider(null)
      setSigner(null)
      setIsInitialized(false)
      setError(null)
    } catch (err) {
      console.error('Failed to disconnect:', err)
      setError(err.message)
    }
  }

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Get network info
  const getNetworkInfo = () => {
    return {
      chainId: chain?.id,
      chainName: chain?.name,
      isSupported: chain?.id === 56 || chain?.id === 97 // BSC mainnet or testnet
    }
  }

  // Contract interaction helper
  const getContract = (contractAddress, abi) => {
    if (!signer || !contractAddress || !abi) {
      throw new Error('Signer, contract address, and ABI are required')
    }
    return new ethers.Contract(contractAddress, abi, signer)
  }

  // Send transaction helper
  const sendTransaction = async (to, value = '0', data = '0x') => {
    if (!signer) {
      throw new Error('Wallet not connected')
    }
    
    const tx = {
      to,
      value: ethers.parseEther(value.toString()),
      data
    }
    
    return await signer.sendTransaction(tx)
  }

  const value = {
    // Connection state
    isConnected,
    isConnecting,
    isInitialized,
    address,
    formattedAddress: formatAddress(address),
    
    // Web3 objects
    provider,
    signer,
    
    // Network info
    chain,
    networkInfo: getNetworkInfo(),
    
    // Connection methods
    connectMetaMask,
    connectWalletConnect,
    disconnect: disconnectWallet,
    
    // Utility methods
    formatAddress,
    getContract,
    sendTransaction,
    
    // Error state
    error,
    clearError: () => setError(null)
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
}

export default Web3Provider