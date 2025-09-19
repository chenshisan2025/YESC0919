# YesCoin项目真实链上与后端服务接入指南

## 1. 项目概述

本指南将帮助您将YesCoin项目从模拟环境迁移到真实的区块链网络和后端服务，实现完整的Web3功能。

## 2. 核心功能

### 2.1 接入范围

本指南涵盖以下核心模块的真实接入：
- 区块链网络连接（从测试网到主网）
- 智能合约部署与交互
- 后端API服务配置
- 数据库服务设置
- 前端Web3钱包连接
- 安全配置与最佳实践

### 2.2 技术栈配置

| 组件 | 当前状态 | 目标配置 |
|------|----------|----------|
| 前端 | React + Vite + 模拟数据 | React + Vite + 真实Web3连接 |
| 后端 | Express + 模拟API | Express + 真实数据库 + 区块链交互 |
| 区块链 | 模拟合约调用 | BSC测试网/主网 + 真实智能合约 |
| 数据库 | 无 | PostgreSQL + Supabase |
| 钱包 | 模拟连接 | MetaMask + WalletConnect |

### 2.3 实施步骤概览

1. **环境准备**：配置开发环境和依赖
2. **区块链配置**：设置网络连接和钱包集成
3. **智能合约部署**：部署代币、空投、NFT合约
4. **后端服务配置**：数据库设置和API服务
5. **前端集成**：连接真实服务和合约
6. **测试验证**：功能测试和安全检查
7. **生产部署**：主网部署和监控

## 3. 详细实施流程

### 3.1 环境准备阶段

**步骤1：安装必要依赖**
```bash
# 在项目根目录执行
npm install @wagmi/core @wagmi/connectors viem
npm install ethers @openzeppelin/contracts
npm install dotenv cors helmet express-rate-limit

# 后端目录执行
cd backend
npm install pg @supabase/supabase-js
npm install @types/pg @types/cors
```

**步骤2：创建环境配置文件**
```bash
# 项目根目录
touch .env.local
touch .env.production

# 后端目录
cd backend
touch .env
touch .env.production
```

### 3.2 区块链网络配置

**步骤3：配置Wagmi和Web3连接**

创建 `src/config/chains.ts`：
```typescript
import { bsc, bscTestnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'
import { metaMask, walletConnect } from 'wagmi/connectors'

// 项目ID（从WalletConnect获取）
const projectId = process.env.VITE_WALLETCONNECT_PROJECT_ID || 'your-project-id'

// 链配置
export const chains = [
  bscTestnet, // 测试网
  bsc,        // 主网
] as const

// Wagmi配置
export const config = createConfig({
  chains,
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
    [bsc.id]: http('https://bsc-dataseed1.binance.org'),
  },
})
```

**步骤4：更新环境变量**

`.env.local` 文件：
```env
# WalletConnect配置
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# 区块链网络
VITE_CHAIN_ID=97  # BSC测试网
VITE_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545

# 智能合约地址（部署后填入）
VITE_TOKEN_CONTRACT_ADDRESS=
VITE_AIRDROP_CONTRACT_ADDRESS=
VITE_NFT_CONTRACT_ADDRESS=

# API配置
VITE_API_BASE_URL=http://localhost:3002
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3.3 智能合约部署

**步骤5：准备智能合约**

创建 `contracts/` 目录并添加合约文件：

`contracts/YesCoinToken.sol`：
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YesCoinToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 10亿代币
    
    constructor() ERC20("YesCoin", "YES") {
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
}
```

**步骤6：部署脚本**

创建 `scripts/deploy.js`：
```javascript
const { ethers } = require('hardhat');

async function main() {
  // 部署YesCoin代币
  const YesCoinToken = await ethers.getContractFactory('YesCoinToken');
  const token = await YesCoinToken.deploy();
  await token.deployed();
  console.log('YesCoin Token deployed to:', token.address);
  
  // 部署空投合约
  const AirdropContract = await ethers.getContractFactory('AirdropContract');
  const airdrop = await AirdropContract.deploy(token.address);
  await airdrop.deployed();
  console.log('Airdrop Contract deployed to:', airdrop.address);
  
  // 部署NFT合约
  const GuardianNFT = await ethers.getContractFactory('GuardianNFT');
  const nft = await GuardianNFT.deploy();
  await nft.deployed();
  console.log('Guardian NFT deployed to:', nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 3.4 后端服务配置

**步骤7：数据库设置**

`backend/.env` 文件：
```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/yescoin
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# 区块链配置
BSC_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
PRIVATE_KEY=your_private_key_for_contract_interaction

# JWT配置
JWT_SECRET=your_jwt_secret_key

# API配置
PORT=3002
CORS_ORIGIN=http://localhost:5173
```

**步骤8：数据库初始化**

创建 `backend/src/database/init.sql`：
```sql
-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    email VARCHAR(255),
    username VARCHAR(100),
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    points_reward INTEGER NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    requirements JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户任务完成记录
CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    task_id UUID REFERENCES tasks(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_hash VARCHAR(66),
    UNIQUE(user_id, task_id)
);

