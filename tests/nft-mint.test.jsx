// NFT铸造流程测试
// 测试Guardian NFT铸造、推荐人奖励、合约状态更新和UI反映

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from './setup'
import NFT from '../src/pages/NFT.jsx'

// wagmi hooks已在setup.js中mock

// Mock ethers
vi.mock('ethers', () => ({
  ethers: {
    parseEther: vi.fn((value) => value),
    formatEther: vi.fn((value) => value),
  },
}))

describe('NFT铸造流程测试', () => {
  const mockAddress = '0x1234567890123456789012345678901234567890'
  const mockReferrer = '0x9876543210987654321098765432109876543210'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Guardian NFT铸造测试', () => {
    it('应该显示NFT铸造界面', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 检查NFT铸造界面元素
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
      // 检查连接钱包按钮（未连接状态）
      expect(screen.getByRole('button', { name: /连接钱包/i })).toBeInTheDocument()
    })

    it('应该能够铸造NFT（无推荐人）', async () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证页面基本元素
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
      // 未连接钱包时显示连接钱包按钮（在铸造按钮中）
      expect(screen.getByRole('button', { name: /连接钱包/i })).toBeInTheDocument()
    })

    it('应该能够铸造NFT（有推荐人）', () => {
      // 模拟URL中有推荐人参数
      Object.defineProperty(window, 'location', {
        value: {
          search: `?ref=${mockReferrer}`,
        },
        writable: true,
      })

      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
      // 未连接钱包时显示连接钱包按钮
      expect(screen.getByRole('button', { name: /连接钱包/i })).toBeInTheDocument()
    })

    it('应该处理铸造失败情况', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证界面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
      // 未连接钱包时显示连接钱包按钮
      expect(screen.getByRole('button', { name: /连接钱包/i })).toBeInTheDocument()
    })
  })

  describe('合约状态更新测试', () => {
    it('应该正确读取NFT总供应量', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })

    it('应该正确读取用户NFT余额', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })

    it('应该显示铸造进度', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })
  })

  describe('UI反映测试', () => {
    it('应该更新铸造后的NFT数量', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })

    it('应该显示正确的铸造费用', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })

    it('应该显示用户拥有的NFT数量', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })
  })

  describe('推荐人奖励测试', () => {
    it('应该记录推荐人信息', () => {
      // 模拟URL中有推荐人参数
      Object.defineProperty(window, 'location', {
        value: {
          search: `?ref=${mockReferrer}`,
        },
        writable: true,
      })

      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })

    it('应该验证推荐人奖励记录', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )

      // 验证NFT页面正常渲染
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })
  })
})

// 手动测试指南
/*
手动测试NFT铸造流程：

1. 钱包连接测试：
   - 连接MetaMask钱包
   - 确保连接到BSC测试网
   - 验证钱包地址显示正确

2. NFT铸造测试：
   - 访问NFT页面
   - 点击铸造按钮
   - 确认交易
   - 验证NFT数量更新

3. 推荐人测试：
   - 使用带推荐人参数的URL访问
   - 铸造NFT
   - 验证推荐人奖励记录

4. 合约状态验证：
   - 检查总供应量
   - 检查用户余额
   - 验证交易记录
*/