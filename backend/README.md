# YesCoin Backend API

一个基于 Node.js + Express + TypeScript + PostgreSQL 的 Web3 空投项目后端 API 系统。

## 🚀 功能特性

### 核心功能
- **用户系统**: 钱包连接、签名验证、用户注册/登录
- **任务跟踪**: 空投任务管理、完成状态跟踪
- **推荐系统**: 推荐链接处理、推荐关系管理
- **奖励系统**: NFT 铸造奖励、代币分发、BNB 佣金
- **空投领取**: 安全的代币领取逻辑、防重复领取

### 技术特性
- **类型安全**: 完整的 TypeScript 支持
- **数据库**: PostgreSQL + Prisma ORM
- **安全性**: JWT 认证、速率限制、输入验证
- **区块链**: 以太坊/BSC 智能合约集成
- **测试**: 单元测试 + 集成测试
- **部署**: Docker 容器化、CI/CD 流水线

## 📋 系统要求

- Node.js 18+
- PostgreSQL 15+
- Redis (可选，用于缓存和速率限制)
- Docker & Docker Compose (可选)

## 🛠️ 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd yescoin-backend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
vim .env
```

### 4. 数据库设置
```bash
# 初始化数据库
npm run db:init

# 或者手动执行
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

### 5. 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## 🐳 Docker 部署

### 开发环境
```bash
# 启动所有服务（API + PostgreSQL + Redis）
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down
```

### 生产环境
```bash
# 构建生产镜像
docker build -t yescoin-backend .

# 运行容器
docker run -d \
  --name yescoin-api \
  -p 3000:3000 \
  --env-file .env.production \
  yescoin-backend
```

## 📚 API 文档

### 认证端点
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `GET /api/users/stats` - 获取用户统计

### 任务端点
- `GET /api/tasks` - 获取任务列表
- `GET /api/tasks/user` - 获取用户任务状态
- `POST /api/tasks/complete` - 标记任务完成
- `GET /api/tasks/leaderboard` - 获取排行榜

### 空投端点
- `POST /api/airdrops/claim` - 领取空投
- `GET /api/airdrops/eligibility` - 检查领取资格
- `GET /api/airdrops/status` - 获取空投状态

### 推荐端点
- `POST /api/referrals` - 创建推荐关系
- `GET /api/referrals/stats` - 获取推荐统计
- `POST /api/referrals/claim-bnb` - 领取 BNB 奖励
- `GET /api/referrals/leaderboard` - 推荐排行榜

### 奖励端点
- `POST /api/rewards/nft-mint` - 处理 NFT 铸造奖励
- `POST /api/rewards/airdrop-claim` - 处理空投领取奖励
- `GET /api/rewards/pending` - 获取待处理奖励
- `GET /api/rewards/history` - 获取奖励历史

完整的 API 文档可在 `/api/docs` 查看。

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试并监听变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行特定测试文件
npm test -- userService.test.ts
```

## 📊 数据库模型

### User (用户)
- `address`: 钱包地址 (主键)
- `hasClaimed`: 是否已领取空投
- `referrer`: 推荐人地址
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### TaskCompletion (任务完成)
- `id`: 主键
- `userId`: 用户地址
- `taskId`: 任务 ID
- `completedAt`: 完成时间

### Referral (推荐关系)
- `id`: 主键
- `referrerId`: 推荐人地址
- `refereeId`: 被推荐人地址
- `createdAt`: 创建时间

### AirdropClaim (空投领取)
- `id`: 主键
- `userId`: 用户地址
- `amount`: 领取数量
- `txHash`: 交易哈希
- `claimedAt`: 领取时间

## 🔧 开发工具

### 代码质量
```bash
# ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# Prettier 格式化
npm run format

# TypeScript 类型检查
npm run check
```

### 数据库管理
```bash
# 生成 Prisma 客户端
npm run db:generate

# 创建新的迁移
npm run db:migrate

# 部署迁移到生产环境
npm run db:deploy

# 重置数据库
npm run db:reset

# 打开 Prisma Studio
npm run db:studio

# 运行种子数据
npm run db:seed
```

### 部署脚本
```bash
# 部署到开发环境
npm run deploy

# 部署到预发布环境
npm run deploy:staging

# 部署到生产环境
npm run deploy:production
```

## 🔒 安全配置

### 环境变量
确保以下敏感信息正确配置：
- `JWT_SECRET`: JWT 签名密钥
- `PRIVATE_KEY`: 区块链私钥
- `DATABASE_URL`: 数据库连接字符串
- `API_KEY`: 管理员 API 密钥

### 速率限制
- 注册/登录: 5 次/分钟
- 任务完成: 10 次/分钟
- 空投领取: 1 次/小时
- 一般 API: 100 次/分钟

### 安全头
- Helmet.js 安全头
- CORS 跨域配置
- 请求大小限制
- SQL 注入防护

## 📈 监控和日志

### 健康检查
- `GET /health` - 基础健康检查
- `GET /api/status` - 详细状态信息

### 日志级别
- `error`: 错误日志
- `warn`: 警告日志
- `info`: 信息日志
- `debug`: 调试日志

## 🚀 部署指南

### 环境准备
1. 设置 PostgreSQL 数据库
2. 配置环境变量
3. 设置 SSL 证书（生产环境）
4. 配置反向代理（Nginx）

### 部署步骤
1. 构建应用: `npm run build`
2. 运行迁移: `npm run db:deploy`
3. 启动服务: `npm start`

### 监控
- 使用 PM2 进行进程管理
- 配置日志轮转
- 设置性能监控
- 配置错误报警

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交 Pull Request

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 编写单元测试
- 更新文档

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 📞 支持

如有问题或建议，请：
- 提交 Issue
- 发送邮件至 support@yescoin.com
- 加入 Telegram 群组

---

**YesCoin Backend API** - 构建安全、可扩展的 Web3 空投系统 🚀