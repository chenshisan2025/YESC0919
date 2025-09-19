import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from './setup.js';
import AirdropTasks from '../src/pages/Airdrop.jsx';
import { toast } from 'sonner';

// Mock contract interactions
const mockAirdropContract = {
  read: {
    claimedAmount: vi.fn(),
    totalClaimable: vi.fn(),
    hasClaimed: vi.fn(),
    isEligible: vi.fn(),
  },
  write: {
    claimTokens: vi.fn(),
  },
  simulate: {
    claimTokens: vi.fn(),
  },
};

// Mock wagmi hooks
const mockUseAccount = vi.fn();
const mockUseReadContract = vi.fn();
const mockUseWriteContract = vi.fn();
const mockUseWaitForTransactionReceipt = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useReadContract: () => mockUseReadContract(),
  useWriteContract: () => mockUseWriteContract(),
  useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
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

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('空投任务流程端到端测试', () => {
  const testAddress = '0x1234567890123456789012345678901234567890';
  const airdropContractAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  
  const mockTasks = [
    {
      id: 1,
      title: '关注Twitter',
      description: '关注YesCoin官方Twitter账号',
      type: 'social',
      platform: 'twitter',
      url: 'https://twitter.com/yescoin',
      reward: '100',
      required: true,
      completed: false,
    },
    {
      id: 2,
      title: '加入Telegram',
      description: '加入YesCoin官方Telegram群组',
      type: 'social',
      platform: 'telegram',
      url: 'https://t.me/yescoin',
      reward: '150',
      required: true,
      completed: false,
    },
    {
      id: 3,
      title: '铸造Guardian NFT',
      description: '铸造至少1个Guardian NFT',
      type: 'onchain',
      reward: '500',
      required: true,
      completed: false,
    },
    {
      id: 4,
      title: '推荐朋友',
      description: '推荐至少3个朋友注册',
      type: 'referral',
      reward: '300',
      required: false,
      completed: false,
    },
  ];
  
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
        case 'claimedAmount':
          return { data: BigInt(0), isLoading: false, error: null };
        case 'totalClaimable':
          return { data: BigInt('5000000000000000000000'), isLoading: false, error: null }; // 5000 YES
        case 'hasClaimed':
          return { data: false, isLoading: false, error: null };
        case 'isEligible':
          return { data: true, isLoading: false, error: null };
        default:
          return { data: null, isLoading: false, error: null };
      }
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
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/tasks')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tasks: mockTasks }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
    
    // Setup localStorage
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('任务列表显示', () => {
    it('应该显示所有任务', async () => {
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('关注Twitter')).toBeInTheDocument();
        expect(screen.getByText('加入Telegram')).toBeInTheDocument();
        expect(screen.getByText('铸造Guardian NFT')).toBeInTheDocument();
        expect(screen.getByText('推荐朋友')).toBeInTheDocument();
      });
    });
    
    it('应该显示任务奖励', async () => {
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/100.*YES/)).toBeInTheDocument();
        expect(screen.getByText(/150.*YES/)).toBeInTheDocument();
        expect(screen.getByText(/500.*YES/)).toBeInTheDocument();
        expect(screen.getByText(/300.*YES/)).toBeInTheDocument();
      });
    });
    
    it('应该区分必需和可选任务', async () => {
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getAllByText(/必需|Required/i)).toHaveLength(3);
        expect(screen.getByText(/可选|Optional/i)).toBeInTheDocument();
      });
    });
    
    it('应该显示总奖励金额', async () => {
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/5000.*YES/)).toBeInTheDocument();
      });
    });
  });

  describe('任务完成流程', () => {
    it('应该能够标记社交媒体任务为完成', async () => {
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const twitterTask = screen.getByText('关注Twitter').closest('.task-item');
        const completeButton = twitterTask.querySelector('button');
        fireEvent.click(completeButton);
      });
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/tasks/1/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: testAddress }),
        });
      });
    });
    
    it('应该在任务完成后更新UI状态', async () => {
      // 模拟任务完成后的API响应
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks/1/complete')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true, completed: true }),
          });
        }
        if (url.includes('/api/tasks')) {
          const updatedTasks = [...mockTasks];
          updatedTasks[0].completed = true;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: updatedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const twitterTask = screen.getByText('关注Twitter').closest('.task-item');
        const completeButton = twitterTask.querySelector('button');
        fireEvent.click(completeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/已完成|Completed/i)).toBeInTheDocument();
      });
    });
    
    it('应该打开外部链接进行社交媒体任务', async () => {
      const mockOpen = vi.fn();
      global.window.open = mockOpen;
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const twitterLink = screen.getByText('关注Twitter').closest('.task-item').querySelector('a');
        if (twitterLink) {
          fireEvent.click(twitterLink);
          expect(mockOpen).toHaveBeenCalledWith('https://twitter.com/yescoin', '_blank');
        }
      });
    });
    
    it('应该自动检测链上任务完成状态', async () => {
      // 模拟用户已经铸造了NFT
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks/check-onchain')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              nftMinted: true,
              nftCount: 2,
            }),
          });
        }
        if (url.includes('/api/tasks')) {
          const updatedTasks = [...mockTasks];
          updatedTasks[2].completed = true; // NFT任务完成
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: updatedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/tasks/check-onchain?address=${testAddress}`,
          expect.any(Object)
        );
      });
    });
  });

  describe('空投领取流程', () => {
    it('应该在未完成所有必需任务时禁用领取按钮', async () => {
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const claimButton = screen.getByText(/领取空投|Claim Airdrop/i);
        expect(claimButton).toBeDisabled();
        expect(screen.getByText(/请完成所有必需任务|Please complete all required tasks/i)).toBeInTheDocument();
      });
    });
    
    it('应该在完成所有必需任务后启用领取按钮', async () => {
      // 模拟所有必需任务已完成
      const completedTasks = mockTasks.map(task => ({
        ...task,
        completed: task.required ? true : task.completed,
      }));
      
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: completedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const claimButton = screen.getByText(/领取空投|Claim Airdrop/i);
        expect(claimButton).not.toBeDisabled();
      });
    });
    
    it('应该能够成功领取空投', async () => {
      const mockWriteContract = vi.fn();
      const txHash = '0x1234567890abcdef';
      
      // 模拟所有必需任务已完成
      const completedTasks = mockTasks.map(task => ({
        ...task,
        completed: task.required ? true : task.completed,
      }));
      
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: completedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
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
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const claimButton = screen.getByText(/领取空投|Claim Airdrop/i);
        fireEvent.click(claimButton);
      });
      
      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith({
          address: airdropContractAddress,
          abi: expect.any(Array),
          functionName: 'claimTokens',
        });
      });
    });
    
    it('应该防止重复领取', async () => {
      mockUseReadContract.mockImplementation(({ functionName }) => {
        if (functionName === 'hasClaimed') {
          return { data: true, isLoading: false, error: null }; // 已经领取过
        }
        return { data: null, isLoading: false, error: null };
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const claimButton = screen.getByText(/已领取|Already Claimed/i);
        expect(claimButton).toBeDisabled();
      });
    });
    
    it('应该在领取成功后更新UI状态', async () => {
      const txHash = '0x1234567890abcdef';
      
      // 模拟所有必需任务已完成
      const completedTasks = mockTasks.map(task => ({
        ...task,
        completed: task.required ? true : task.completed,
      }));
      
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: completedTasks }),
          });
        }
        if (url.includes('/api/airdrop/claim')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ 
              success: true,
              amount: '5000000000000000000000',
              txHash: txHash,
            }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
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
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const claimButton = screen.getByText(/领取空投|Claim Airdrop/i);
        fireEvent.click(claimButton);
      });
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('领取成功')
        );
        expect(mockFetch).toHaveBeenCalledWith('/api/airdrop/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: testAddress,
            txHash: txHash,
          }),
        });
      });
    });
  });

  describe('任务进度跟踪', () => {
    it('应该显示任务完成进度', async () => {
      // 模拟部分任务完成
      const partiallyCompletedTasks = [...mockTasks];
      partiallyCompletedTasks[0].completed = true; // Twitter
      partiallyCompletedTasks[1].completed = true; // Telegram
      
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: partiallyCompletedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/2.*3/)).toBeInTheDocument(); // 2/3 必需任务完成
      });
    });
    
    it('应该计算总奖励金额', async () => {
      // 模拟所有任务完成
      const allCompletedTasks = mockTasks.map(task => ({
        ...task,
        completed: true,
      }));
      
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: allCompletedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        // 100 + 150 + 500 + 300 = 1050 YES
        expect(screen.getByText(/1050.*YES/)).toBeInTheDocument();
      });
    });
    
    it('应该保存任务完成状态到本地存储', async () => {
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const twitterTask = screen.getByText('关注Twitter').closest('.task-item');
        const completeButton = twitterTask.querySelector('button');
        fireEvent.click(completeButton);
      });
      
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          `task_${testAddress}_1`,
          'completed'
        );
      });
    });
  });

  describe('推荐任务特殊处理', () => {
    it('应该显示推荐进度', async () => {
      // 模拟推荐数据
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/referrals/count')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 2 }),
          });
        }
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: mockTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/2.*3/)).toBeInTheDocument(); // 2/3 推荐完成
      });
    });
    
    it('应该在达到推荐目标时自动完成任务', async () => {
      // 模拟达到推荐目标
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/referrals/count')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ count: 3 }),
          });
        }
        if (url.includes('/api/tasks')) {
          const updatedTasks = [...mockTasks];
          updatedTasks[3].completed = true; // 推荐任务完成
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: updatedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/3.*3/)).toBeInTheDocument(); // 3/3 推荐完成
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理任务加载失败', async () => {
      mockFetch.mockRejectedValue(new Error('网络错误'));
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/加载失败|Failed to load/i)).toBeInTheDocument();
      });
    });
    
    it('应该处理任务完成失败', async () => {
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks/1/complete')) {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: '任务完成失败' }),
          });
        }
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: mockTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const twitterTask = screen.getByText('关注Twitter').closest('.task-item');
        const completeButton = twitterTask.querySelector('button');
        fireEvent.click(completeButton);
      });
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('任务完成失败')
        );
      });
    });
    
    it('应该处理空投领取失败', async () => {
      const completedTasks = mockTasks.map(task => ({
        ...task,
        completed: task.required ? true : task.completed,
      }));
      
      mockFetch.mockImplementation((url) => {
        if (url.includes('/api/tasks')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: completedTasks }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });
      
      mockUseWriteContract.mockReturnValue({
        writeContract: vi.fn(),
        data: null,
        isLoading: false,
        error: new Error('用户拒绝交易'),
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      await waitFor(() => {
        const claimButton = screen.getByText(/领取空投|Claim Airdrop/i);
        fireEvent.click(claimButton);
      });
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('领取失败')
        );
      });
    });
    
    it('应该处理未连接钱包的情况', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
        chainId: undefined,
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      expect(screen.getByText(/请先连接钱包|Please connect wallet/i)).toBeInTheDocument();
    });
    
    it('应该处理错误网络', () => {
      mockUseAccount.mockReturnValue({
        address: testAddress,
        isConnected: true,
        chainId: 1, // 错误网络
      });
      
      render(
        <TestWrapper>
          <AirdropTasks />
        </TestWrapper>
      );
      
      expect(screen.getByText(/错误的网络|Wrong network/i)).toBeInTheDocument();
    });
  });
});

// 手动测试指南
/*
手动测试步骤：

1. 任务列表显示测试：
   - 访问空投页面
   - 检查所有任务是否正确显示
   - 验证任务奖励金额显示
   - 确认必需/可选任务标识

2. 社交媒体任务测试：
   - 点击Twitter任务链接，确认跳转正确
   - 完成Twitter关注后点击"完成"按钮
   - 验证任务状态更新为已完成
   - 重复测试Telegram任务

3. 链上任务自动检测：
   - 确保钱包已连接
   - 铸造一个Guardian NFT
   - 返回空投页面，检查NFT任务是否自动标记为完成

4. 推荐任务测试：
   - 邀请朋友使用推荐链接注册
   - 检查推荐进度是否正确更新
   - 达到3个推荐后验证任务自动完成

5. 空投领取测试：
   - 完成所有必需任务前，验证领取按钮被禁用
   - 完成所有必需任务后，验证领取按钮可用
   - 点击领取按钮，确认MetaMask交易
   - 等待交易确认，验证成功提示
   - 刷新页面，确认不能重复领取

6. 错误情况测试：
   - 测试网络断开时的错误处理
   - 测试任务完成失败的提示
   - 测试空投领取失败的处理
   - 测试未连接钱包的提示
   - 测试错误网络的警告

7. 数据持久化测试：
   - 完成部分任务后刷新页面
   - 验证任务状态是否保持
   - 检查本地存储是否正确保存状态

8. 合约验证：
   - 使用区块链浏览器验证空投交易
   - 检查代币余额是否正确增加
   - 验证合约状态是否正确更新

9. 后端数据验证：
   - 检查数据库中任务完成记录
   - 验证推荐关系是否正确记录
   - 确认空投领取记录是否正确
*/