-- 空投记录
CREATE TABLE airdrops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    amount DECIMAL(20, 8) NOT NULL,
    transaction_hash VARCHAR(66),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NFT记录
CREATE TABLE nft_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_id INTEGER NOT NULL,
    transaction_hash VARCHAR(66),
    metadata_uri TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_airdrops_user_id ON airdrops(user_id);
CREATE INDEX idx_nft_mints_user_id ON nft_mints(user_id);
```

### 3.5 前端Web3集成

**步骤9：更新Web3Provider**

修改 `src/components/Web3Provider.tsx`：
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import { config } from '../config/chains'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

interface Web3ContextType {
  address: string | undefined
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  chainId: number | undefined
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(c => c.name === 'MetaMask')
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
    }
  }

  return (
    <WagmiConfig config={config}>
      <Web3Context.Provider value={{
        address,
        isConnected,
        connect: handleConnect,
        disconnect,
        chainId
      }}>
        {children}
      </Web3Context.Provider>
    </WagmiConfig>
  )
}

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}
```

**步骤10：创建合约交互hooks**

创建 `src/hooks/useContracts.ts`：
```typescript
import { useContract, useProvider } from 'wagmi'
import { ethers } from 'ethers'

// 合约ABI（简化版）
const TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)'
]

const AIRDROP_ABI = [
  'function claimAirdrop() external',
  'function hasClaimedAirdrop(address user) view returns (bool)',
  'function airdropAmount() view returns (uint256)'
]

const NFT_ABI = [
  'function mint(address to) external',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)'
]

export function useContracts() {
  const provider = useProvider()
  
  const tokenContract = useContract({
    address: process.env.VITE_TOKEN_CONTRACT_ADDRESS,
    abi: TOKEN_ABI,
    signerOrProvider: provider
  })
  
  const airdropContract = useContract({
    address: process.env.VITE_AIRDROP_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
    signerOrProvider: provider
  })
  
  const nftContract = useContract({
    address: process.env.VITE_NFT_CONTRACT_ADDRESS,
    abi: NFT_ABI,
    signerOrProvider: provider
  })
  
  return {
    tokenContract,
    airdropContract,
    nftContract
  }
}
```

## 4. 安全配置与最佳实践

### 4.1 环境变量安全

- 生产环境私钥使用硬件钱包或密钥管理服务
- API密钥通过环境变量注入，不提交到代码库
- 使用不同的密钥用于测试网和主网

### 4.2 智能合约安全

- 合约部署前进行安全审计
- 使用OpenZeppelin标准库
- 实施访问控制和权限管理
- 设置合理的gas限制

### 4.3 API安全

- 实施速率限制
- 使用HTTPS加密传输
- JWT token过期时间设置
- 输入验证和SQL注入防护

## 5. 测试验证流程

### 5.1 本地测试

```bash
# 启动本地区块链（可选）
npx hardhat node

# 部署合约到本地网络
npx hardhat run scripts/deploy.js --network localhost

# 启动后端服务
cd backend && npm run dev

# 启动前端应用
npm run dev
```

### 5.2 测试网验证

1. 获取测试网BNB（从水龙头）
2. 部署合约到BSC测试网
3. 更新环境变量中的合约地址
4. 测试所有功能模块

### 5.3 功能测试清单

- [ ] 钱包连接和断开
- [ ] 代币余额查询
- [ ] 空投领取功能
- [ ] NFT铸造功能
- [ ] 任务完成验证
- [ ] 推荐系统
- [ ] 数据持久化

## 6. 生产部署

### 6.1 主网部署准备

1. 准备主网BNB用于gas费用
2. 更新环境变量为主网配置
3. 部署合约到BSC主网
4. 配置生产数据库
5. 设置域名和SSL证书

### 6.2 监控和维护

- 设置合约事件监听
- 配置错误日志收集
- 实施性能监控
- 定期备份数据库

## 7. 常见问题解决

### 7.1 连接问题

**问题**：钱包连接失败
**解决**：检查网络配置和RPC端点

**问题**：交易失败
**解决**：检查gas费用和合约地址

### 7.2 合约问题

**问题**：合约调用失败
**解决**：验证ABI和合约地址匹配

**问题**：权限错误
**解决**：检查合约owner权限设置

## 8. 下一步建议

完成基础接入后，可以考虑以下优化：

1. **性能优化**：实施缓存策略和数据库优化
2. **用户体验**：添加交易状态跟踪和错误处理
3. **功能扩展**：添加更多DeFi功能和游戏机制
4. **安全加固**：实施多重签名和时间锁
5. **监控告警**：设置关键指标监控和异常告警

通过以上步骤，您的YesCoin项目将成功接入真实的区块链网络和后端服务，为用户提供完整的Web3体验。