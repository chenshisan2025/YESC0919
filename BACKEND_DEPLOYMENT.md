# YesCoin 后端部署指南

本文档提供YesCoin项目后端服务的完整部署说明，包括环境配置、数据库设置、服务启动等。

## 📋 目录

- [系统要求](#系统要求)
- [环境准备](#环境准备)
- [数据库配置](#数据库配置)
- [环境变量配置](#环境变量配置)
- [依赖安装](#依赖安装)
- [数据库迁移](#数据库迁移)
- [服务启动](#服务启动)
- [部署验证](#部署验证)
- [生产环境部署](#生产环境部署)
- [故障排除](#故障排除)

## 🖥️ 系统要求

### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+

### 推荐配置
- **CPU**: 4核心
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **操作系统**: Ubuntu 22.04 LTS

### 软件依赖
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **PostgreSQL**: 14.x 或更高版本
- **Redis**: 6.x 或更高版本（可选，用于缓存）

## 🛠️ 环境准备

### 1. 安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# macOS (使用 Homebrew)
brew install node@18
```

### 2. 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# macOS (使用 Homebrew)
brew install postgresql
brew services start postgresql
```

### 3. 安装 Redis（可选）

```bash
# Ubuntu/Debian
sudo apt install redis-server

# CentOS/RHEL
sudo yum install redis
sudo systemctl enable redis
sudo systemctl start redis

# macOS (使用 Homebrew)
brew install redis
brew services start redis
```

## 🗄️ 数据库配置

### 1. 创建数据库用户

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL 命令行中执行
CREATE USER yescoin_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE yescoin_db OWNER yescoin_user;
GRANT ALL PRIVILEGES ON DATABASE yescoin_db TO yescoin_user;
\q
```

### 2. 配置 PostgreSQL 连接

编辑 PostgreSQL 配置文件：

```bash
# 编辑 pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# 添加以下行（根据需要调整）
local   yescoin_db    yescoin_user                     md5
host    yescoin_db    yescoin_user    127.0.0.1/32     md5
```

重启 PostgreSQL：

```bash
sudo systemctl restart postgresql
```

### 3. 测试数据库连接

```bash
psql -h localhost -U yescoin_user -d yescoin_db
```

## ⚙️ 环境变量配置

### 1. 复制环境变量模板

```bash
cd backend
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件：

```bash
nano .env
```

### 3. 环境变量说明

```env
# 服务器配置
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# 数据库配置
DATABASE_URL="postgresql://yescoin_user:your_secure_password@localhost:5432/yescoin_db"
DIRECT_URL="postgresql://yescoin_user:your_secure_password@localhost:5432/yescoin_db"

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 区块链配置
BSC_RPC_URL=https://bsc-dataseed1.binance.org/
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
PRIVATE_KEY=your_private_key_here

# 合约地址（部署后更新）
YES_TOKEN_ADDRESS=0x...
GUARDIAN_NFT_ADDRESS=0x...
AIRDROP_CONTRACT_ADDRESS=0x...

# Redis 配置（可选）
REDIS_URL=redis://localhost:6379

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### 4. 安全注意事项

- 使用强密码和随机密钥
- 不要在版本控制中提交 `.env` 文件
- 定期轮换密钥和密码
- 使用环境变量管理工具（如 HashiCorp Vault）

## 📦 依赖安装

### 1. 安装项目依赖

```bash
cd backend
npm install
```

### 2. 安装全局工具（可选）

```bash
npm install -g pm2  # 进程管理器
npm install -g prisma  # 数据库工具
```

## 🔄 数据库迁移

### 1. 生成 Prisma 客户端

```bash
npx prisma generate
```

### 2. 运行数据库迁移

```bash
npx prisma migrate deploy
```

### 3. 填充初始数据

```bash
npm run seed
```

### 4. 验证数据库结构

```bash
npx prisma studio
# 在浏览器中打开 http://localhost:5555 查看数据库
```

## 🚀 服务启动

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 或使用 nodemon
npm run start:dev
```

### 生产环境

#### 方式1: 直接启动

```bash
npm run build
npm start
```

#### 方式2: 使用 PM2

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart yescoin-backend

# 停止应用
pm2 stop yescoin-backend
```

#### PM2 配置文件 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'yescoin-backend',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

## ✅ 部署验证

### 1. 健康检查

```bash
# 检查服务状态
curl http://localhost:3001/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "redis": "connected"
}
```

### 2. API 测试

```bash
# 测试用户注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "signature": "0xabcdef..."
  }'

# 测试任务列表
curl http://localhost:3001/api/tasks

# 测试NFT信息
curl http://localhost:3001/api/nft/stats
```

### 3. 数据库连接测试

```bash
# 使用 Prisma 测试
npx prisma db pull

# 检查表结构
psql -h localhost -U yescoin_user -d yescoin_db -c "\dt"
```

## 🌐 生产环境部署

### 1. 使用 Docker 部署

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --only=production

# 生成 Prisma 客户端
RUN npx prisma generate

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 设置权限
USER nextjs

EXPOSE 3001

CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://yescoin_user:password@postgres:5432/yescoin_db
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14
    environment:
      - POSTGRES_DB=yescoin_db
      - POSTGRES_USER=yescoin_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 部署命令

```bash
# 构建和启动
docker-compose up -d

# 运行数据库迁移
docker-compose exec backend npx prisma migrate deploy

# 查看日志
docker-compose logs -f backend
```

### 2. 使用 Nginx 反向代理

#### Nginx 配置

```nginx
server {
    listen 80;
    server_name api.yescoin.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yescoin.com;
    
    # SSL 证书配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # 代理配置
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 文件上传大小限制
    client_max_body_size 10M;
    
    # 日志配置
    access_log /var/log/nginx/yescoin_access.log;
    error_log /var/log/nginx/yescoin_error.log;
}
```

### 3. 监控和日志

#### 日志配置

```bash
# 创建日志目录
sudo mkdir -p /var/log/yescoin
sudo chown $USER:$USER /var/log/yescoin

# 配置日志轮转
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
    create 644 $USER $USER
    postrotate
        pm2 reload yescoin-backend
    endscript
}
```

#### 监控脚本

```bash
#!/bin/bash
# health-check.sh

API_URL="http://localhost:3001/health"
SLACK_WEBHOOK="your_slack_webhook_url"

response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -ne 200 ]; then
    message="🚨 YesCoin Backend Health Check Failed - HTTP $response"
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$message\"}" \
        $SLACK_WEBHOOK
    
    # 尝试重启服务
    pm2 restart yescoin-backend
fi
```

```bash
# 添加到 crontab
crontab -e

# 每5分钟检查一次
*/5 * * * * /path/to/health-check.sh
```

## 🔧 故障排除

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查端口是否开放
sudo netstat -tlnp | grep 5432

# 测试连接
psql -h localhost -U yescoin_user -d yescoin_db
```

#### 2. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3001

# 杀死进程
sudo kill -9 <PID>
```

#### 3. 内存不足

```bash
# 检查内存使用
free -h

# 检查进程内存使用
top -p $(pgrep -f "node")

# 增加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. 权限问题

```bash
# 检查文件权限
ls -la /path/to/yescoin/backend

# 修复权限
sudo chown -R $USER:$USER /path/to/yescoin/backend
sudo chmod -R 755 /path/to/yescoin/backend
```

### 日志分析

```bash
# 查看应用日志
pm2 logs yescoin-backend

# 查看系统日志
sudo journalctl -u postgresql
sudo journalctl -u nginx

# 查看错误日志
tail -f /var/log/yescoin/error.log

# 搜索特定错误
grep -r "ERROR" /var/log/yescoin/
```

### 性能优化

#### 1. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_tasks_user_id ON user_tasks(user_id);
CREATE INDEX idx_nft_owner ON nft_tokens(owner_address);

-- 分析查询性能
EXPLAIN ANALYZE SELECT * FROM users WHERE wallet_address = '0x...';
```

#### 2. 应用优化

```javascript
// 启用压缩
app.use(compression());

// 设置缓存头
app.use('/static', express.static('public', {
  maxAge: '1d',
  etag: false
}));

// 限制请求频率
const rateLimit = require('express-rate-limit');
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
}));
```

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 检查应用和系统日志
3. 在项目 GitHub 仓库提交 Issue
4. 联系技术支持团队

---

**注意**: 请确保在生产环境中使用强密码、启用防火墙、定期更新系统和依赖包，以保证系统安全。