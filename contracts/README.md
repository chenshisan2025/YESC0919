# YesCoin Guardian NFT 智能合约

## 概述

YesCoin Guardian NFT 是一个基于 ERC721 标准的 NFT 智能合约，专为 YesCoin 生态系统设计。合约包含推荐系统、奖励机制和铸造进度跟踪功能。

## 功能特性

### 🎯 核心功能
- **ERC721 标准**: 完全兼容 ERC721 NFT 标准
- **限量供应**: 最大供应量 10,000 个 NFT
- **铸造费用**: 每个 NFT 铸造费用 0.01 BNB
- **推荐系统**: 支持推荐人邀请机制
- **奖励机制**: 推荐人获得 0.005 BNB + 1,000,000 YES 代币奖励
- **进度跟踪**: 实时查询铸造进度

### 🔒 安全特性
- **OpenZeppelin 库**: 使用经过审计的 OpenZeppelin 合约库
- **重入保护**: 防止重入攻击
- **暂停机制**: 紧急情况下可暂停合约
- **权限控制**: 基于 Ownable 的管理员权限

## 合约架构

```
YesCoinGuardianNFT
├── ERC721 (基础NFT功能)
├── ERC721Enumerable (枚举扩展)
├── Ownable (权限管理)
├── ReentrancyGuard (重入保护)
└── Pausable (暂停机制)
```

## 主要函数

### 用户函数

#### `mint(address referrer)`
铸造一个 Guardian NFT
- **参数**: `referrer` - 推荐人地址 (可选，传入零地址表示无推荐人)
- **费用**: 0.01 BNB
- **限制**: 每次交易只能铸造一个 NFT

#### `claimBNBRewards()`
领取推荐奖励中的 BNB 部分
- **条件**: 必须有待领取的 BNB 奖励
- **注意**: YES 代币奖励需要通过其他机制发放

#### `getMintProgress()`
查询铸造进度
- **返回**: (当前数量, 最大供应量, 完成百分比)

#### `getReferralInfo(address user)`
查询用户的推荐信息
- **返回**: (推荐人, 推荐次数, 待领取BNB, 待领取YES)

### 管理员函数

#### `setBaseURI(string baseURI)`
设置 NFT 元数据的基础 URI

#### `pause()` / `unpause()`
暂停/恢复合约功能

#### `withdraw()`
提取合约中的资金

## 部署指南

### 1. 环境准备

```bash
# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件:

```bash
# 部署账户私钥 (不包含0x前缀)
PRIVATE_KEY=your_private_key_here

# BSCScan API密钥 (用于合约验证)
BSCSCAN_API_KEY=your_bscscan_api_key_here
```

### 3. 编译合约

```bash
npx hardhat compile
```

### 4. 运行测试

```bash
# 运行所有测试
npx hardhat test

# 运行特定测试文件
npx hardhat test test/YesCoinGuardianNFT.test.js

# 查看测试覆盖率
npx hardhat coverage
```

### 5. 部署到测试网

```bash
# 部署到 BSC 测试网
npx hardhat run scripts/deploy.js --network bscTestnet
```

### 6. 部署到主网

```bash
# 部署到 BSC 主网
npx hardhat run scripts/deploy.js --network bscMainnet
```

## 网络配置

### BSC 测试网 (Testnet)
- **Chain ID**: 97
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
- **浏览器**: https://testnet.bscscan.com
- **水龙头**: https://testnet.binance.org/faucet-smart

### BSC 主网 (Mainnet)
- **Chain ID**: 56
- **RPC URL**: https://bsc-dataseed1.binance.org
- **浏览器**: https://bscscan.com

## 前端集成

### 合约 ABI

部署后，ABI 文件位于 `artifacts/contracts/YesCoinGuardianNFT.sol/YesCoinGuardianNFT.json`

### 示例代码

```javascript
// 使用 ethers.js 连接合约
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  signer
);

// 铸造 NFT (无推荐人)
await contract.mint(ethers.ZeroAddress, {
  value: ethers.parseEther("0.01")
});

// 铸造 NFT (有推荐人)
await contract.mint(referrerAddress, {
  value: ethers.parseEther("0.01")
});

// 查询铸造进度
const [current, maximum, percentage] = await contract.getMintProgress();
console.log(`进度: ${current}/${maximum} (${percentage}%)`);

// 领取奖励
await contract.claimBNBRewards();
```

## 事件监听

```javascript
// 监听铸造事件
contract.on("NFTMinted", (minter, tokenId, referrer) => {
  console.log(`NFT #${tokenId} 已铸造给 ${minter}`);
  if (referrer !== ethers.ZeroAddress) {
    console.log(`推荐人: ${referrer}`);
  }
});

// 监听推荐奖励事件
contract.on("ReferralReward", (referrer, minter, bnbReward, yesReward) => {
  console.log(`推荐奖励: ${referrer} 获得 ${ethers.formatEther(bnbReward)} BNB`);
});
```

## 安全注意事项

1. **私钥安全**: 永远不要将私钥提交到版本控制系统
2. **测试优先**: 在主网部署前务必在测试网充分测试
3. **合约验证**: 部署后在 BSCScan 上验证合约代码
4. **权限管理**: 合理设置管理员权限，考虑使用多签钱包
5. **资金安全**: 定期提取合约中的资金，避免大量资金滞留

## 故障排除

### 常见错误

1. **"Insufficient payment"**: 支付的 BNB 少于 0.01
2. **"Cannot refer yourself"**: 不能将自己设为推荐人
3. **"Max supply reached"**: 已达到最大供应量 10,000
4. **"No BNB rewards to claim"**: 没有可领取的 BNB 奖励

### 调试技巧

```bash
# 查看详细错误信息
npx hardhat run scripts/deploy.js --network bscTestnet --verbose

# 使用 Hardhat 控制台
npx hardhat console --network bscTestnet
```

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系 YesCoin 开发团队。