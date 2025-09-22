import { useWeb3 } from '../contexts/Web3Context'
import { useTranslation } from 'react-i18next'

const WalletMobile = () => {
  const { t } = useTranslation()
  const { 
    isConnected, 
    isConnecting, 
    address, 
    formattedAddress, 
    connectMetaMask, 
    connectWalletConnect, 
    disconnect, 
    error 
  } = useWeb3()

  return (
    <div className="p-4">
      {!isConnected ? (
        <div className="space-y-2">
          <button 
            onClick={connectMetaMask}
            disabled={isConnecting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-black px-4 py-2 rounded-lg font-press text-sm transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            {isConnecting ? t('common.connecting') : 'MetaMask'}
          </button>
          <button 
            onClick={connectWalletConnect}
            disabled={isConnecting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-press text-sm transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            {isConnecting ? t('common.connecting') : 'WalletConnect'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-full bg-yellow-400 text-black px-4 py-2 rounded-lg font-press text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
            {formattedAddress}
          </div>
          <button 
            onClick={disconnect}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-press text-sm transition-colors border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
          >
            {t('common.disconnectWallet')}
          </button>
        </div>
      )}
      {error && (
        <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

export default WalletMobile