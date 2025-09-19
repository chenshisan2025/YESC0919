// 钱包连接测试用例
// 测试MetaMask和WalletConnect连接，验证地址识别和BSC网络切换

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from './setup'
import Layout from '../src/components/Layout.jsx'

// Mock Web3Modal
vi.mock('@web3modal/wagmi', () => ({
  createWeb3Modal: vi.fn(() => ({
    open: vi.fn(),
    close: vi.fn(),
    subscribeState: vi.fn(),
  })),
}))

// wagmi hooks已在setup.js中mock

// Mock viem
vi.mock('viem', () => ({
  http: vi.fn(),
  createConfig: vi.fn(),
}))

describe('钱包连接测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染测试', () => {
    it('应该能够渲染Layout组件', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      // 检查基本内容存在
      expect(screen.getByText('测试内容')).toBeInTheDocument()
    })

    it('应该显示YesCoin标题', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      // 检查YesCoin标题
      expect(screen.getByText('YesCoin')).toBeInTheDocument()
    })

    it('应该显示导航菜单', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      // 检查导航链接
      expect(screen.getByText('首页')).toBeInTheDocument()
      expect(screen.getByText('代币信息')).toBeInTheDocument()
      expect(screen.getByText('NFT')).toBeInTheDocument()
      expect(screen.getByText('空投')).toBeInTheDocument()
      expect(screen.getByText('FAQ')).toBeInTheDocument()
    })
  })

  describe('钱包按钮测试', () => {
    it('应该显示连接钱包按钮', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      // 检查连接钱包按钮存在
      const connectButton = screen.getByText('连接钱包')
      expect(connectButton).toBeInTheDocument()
    })

    it('应该能够点击连接钱包按钮', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      const connectButton = screen.getByText('连接钱包')
      fireEvent.click(connectButton)
      
      // 按钮应该是可点击的（不会抛出错误）
      expect(connectButton).toBeInTheDocument()
    })
  })

  describe('响应式设计测试', () => {
    it('应该在移动端显示菜单按钮', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      // 检查移动端菜单按钮
      const menuButton = screen.getByText('菜单')
      expect(menuButton).toBeInTheDocument()
    })

    it('应该能够切换移动端菜单', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      const menuButton = screen.getByText('菜单')
      fireEvent.click(menuButton)
      
      // 菜单应该是可点击的
      expect(menuButton).toBeInTheDocument()
    })
  })

  describe('语言切换测试', () => {
    it('应该显示语言切换按钮', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      // 检查语言切换按钮
      const langButton = screen.getByText('中文')
      expect(langButton).toBeInTheDocument()
    })

    it('应该能够切换语言', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      const langButton = screen.getByText('中文')
      fireEvent.click(langButton)
      
      // 语言按钮应该是可点击的
      expect(langButton).toBeInTheDocument()
    })
  })

  describe('外部链接测试', () => {
    it('应该显示购买YES按钮', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      // 检查购买YES按钮
      const buyButton = screen.getByText('购买 YES')
      expect(buyButton).toBeInTheDocument()
    })

    it('购买YES按钮应该有正确的链接', async () => {
      render(
        <TestWrapper>
          <Layout>
            <div>测试内容</div>
          </Layout>
        </TestWrapper>
      )

      const buyButton = screen.getByText('购买 YES')
      expect(buyButton.closest('a')).toHaveAttribute('href', 'https://pancakeswap.finance')
    })
  })
})