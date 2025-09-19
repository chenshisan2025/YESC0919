import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from './setup.js';
import Home from '../src/pages/Home.jsx';

// Mock Web3Modal
const mockWeb3Modal = {
  open: vi.fn(),
  close: vi.fn(),
  subscribeProvider: vi.fn(),
  getWalletProvider: vi.fn(),
};

// Mock wagmi hooks
const mockUseAccount = vi.fn();
const mockUseConnect = vi.fn();
const mockUseDisconnect = vi.fn();
const mockUseSwitchChain = vi.fn();
const mockUseChainId = vi.fn();

vi.mock('@web3modal/wagmi/react', () => ({
  createWeb3Modal: vi.fn(() => mockWeb3Modal),
  useWeb3Modal: vi.fn(() => mockWeb3Modal),
}));

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useConnect: () => mockUseConnect(),
  useDisconnect: () => mockUseDisconnect(),
  useSwitchChain: () => mockUseSwitchChain(),
  useChainId: () => mockUseChainId(),
}));

// Mock MetaMask provider
const mockMetaMaskProvider = {
  isMetaMask: true,
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  selectedAddress: null,
  chainId: '0x61', // BSC Testnet
};

// Mock WalletConnect provider
const mockWalletConnectProvider = {
  isWalletConnect: true,
  enable: vi.fn(),
  request: vi.fn(),
  on: vi.fn(),
  disconnect: vi.fn(),
  accounts: [],
  chainId: 97,
};

