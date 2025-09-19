import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from './setup.js'
import App from '../src/App.jsx'
import Home from '../src/pages/Home.jsx'
import NFT from '../src/pages/NFT.jsx'
import Airdrop from '../src/pages/Airdrop.jsx'
import TokenInfo from '../src/pages/TokenInfo.jsx'

// Mock Web3Modal
vi.mock('@web3modal/wagmi/react', () => ({
  createWeb3Modal: vi.fn(),
  useWeb3Modal: () => ({
    open: vi.fn(),
    close: vi.fn()
  }),
  useWeb3ModalState: () => ({
    open: false,
    selectedNetworkId: 97
  })
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }) => children
}))

describe('页面渲染和样式测试', () => {
  describe('应用整体', () => {
    it('应该正确渲染应用主体', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )
      
      // 验证应用容器存在
      const appContainer = document.querySelector('.min-h-screen')
      expect(appContainer).toBeTruthy()
    })
  })

  describe('导航菜单', () => {
    it('应该显示所有导航链接', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )
      
      // 验证导航链接
      expect(screen.getByText('首页')).toBeInTheDocument()
      expect(screen.getByText('NFT')).toBeInTheDocument()
      expect(screen.getByText('空投')).toBeInTheDocument()
      expect(screen.getByText('代币')).toBeInTheDocument()
    })
  })

  describe('钱包连接按钮', () => {
    it('应该显示连接钱包按钮', () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )
      
      // 查找连接钱包按钮
      const connectButton = screen.getByRole('button', { name: /连接钱包/i })
      expect(connectButton).toBeInTheDocument()
    })
  })

  describe('首页', () => {
    it('应该显示首页内容', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      )
      
      // 验证首页标题
      expect(screen.getByText(/YesCoin/i)).toBeInTheDocument()
    })
  })

  describe('NFT页面', () => {
    it('应该显示NFT页面内容', () => {
      render(
        <TestWrapper>
          <NFT />
        </TestWrapper>
      )
      
      // 验证NFT页面标题
      expect(screen.getByText(/Guardian NFT/i)).toBeInTheDocument()
    })
  })

  describe('空投页面', () => {
    it('应该显示空投页面内容', () => {
      render(
        <TestWrapper>
          <Airdrop />
        </TestWrapper>
      )
      
      // 验证空投页面标题
      expect(screen.getByText(/YesCoin 空投/i)).toBeInTheDocument()
    })
  })

  describe('代币信息页面', () => {
    it('应该显示代币信息页面内容', () => {
      render(
        <TestWrapper>
          <TokenInfo />
        </TestWrapper>
      )
      
      // 验证代币页面标题
      expect(screen.getByText(/YesCoin 代币/i)).toBeInTheDocument()
    })
  })
})

/*
手动测试指南：

1. 页面渲染测试：
   - 访问每个页面，确保内容正确显示
   - 检查页面布局和样式
   - 验证响应式设计在不同屏幕尺寸下的表现

2. 导航测试：
   - 点击导航菜单中的每个链接
   - 验证页面正确跳转
   - 检查当前页面的高亮状态

3. 钱包连接测试：
   - 点击连接钱包按钮
   - 验证钱包连接流程
   - 检查连接状态的UI反馈

4. 样式一致性测试：
   - 检查所有页面的颜色主题一致性
   - 验证字体和间距的统一性
   - 确保按钮和交互元素的样式一致

5. 响应式测试：
   - 在不同设备尺寸下测试
   - 验证移动端适配
   - 检查触摸交互的可用性
*/