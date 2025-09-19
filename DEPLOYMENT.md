# YesCoin 项目完整部署指南

本文档提供YesCoin项目的完整部署指南，包括智能合约、后端服务和前端应用的部署流程。

## 📋 目录

- [项目概述](#项目概述)
- [部署架构](#部署架构)
- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [智能合约部署](#智能合约部署)
- [后端服务部署](#后端服务部署)
- [前端应用部署](#前端应用部署)
- [环境配置](#环境配置)
- [测试验证](#测试验证)
- [生产环境部署](#生产环境部署)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🎯 项目概述

YesCoin是一个基于BSC（Binance Smart Chain）的Web3项目，包含以下核心功能：

- **YesCoin代币 (YES)**: ERC-20标准代币
- **Guardian NFT**: 守护者NFT收藏品
- **空投系统**: 基于任务的代币空投
- **推荐系统**: NFT铸造推荐奖励
- **钱包连接**: MetaMask和WalletConnect支持

### 技术栈

- **前端**: React + Vite + Tailwind CSS
- **后端**: Node.js + Express + Prisma
- **数据库**: PostgreSQL
- **区块链**: BSC (Binance Smart Chain)
- **智能合约**: Solidity + Hardhat

## 🏗️ 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端API       │    │   智能合约      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Solidity)    │
│   Port: 5173    │    │   Port: 3001    │    │   BSC Network   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web服务器     │    │   数据库        │    │   区块链浏览器  │
│   (Nginx)       │    │   (PostgreSQL)  │    │   (BSCScan)     │
│   Port: 80/443  │    │   Port: 5432    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💻 环境要求

### 开发环境
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **Git**: 最新版本
- **MetaMask**: 浏览器扩展

### 生产环境
- **服务器**: Ubuntu 20.04+ / CentOS 8+
- **CPU**: 4核心（推荐）
- **内存**: 8GB RAM（推荐）
- **存储**: 50GB SSD
- **PostgreSQL**: 14.x+
- **Nginx**: 1.18+

### 区块链环境
- **BSC测试网**: Chain ID 97
- **BSC主网**: Chain ID 56
- **BNB余额**: 至少0.1 BNB用于部署

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-org/yescoin.git
cd yescoin
```

### 2. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env
cp backend/.env.example backend/.env

# 编辑环境变量
nano .env
nano backend/.env
```

### 4. 启动开发环境

```bash
# 启动后端服务
cd backend
npm run dev &
cd ..

# 启动前端应用
npm run dev
```

## 🔗 智能合约部署

### 1. 环境准备

```bash
# 安装Hardhat依赖
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers ethers

# 配置私钥（.env文件）
PRIVATE_KEY=your_private_key_here
```

### 2. 编译合约

```bash
# 编译智能合约
npx hardhat compile

# 检查编译结果
ls artifacts/contracts/
```

### 3. 部署到测试网

```bash
# 部署到BSC测试网
npx hardhat run scripts/deploy-complete.js --network bscTestnet

# 查看部署结果
cat deployments/deployment-bscTestnet-*.json
```

### 4. 部署到主网

```bash
# 部署到BSC主网（谨慎操作）
npx hardhat run scripts/deploy-complete.js --network bscMainnet

# 验证合约
npx hardhat verify --network bscMainnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### 5. 更新环境变量

部署完成后，更新环境变量文件：

```env
# 前端环境变量 (.env)
VITE_YES_TOKEN_ADDRESS=0x...
VITE_GUARDIAN_NFT_ADDRESS=0x...
VITE_AIRDROP_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=97
VITE_NETWORK_NAME=bscTestnet

# 后端环境变量 (backend/.env)
YES_TOKEN_ADDRESS=0x...
GUARDIAN_NFT_ADDRESS=0x...
AIRDROP_CONTRACT_ADDRESS=0x...
```

## 🖥️ 后端服务部署

### 1. 数据库设置

```bash
# 安装PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库
sudo -u postgres psql
CREATE USER yescoin_user WITH PASSWORD 'secure_password';
CREATE DATABASE yescoin_db OWNER yescoin_user;
GRANT ALL PRIVILEGES ON DATABASE yescoin_db TO yescoin_user;
\q
```

### 2. 配置环境变量

```bash
cd backend
cp .env.example .env
nano .env
```

```env
# 数据库配置
DATABASE_URL="postgresql://yescoin_user:secure_password@localhost:5432/yescoin_db"

# 服务器配置
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com

# JWT配置
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# 区块链配置
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
PRIVATE_KEY=your_private_key_here

# 合约地址
YES_TOKEN_ADDRESS=0x...
GUARDIAN_NFT_ADDRESS=0x...
AIRDROP_CONTRACT_ADDRESS=0x...
```

### 3. 数据库迁移

```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 填充初始数据
npm run seed
```

### 4. 启动服务

```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start

# 使用PM2（推荐）
npm install -g pm2
pm2 start ecosystem.config.js
```

### 5. 健康检查

```bash
# 测试API
curl http://localhost:3001/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

## 🌐 前端应用部署

### 1. 环境配置

```bash
# 配置环境变量
cp .env.example .env
nano .env
```

```env
# API配置
VITE_API_BASE_URL=https://api.your-domain.com

# 区块链配置
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=bscMainnet
VITE_RPC_URL=https://bsc-dataseed1.binance.org/

# 合约地址
VITE_YES_TOKEN_ADDRESS=0x...
VITE_GUARDIAN_NFT_ADDRESS=0x...
VITE_AIRDROP_CONTRACT_ADDRESS=0x...

# WalletConnect配置
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# 应用配置
VITE_APP_NAME=YesCoin
VITE_APP_DESCRIPTION=YesCoin Web3 Platform
```

### 2. 构建应用

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 3. 部署到Vercel

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod

# 配置环境变量
vercel env add VITE_API_BASE_URL
vercel env add VITE_YES_TOKEN_ADDRESS
# ... 添加其他环境变量
```

### 4. 部署到Nginx

```bash
# 复制构建文件
sudo cp -r dist/* /var/www/yescoin/

# 配置Nginx
sudo nano /etc/nginx/sites-available/yescoin
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/yescoin;
    index index.html;
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/yescoin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## ⚙️ 环境配置

### 开发环境配置

```bash
# .env (前端)
VITE_API_BASE_URL=http://localhost:3001
VITE_CHAIN_ID=97
VITE_NETWORK_NAME=bscTestnet
VITE_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/

# backend/.env (后端)
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://user:pass@localhost:5432/yescoin_dev"
```

### 测试环境配置

```bash
# .env.staging (前端)
VITE_API_BASE_URL=https://api-staging.your-domain.com
VITE_CHAIN_ID=97
VITE_NETWORK_NAME=bscTestnet

# backend/.env.staging (后端)
NODE_ENV=staging
PORT=3001
CORS_ORIGIN=https://staging.your-domain.com
DATABASE_URL="postgresql://user:pass@staging-db:5432/yescoin_staging"
```

### 生产环境配置

```bash
# .env.production (前端)
VITE_API_BASE_URL=https://api.your-domain.com
VITE_CHAIN_ID=56
VITE_NETWORK_NAME=bscMainnet

# backend/.env.production (后端)
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com
DATABASE_URL="postgresql://user:pass@prod-db:5432/yescoin_prod"
```

## ✅ 测试验证

### 1. 智能合约测试

```bash
# 运行合约测试
npx hardhat test

# 测试覆盖率
npx hardhat coverage

# 部署后验证
npx hardhat run scripts/verify-deployment.js --network bscTestnet
```

### 2. 后端API测试

```bash
# 运行单元测试
cd backend
npm test

# 运行集成测试
npm run test:integration

# API健康检查
curl http://localhost:3001/health
```

### 3. 前端功能测试

```bash
# 运行前端测试
npm test

# E2E测试
npm run test:e2e

# 构建测试
npm run build
```

### 4. 端到端测试流程

1. **钱包连接测试**
   - 连接MetaMask钱包
   - 切换到BSC网络
   - 验证钱包地址显示

2. **NFT铸造测试**
   - 访问NFT页面
   - 连接钱包并铸造NFT
   - 验证交易成功
   - 检查NFT余额更新

3. **空投任务测试**
   - 完成社交任务
   - 验证任务状态更新
   - 尝试领取空投
   - 检查代币余额

4. **推荐系统测试**
   - 使用推荐链接铸造NFT
   - 验证推荐人奖励
   - 检查数据库记录

## 🏭 生产环境部署

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y nginx postgresql redis-server certbot python3-certbot-nginx

# 配置防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. SSL证书配置

```bash
# 获取SSL证书
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. 数据库备份

```bash
# 创建备份脚本
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +"%Y%m%d_%H%M%S")
DATABASE="yescoin_db"

mkdir -p $BACKUP_DIR
pg_dump -U yescoin_user -h localhost $DATABASE | gzip > $BACKUP_DIR/backup_${DATE}.sql.gz

# 保留最近30天的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

```bash
# 设置权限和定时任务
sudo chmod +x /usr/local/bin/backup-db.sh
sudo crontab -e
# 添加: 0 2 * * * /usr/local/bin/backup-db.sh
```

### 4. 监控配置

```bash
# 安装监控工具
sudo apt install -y htop iotop nethogs

# 配置日志监控
sudo nano /etc/logrotate.d/yescoin
```

```
/var/log/yescoin/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
        pm2 reload all
    endscript
}
```

## 📊 监控和维护

### 1. 系统监控

```bash
# 创建监控脚本
sudo nano /usr/local/bin/system-monitor.sh
```

```bash
#!/bin/bash

# 检查服务状态
services=("nginx" "postgresql" "redis-server")
for service in "${services[@]}"; do
    if ! systemctl is-active --quiet $service; then
        echo "⚠️ $service is not running" | logger -t yescoin-monitor
        systemctl restart $service
    fi
done

# 检查磁盘空间
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 80 ]; then
    echo "⚠️ Disk usage is ${disk_usage}%" | logger -t yescoin-monitor
fi

# 检查内存使用
mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $mem_usage -gt 80 ]; then
    echo "⚠️ Memory usage is ${mem_usage}%" | logger -t yescoin-monitor
fi
```

### 2. 应用监控

```bash
# PM2监控配置
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# 启用PM2监控
pm2 monitor
```

### 3. 性能优化

```bash
# 数据库优化
sudo nano /etc/postgresql/14/main/postgresql.conf
```

```
# 内存配置
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# 连接配置
max_connections = 100

# 日志配置
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
```

### 4. 安全维护

```bash
# 定期更新
sudo apt update && sudo apt upgrade -y

# 检查安全漏洞
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 配置fail2ban
sudo apt install -y fail2ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. 合约部署失败

```bash
# 检查网络连接
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  https://bsc-dataseed1.binance.org/

# 检查账户余额
npx hardhat run scripts/check-balance.js --network bscTestnet

# 检查Gas价格
npx hardhat run scripts/check-gas.js --network bscTestnet
```

#### 2. 数据库连接问题

```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查连接
psql -h localhost -U yescoin_user -d yescoin_db

# 重置连接
sudo systemctl restart postgresql
```

#### 3. 前端构建失败

```bash
# 清理缓存
npm run clean
rm -rf node_modules package-lock.json
npm install

# 检查环境变量
echo $VITE_API_BASE_URL

# 重新构建
npm run build
```

#### 4. API响应慢

```bash
# 检查数据库性能
psql -U yescoin_user -d yescoin_db -c "SELECT * FROM pg_stat_activity;"

# 检查慢查询
psql -U yescoin_user -d yescoin_db -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 重启服务
pm2 restart yescoin-backend
```

### 紧急恢复流程

#### 1. 数据库恢复

```bash
# 停止应用
pm2 stop all

# 恢复数据库
psql -U yescoin_user -d yescoin_db < /var/backups/postgresql/backup_latest.sql

# 重启服务
pm2 start all
```

#### 2. 回滚部署

```bash
# Git回滚
git log --oneline -10
git reset --hard <commit_hash>

# 重新部署
npm run build
pm2 restart all
```

#### 3. 紧急维护模式

```bash
# 启用维护页面
sudo cp /var/www/maintenance.html /var/www/yescoin/index.html

# 修复问题后恢复
sudo cp /var/www/yescoin-backup/index.html /var/www/yescoin/index.html
```

## 📞 技术支持

### 联系方式
- **GitHub Issues**: https://github.com/your-org/yescoin/issues
- **技术文档**: https://docs.yescoin.com
- **社区论坛**: https://forum.yescoin.com

### 日志收集

在报告问题时，请提供以下日志：

```bash
# 应用日志
pm2 logs yescoin-backend --lines 100

# 系统日志
sudo journalctl -u nginx -n 100
sudo journalctl -u postgresql -n 100

# 错误日志
tail -100 /var/log/yescoin/error.log
```

---

**注意**: 请确保在生产环境中遵循安全最佳实践，包括使用强密码、启用防火墙、定期更新系统和依赖包。