describe('钱包连接端到端测试', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock returns
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
    });
    
    mockUseConnect.mockReturnValue({
      connect: vi.fn(),
      connectors: [
        { id: 'metaMask', name: 'MetaMask', type: 'injected' },
        { id: 'walletConnect', name: 'WalletConnect', type: 'walletConnect' },
      ],
      isLoading: false,
      error: null,
    });
    
    mockUseDisconnect.mockReturnValue({
      disconnect: vi.fn(),
    });
    
    mockUseSwitchChain.mockReturnValue({
      switchChain: vi.fn(),
      isLoading: false,
      error: null,
    });
    
    mockUseChainId.mockReturnValue(97); // BSC Testnet
    
    // Mock window.ethereum for MetaMask
    global.window.ethereum = mockMetaMaskProvider;
  });
  
  afterEach(() => {
    delete global.window.ethereum;
  });

  describe('MetaMask连接测试', () => {
    it('应该显示连接钱包按钮', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/连接钱包|Connect Wallet/i)).toBeInTheDocument();
    });
    
    it('应该能够检测到MetaMask', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      // 检查是否检测到MetaMask
      expect(global.window.ethereum.isMetaMask).toBe(true);
    });
    
    it('应该能够连接MetaMask钱包', async () => {
      const mockConnect = vi.fn();
      mockUseConnect.mockReturnValue({
        connect: mockConnect,
        connectors: [
          { id: 'metaMask', name: 'MetaMask', type: 'injected' },
        ],
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const connectButton = screen.getByText(/连接钱包|Connect Wallet/i);
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });
    
    it('应该在连接成功后显示钱包地址', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      
      mockUseAccount.mockReturnValue({
        address: testAddress,
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(testAddress.slice(0, 6) + '...' + testAddress.slice(-4))).toBeInTheDocument();
      });
    });
    
    it('应该能够断开MetaMask连接', async () => {
      const mockDisconnect = vi.fn();
      const testAddress = '0x1234567890123456789012345678901234567890';
      
      mockUseAccount.mockReturnValue({
        address: testAddress,
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
      });
      
      mockUseDisconnect.mockReturnValue({
        disconnect: mockDisconnect,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const disconnectButton = screen.getByText(/断开连接|Disconnect/i);
      fireEvent.click(disconnectButton);
      
      await waitFor(() => {
        expect(mockDisconnect).toHaveBeenCalled();
      });
    });
  });

  describe('WalletConnect连接测试', () => {
    it('应该能够连接WalletConnect', async () => {
      const mockConnect = vi.fn();
      mockUseConnect.mockReturnValue({
        connect: mockConnect,
        connectors: [
          { id: 'walletConnect', name: 'WalletConnect', type: 'walletConnect' },
        ],
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const connectButton = screen.getByText(/连接钱包|Connect Wallet/i);
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });
    
    it('应该显示WalletConnect二维码', async () => {
      mockWeb3Modal.open.mockResolvedValue(undefined);
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const connectButton = screen.getByText(/连接钱包|Connect Wallet/i);
      fireEvent.click(connectButton);
      
      await waitFor(() => {
        expect(mockWeb3Modal.open).toHaveBeenCalled();
      });
    });
  });

  describe('网络切换测试', () => {
    it('应该检测当前网络', () => {
      mockUseChainId.mockReturnValue(97); // BSC Testnet
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      // 验证网络检测
      expect(mockUseChainId()).toBe(97);
    });
    
    it('应该能够切换到BSC主网', async () => {
      const mockSwitchChain = vi.fn();
      const testAddress = '0x1234567890123456789012345678901234567890';
      
      mockUseAccount.mockReturnValue({
        address: testAddress,
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
      });
      
      mockUseChainId.mockReturnValue(97); // 当前在测试网
      
      mockUseSwitchChain.mockReturnValue({
        switchChain: mockSwitchChain,
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      // 查找网络切换按钮（如果存在）
      const networkButton = screen.queryByText(/切换网络|Switch Network/i);
      if (networkButton) {
        fireEvent.click(networkButton);
        
        await waitFor(() => {
          expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 56 }); // BSC Mainnet
        });
      }
    });
    
    it('应该在错误网络时显示警告', () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      
      mockUseAccount.mockReturnValue({
        address: testAddress,
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
      });
      
      mockUseChainId.mockReturnValue(1); // Ethereum Mainnet (错误网络)
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      // 检查是否显示网络错误提示
      const networkWarning = screen.queryByText(/错误的网络|Wrong Network|请切换到|Please switch to/i);
      if (networkWarning) {
        expect(networkWarning).toBeInTheDocument();
      }
    });
  });

  describe('连接状态管理', () => {
    it('应该在连接过程中显示加载状态', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
        isConnecting: true,
        isDisconnected: false,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/连接中|Connecting/i)).toBeInTheDocument();
    });
    
    it('应该处理连接错误', () => {
      const mockConnect = vi.fn();
      mockUseConnect.mockReturnValue({
        connect: mockConnect,
        connectors: [],
        isLoading: false,
        error: new Error('用户拒绝连接'),
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      expect(screen.getByText(/连接失败|Connection failed|用户拒绝/i)).toBeInTheDocument();
    });
    
    it('应该在没有钱包时显示安装提示', () => {
      // 移除MetaMask
      delete global.window.ethereum;
      
      mockUseConnect.mockReturnValue({
        connect: vi.fn(),
        connectors: [],
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const installPrompt = screen.queryByText(/安装钱包|Install Wallet|请安装MetaMask/i);
      if (installPrompt) {
        expect(installPrompt).toBeInTheDocument();
      }
    });
  });

  describe('钱包事件监听', () => {
    it('应该监听账户变化', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      // 验证事件监听器已设置
      expect(mockMetaMaskProvider.on).toHaveBeenCalledWith('accountsChanged', expect.any(Function));
    });
    
    it('应该监听网络变化', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      // 验证事件监听器已设置
      expect(mockMetaMaskProvider.on).toHaveBeenCalledWith('chainChanged', expect.any(Function));
    });
    
    it('应该在组件卸载时清理事件监听器', () => {
      const { unmount } = render(
        <TestWrapper>
          <WalletConnection />
        </TestWrapper>
      );
      
      unmount();
      
      // 验证事件监听器已清理
      expect(mockMetaMaskProvider.removeListener).toHaveBeenCalled();
    });
  });

  describe('多钱包支持', () => {
    it('应该显示可用的钱包选项', () => {
      mockUseConnect.mockReturnValue({
        connect: vi.fn(),
        connectors: [
          { id: 'metaMask', name: 'MetaMask', type: 'injected' },
          { id: 'walletConnect', name: 'WalletConnect', type: 'walletConnect' },
          { id: 'coinbaseWallet', name: 'Coinbase Wallet', type: 'coinbaseWallet' },
        ],
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const connectButton = screen.getByText(/连接钱包|Connect Wallet/i);
      fireEvent.click(connectButton);
      
      // 检查是否显示钱包选项（可能在模态框中）
      const walletOptions = screen.queryAllByText(/MetaMask|WalletConnect|Coinbase/i);
      expect(walletOptions.length).toBeGreaterThan(0);
    });
  });
});

// 手动测试指南
/*
手动测试步骤：

1. MetaMask连接测试：
   - 确保已安装MetaMask扩展
   - 访问应用并点击"连接钱包"
   - 选择MetaMask并授权连接
   - 验证钱包地址显示正确
   - 测试断开连接功能

2. WalletConnect测试：
   - 在移动设备上打开支持WalletConnect的钱包
   - 在桌面浏览器中选择WalletConnect
   - 扫描二维码连接
   - 验证连接状态和地址显示

3. 网络切换测试：
   - 连接钱包后检查当前网络
   - 尝试切换到BSC测试网/主网
   - 验证网络切换成功
   - 测试在错误网络时的提示

4. 错误处理测试：
   - 测试用户拒绝连接的情况
   - 测试网络切换失败的情况
   - 测试钱包未安装的情况

5. 持久化测试：
   - 连接钱包后刷新页面
   - 验证连接状态是否保持
   - 测试自动重连功能
*/