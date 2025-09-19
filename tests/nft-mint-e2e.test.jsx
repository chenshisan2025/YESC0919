import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from './setup.js';
import NFTMint from '../src/pages/NFT.jsx';

// Mock contract interactions
const mockContract = {
  read: {
    totalSupply: vi.fn(),
    maxSupply: vi.fn(),
    mintPrice: vi.fn(),
    balanceOf: vi.fn(),
  },
  write: {
    mint: vi.fn(),
    mintWithReferral: vi.fn(),
  },
  simulate: {
    mint: vi.fn(),
    mintWithReferral: vi.fn(),
  },
};

// Mock wagmi hooks
const mockUseAccount = vi.fn();
const mockUseReadContract = vi.fn();
const mockUseWriteContract = vi.fn();
const mockUseWaitForTransactionReceipt = vi.fn();
const mockUseBalance = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useReadContract: () => mockUseReadContract(),
  useWriteContract: () => mockUseWriteContract(),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
  useBalance: () => mockUseBalance(),
}));

// Mock backend API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('NFT铸造流程端到端测试', () => {
  const testAddress = '0x1234567890123456789012345678901234567890';
  const referrerAddress = '0x9876543210987654321098765432109876543210';
  const contractAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default account state
    mockUseAccount.mockReturnValue({
      address: testAddress,
      isConnected: true,
      chainId: 97, // BSC Testnet
    });
    
    // Setup default contract read states
    mockUseReadContract.mockImplementation(({ functionName }) => {
      switch (functionName) {
        case 'totalSupply':
          return { data: BigInt(150), isLoading: false, error: null };
        case 'maxSupply':
          return { data: BigInt(10000), isLoading: false, error: null };
        case 'mintPrice':
          return { data: BigInt('50000000000000000'), isLoading: false, error: null }; // 0.05 BNB
        case 'balanceOf':
          return { data: BigInt(0), isLoading: false, error: null };
        default:
          return { data: null, isLoading: false, error: null };
      }
    });
    
    // Setup default balance
    mockUseBalance.mockReturnValue({
      data: { value: BigInt('1000000000000000000'), formatted: '1.0' }, // 1 BNB
      isLoading: false,
      error: null,
    });
    
    // Setup default write contract
    mockUseWriteContract.mockReturnValue({
      writeContract: vi.fn(),
      data: null,
      isLoading: false,
      error: null,
    });
    
    // Setup default transaction receipt
    mockUseWaitForTransactionReceipt.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    
    // Setup default fetch responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  describe('NFT信息显示', () => {
    it('应该显示NFT基本信息', async () => {
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument();
        expect(screen.getByText(/150/)).toBeInTheDocument(); // 当前供应量
        expect(screen.getByText(/10000/)).toBeInTheDocument(); // 最大供应量
        expect(screen.getByText(/0.05/)).toBeInTheDocument(); // 价格
      });
    });
    
    it('应该显示用户余额信息', async () => {
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/1.0.*BNB/i)).toBeInTheDocument();
        expect(screen.getByText(/0.*NFT/i)).toBeInTheDocument();
      });
    });
    
    it('应该在加载时显示骨架屏', () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      expect(screen.getByText(/加载中|Loading/i)).toBeInTheDocument();
    });
  });

  describe('普通铸造流程', () => {
    it('应该能够铸造NFT', async () => {
      const mockWriteContract = vi.fn();
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: null,
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      const mintButton = screen.getByText(/铸造|Mint/i);
      fireEvent.click(mintButton);
      
      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith({
          address: expect.any(String),
          abi: expect.any(Array),
          functionName: 'mint',
          value: BigInt('50000000000000000'),
        });
      });
    });
    
    it('应该在余额不足时禁用铸造按钮', () => {
      mockUseBalance.mockReturnValue({
        data: { value: BigInt('10000000000000000'), formatted: '0.01' }, // 0.01 BNB (不足)
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      const mintButton = screen.getByText(/铸造|Mint/i);
      expect(mintButton).toBeDisabled();
      expect(screen.getByText(/余额不足|Insufficient balance/i)).toBeInTheDocument();
    });
    
    it('应该在铸造过程中显示加载状态', () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: null,
        isLoading: true,
        error: null,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      expect(screen.getByText(/铸造中|Minting/i)).toBeInTheDocument();
    });
    
    it('应该在铸造成功后更新UI', async () => {
      const txHash = '0x1234567890abcdef';
      
      // 模拟交易成功
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: txHash,
        isLoading: false,
        error: null,
      });
      
      mockUseWaitForTransactionReceipt.mockReturnValue({
        data: {
          status: 'success',
          transactionHash: txHash,
          logs: [{
            topics: ['0x...', '0x...', testAddress],
            data: '0x01', // tokenId = 1
          }],
        },
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          expect.stringContaining('铸造成功')
        );
      });
    });
    
    it('应该处理铸造失败', async () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: null,
        isLoading: false,
        error: new Error('用户拒绝交易'),
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          expect.stringContaining('铸造失败')
        );
      });
    });
  });

  describe('推荐人铸造流程', () => {
    it('应该能够使用推荐码铸造', async () => {
      const mockWriteContract = vi.fn();
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: null,
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      // 输入推荐码
      const referralInput = screen.getByPlaceholderText(/推荐码|Referral Code/i);
      fireEvent.change(referralInput, { target: { value: referrerAddress } });
      
      const mintButton = screen.getByText(/铸造|Mint/i);
      fireEvent.click(mintButton);
      
      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith({
          address: expect.any(String),
          abi: expect.any(Array),
          functionName: 'mintWithReferral',
          args: [referrerAddress],
          value: BigInt('50000000000000000'),
        });
      });
    });
    
    it('应该验证推荐码格式', () => {
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      const referralInput = screen.getByPlaceholderText(/推荐码|Referral Code/i);
      fireEvent.change(referralInput, { target: { value: 'invalid-address' } });
      
      expect(screen.getByText(/无效的推荐码|Invalid referral code/i)).toBeInTheDocument();
    });
    
    it('应该防止自己推荐自己', () => {
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      const referralInput = screen.getByPlaceholderText(/推荐码|Referral Code/i);
      fireEvent.change(referralInput, { target: { value: testAddress } });
      
      expect(screen.getByText(/不能推荐自己|Cannot refer yourself/i)).toBeInTheDocument();
    });
    
    it('应该在推荐铸造成功后记录推荐关系', async () => {
      const txHash = '0x1234567890abcdef';
      
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: txHash,
        isLoading: false,
        error: null,
      });
      
      mockUseWaitForTransactionReceipt.mockReturnValue({
        data: {
          status: 'success',
          transactionHash: txHash,
        },
        isLoading: false,
        error: null,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      // 输入推荐码并铸造
      const referralInput = screen.getByPlaceholderText(/推荐码|Referral Code/i);
      fireEvent.change(referralInput, { target: { value: referrerAddress } });
      
      const mintButton = screen.getByText(/铸造|Mint/i);
      fireEvent.click(mintButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/referrals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referrer: referrerAddress,
            referee: testAddress,
            txHash: txHash,
            type: 'nft_mint',
          }),
        });
      });
    });
  });

  describe('合约状态更新', () => {
    it('应该在铸造后更新总供应量', async () => {
      const txHash = '0x1234567890abcdef';
      
      // 初始状态
      let totalSupply = BigInt(150);
      mockUseReadContract.mockImplementation(({ functionName }) => {
        if (functionName === 'totalSupply') {
          return { data: totalSupply, isLoading: false, error: null };
        }
        return { data: null, isLoading: false, error: null };
      });
      
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: txHash,
        isLoading: false,
        error: null,
      });
      
      mockUseWaitForTransactionReceipt.mockReturnValue({
        data: {
          status: 'success',
          transactionHash: txHash,
        },
        isLoading: false,
        error: null,
      });
      
      const { rerender } = render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      // 模拟铸造成功后的状态更新
      totalSupply = BigInt(151);
      
      rerender(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/151/)).toBeInTheDocument();
      });
    });
    
    it('应该在铸造后更新用户NFT余额', async () => {
      const txHash = '0x1234567890abcdef';
      
      // 初始状态
      let userBalance = BigInt(0);
      mockUseReadContract.mockImplementation(({ functionName }) => {
        if (functionName === 'balanceOf') {
          return { data: userBalance, isLoading: false, error: null };
        }
        return { data: null, isLoading: false, error: null };
      });
      
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: txHash,
        isLoading: false,
        error: null,
      });
      
      mockUseWaitForTransactionReceipt.mockReturnValue({
        data: {
          status: 'success',
          transactionHash: txHash,
        },
        isLoading: false,
        error: null,
      });
      
      const { rerender } = render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      // 模拟铸造成功后的状态更新
      userBalance = BigInt(1);
      
      rerender(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/1.*NFT/i)).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理合约读取错误', () => {
      mockUseReadContract.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('合约调用失败'),
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      expect(screen.getByText(/加载失败|Failed to load/i)).toBeInTheDocument();
    });
    
    it('应该处理网络错误', () => {
      mockUseAccount.mockReturnValue({
        address: testAddress,
        isConnected: true,
        chainId: 1, // 错误网络
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      expect(screen.getByText(/错误的网络|Wrong network/i)).toBeInTheDocument();
    });
    
    it('应该处理未连接钱包的情况', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
        chainId: undefined,
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      expect(screen.getByText(/请先连接钱包|Please connect wallet/i)).toBeInTheDocument();
    });
    
    it('应该处理售罄情况', () => {
      mockUseReadContract.mockImplementation(({ functionName }) => {
        switch (functionName) {
          case 'totalSupply':
            return { data: BigInt(10000), isLoading: false, error: null };
          case 'maxSupply':
            return { data: BigInt(10000), isLoading: false, error: null };
          default:
            return { data: null, isLoading: false, error: null };
        }
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      expect(screen.getByText(/已售罄|Sold out/i)).toBeInTheDocument();
      expect(screen.getByText(/铸造|Mint/i)).toBeDisabled();
    });
  });

  describe('推荐奖励系统', () => {
    it('应该在推荐铸造成功后更新推荐人奖励', async () => {
      const txHash = '0x1234567890abcdef';
      
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: txHash,
        isLoading: false,
        error: null,
      });
      
      mockUseWaitForTransactionReceipt.mockReturnValue({
        data: {
          status: 'success',
          transactionHash: txHash,
        },
        isLoading: false,
        error: null,
      });
      
      // 模拟后端API响应
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          referralReward: '1000000000000000000000', // 1000 YES tokens
        }),
      });
      
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      // 输入推荐码并铸造
      const referralInput = screen.getByPlaceholderText(/推荐码|Referral Code/i);
      fireEvent.change(referralInput, { target: { value: referrerAddress } });
      
      const mintButton = screen.getByText(/铸造|Mint/i);
      fireEvent.click(mintButton);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/referrals', expect.any(Object));
      });
    });
    
    it('应该显示推荐奖励信息', () => {
      render(
        <TestWrapper>
          <NFTMint />
        </TestWrapper>
      );
      
      expect(screen.getByText(/推荐奖励|Referral Reward/i)).toBeInTheDocument();
      expect(screen.getByText(/1000.*YES/i)).toBeInTheDocument();
    });
  });
});

// 手动测试指南
/*
手动测试步骤：

1. NFT信息显示测试：
   - 访问NFT页面
   - 检查总供应量、最大供应量、价格显示是否正确
   - 验证用户BNB余额和NFT余额显示

2. 普通铸造测试：
   - 确保钱包已连接且在BSC网络
   - 确保有足够的BNB余额
   - 点击铸造按钮
   - 确认MetaMask交易
   - 等待交易确认
   - 验证NFT余额增加
   - 验证总供应量更新

3. 推荐铸造测试：
   - 获取另一个地址作为推荐人
   - 在推荐码输入框输入推荐人地址
   - 点击铸造按钮
   - 确认交易
   - 验证推荐关系记录到数据库
   - 检查推荐人奖励是否正确计算

4. 错误情况测试：
   - 测试余额不足时的提示
   - 测试无效推荐码的验证
   - 测试自己推荐自己的防护
   - 测试网络错误的处理
   - 测试售罄情况的显示

5. 合约状态验证：
   - 使用区块链浏览器验证交易
   - 检查合约状态是否正确更新
   - 验证事件日志是否正确记录

6. 数据库验证：
   - 检查推荐关系表是否正确记录
   - 验证推荐人奖励是否正确计算
   - 确认空投资格是否正确更新
*/