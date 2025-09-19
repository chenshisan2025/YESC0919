// NEW - 钱包连接测试页面
import { useWallet } from '../contexts/WalletContext'

function WalletTest() {
  const { 
    isConnected, 
    address, 
    account, 
    connect, 
    disconnect, 
    isConnecting,
    authError,
    user,
    isAuthenticated,
    isAuthenticating
  } = useWallet()

  const handleConnect = () => {
    console.log('测试页面：点击连接钱包按钮')
    connect()
  }

  const handleDisconnect = () => {
    console.log('测试页面：点击断开连接按钮')
    disconnect()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">钱包连接测试</h1>
        
        <div className="pixel-card bg-white p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">钱包状态</h2>
          <div className="space-y-2 text-sm">
            <p><strong>连接状态:</strong> {isConnected ? '已连接' : '未连接'}</p>
            <p><strong>连接中:</strong> {isConnecting ? '是' : '否'}</p>
            <p><strong>钱包地址:</strong> {address || '无'}</p>
            <p><strong>格式化地址:</strong> {account || '无'}</p>
            <p><strong>认证状态:</strong> {isAuthenticated ? '已认证' : '未认证'}</p>
            <p><strong>认证中:</strong> {isAuthenticating ? '是' : '否'}</p>
            <p><strong>用户信息:</strong> {user ? JSON.stringify(user) : '无'}</p>
            {authError && (
              <p className="text-red-600"><strong>错误:</strong> {authError}</p>
            )}
          </div>
        </div>

        <div className="pixel-card bg-white p-6">
          <h2 className="text-xl font-bold mb-4">操作按钮</h2>
          <div className="flex gap-4">
            {isConnected ? (
              <button 
                className="pixel-button-secondary"
                onClick={handleDisconnect}
                disabled={isConnecting}
              >
                断开连接
              </button>
            ) : (
              <button 
                className="pixel-button-primary"
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? '连接中...' : '连接钱包'}
              </button>
            )}
          </div>
        </div>

        <div className="pixel-card bg-yellow-50 p-4 mt-6">
          <h3 className="font-bold mb-2">调试说明</h3>
          <p className="text-sm text-gray-600">
            请打开浏览器开发者工具的控制台查看详细日志。点击连接钱包按钮时，
            应该会看到相关的调试信息输出。
          </p>
        </div>
      </div>
    </div>
  )
}

export default WalletTest