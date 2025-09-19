#!/bin/bash
# YesCoin后端服务器启动脚本
# 用于启动Express后端服务和相关服务

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
BACKEND_DIR="$PROJECT_ROOT/backend"

echo -e "${BLUE}🚀 YesCoin后端服务启动脚本${NC}"
echo -e "${BLUE}================================${NC}"

# 检查Node.js环境
check_node() {
    echo -e "${YELLOW}📋 检查Node.js环境...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js未安装，请先安装Node.js${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js版本: $NODE_VERSION${NC}"
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm未安装${NC}"
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm版本: $NPM_VERSION${NC}"
}

# 检查环境变量
check_env() {
    echo -e "\n${YELLOW}🔧 检查环境变量...${NC}"
    
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        echo -e "${RED}❌ .env文件不存在${NC}"
        echo -e "${YELLOW}💡 请复制.env.example并配置环境变量${NC}"
        
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            echo -e "${BLUE}📋 可用的环境变量模板:${NC}"
            cat "$PROJECT_ROOT/.env.example"
        fi
        
        exit 1
    fi
    
    echo -e "${GREEN}✅ .env文件存在${NC}"
    
    # 加载环境变量
    source "$PROJECT_ROOT/.env"
    
    # 检查必需的环境变量
    REQUIRED_VARS=(
        "API_PORT"
        "DATABASE_URL"
        "VITE_YESCOIN_CONTRACT"
        "VITE_GUARDIAN_NFT_CONTRACT"
        "VITE_AIRDROP_CONTRACT"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}❌ 缺少环境变量: $var${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ $var: ${!var}${NC}"
        fi
    done
}

# 检查数据库连接
check_database() {
    echo -e "\n${YELLOW}🗄️ 检查数据库连接...${NC}"
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL未设置${NC}"
        exit 1
    fi
    
    # 尝试连接数据库（需要安装postgresql客户端）
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            echo -e "${GREEN}✅ 数据库连接成功${NC}"
        else
            echo -e "${RED}❌ 数据库连接失败${NC}"
            echo -e "${YELLOW}💡 请检查DATABASE_URL配置和数据库服务状态${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️ psql未安装，跳过数据库连接测试${NC}"
    fi
}

# 安装依赖
install_dependencies() {
    echo -e "\n${YELLOW}📦 安装后端依赖...${NC}"
    
    cd "$BACKEND_DIR"
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ backend/package.json不存在${NC}"
        exit 1
    fi
    
    # 检查是否需要安装依赖
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo -e "${BLUE}📥 安装npm依赖...${NC}"
        npm install
        echo -e "${GREEN}✅ 依赖安装完成${NC}"
    else
        echo -e "${GREEN}✅ 依赖已是最新${NC}"
    fi
}

# 运行数据库迁移
run_migrations() {
    echo -e "\n${YELLOW}🔄 运行数据库迁移...${NC}"
    
    cd "$BACKEND_DIR"
    
    if npm run migrate:check &> /dev/null; then
        echo -e "${BLUE}📊 检查迁移状态...${NC}"
        npm run migrate:status
        
        echo -e "${BLUE}🔄 执行迁移...${NC}"
        npm run migrate:up
        echo -e "${GREEN}✅ 数据库迁移完成${NC}"
    else
        echo -e "${YELLOW}⚠️ 迁移脚本不存在，跳过迁移${NC}"
    fi
}

# 启动后端服务
start_backend() {
    echo -e "\n${YELLOW}🚀 启动后端服务...${NC}"
    
    cd "$BACKEND_DIR"
    
    # 检查端口是否被占用
    if [ ! -z "$API_PORT" ]; then
        if lsof -Pi :$API_PORT -sTCP:LISTEN -t >/dev/null; then
            echo -e "${RED}❌ 端口 $API_PORT 已被占用${NC}"
            echo -e "${YELLOW}💡 请停止占用端口的进程或更改API_PORT${NC}"
            lsof -Pi :$API_PORT -sTCP:LISTEN
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ 端口 $API_PORT 可用${NC}"
    
    # 选择启动模式
    if [ "$NODE_ENV" = "production" ]; then
        echo -e "${BLUE}🏭 生产模式启动...${NC}"
        npm run start
    else
        echo -e "${BLUE}🔧 开发模式启动...${NC}"
        npm run dev
    fi
}

# 健康检查
health_check() {
    echo -e "\n${YELLOW}🏥 服务健康检查...${NC}"
    
    local max_attempts=30
    local attempt=1
    local health_url="http://localhost:${API_PORT:-3001}/health"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 后端服务健康检查通过${NC}"
            echo -e "${GREEN}🌐 API地址: $health_url${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ 等待服务启动... ($attempt/$max_attempts)${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ 服务健康检查失败${NC}"
    return 1
}

# 显示服务信息
show_service_info() {
    echo -e "\n${GREEN}🎉 后端服务启动成功!${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "${GREEN}📋 服务信息:${NC}"
    echo -e "  - API地址: http://localhost:${API_PORT:-3001}"
    echo -e "  - 健康检查: http://localhost:${API_PORT:-3001}/health"
    echo -e "  - API文档: http://localhost:${API_PORT:-3001}/docs"
    echo -e "  - 环境: ${NODE_ENV:-development}"
    echo -e "  - 数据库: ${DATABASE_URL}"
    echo -e ""
    echo -e "${GREEN}🔗 主要API端点:${NC}"
    echo -e "  - GET  /api/tasks - 获取任务列表"
    echo -e "  - POST /api/tasks/:id/complete - 完成任务"
    echo -e "  - POST /api/airdrop/claim - 领取空投"
    echo -e "  - GET  /api/referrals/:address - 获取推荐信息"
    echo -e "  - POST /api/nft/mint - NFT铸造记录"
    echo -e ""
    echo -e "${YELLOW}💡 提示:${NC}"
    echo -e "  - 使用 Ctrl+C 停止服务"
    echo -e "  - 日志文件位置: backend/logs/"
    echo -e "  - 配置文件位置: .env"
    echo -e "${BLUE}================================${NC}"
}

# 错误处理
handle_error() {
    echo -e "\n${RED}❌ 启动过程中发生错误${NC}"
    echo -e "${YELLOW}🔧 故障排除建议:${NC}"
    echo -e "  1. 检查.env文件配置"
    echo -e "  2. 确认数据库服务运行正常"
    echo -e "  3. 检查端口是否被占用"
    echo -e "  4. 查看详细错误日志"
    echo -e "  5. 重新安装依赖: cd backend && npm install"
    echo -e ""
    echo -e "${BLUE}📞 获取帮助:${NC}"
    echo -e "  - 查看README.md文档"
    echo -e "  - 检查backend/logs/error.log"
    echo -e "  - 运行: npm run test 检查配置"
    exit 1
}

# 主函数
main() {
    # 设置错误处理
    trap 'handle_error' ERR
    
    # 执行检查和启动流程
    check_node
    check_env
    check_database
    install_dependencies
    run_migrations
    
    echo -e "\n${GREEN}🎯 所有检查通过，启动服务...${NC}"
    
    # 在后台启动服务
    start_backend &
    BACKEND_PID=$!
    
    # 等待服务启动
    sleep 5
    
    # 健康检查
    if health_check; then
        show_service_info
        
        # 等待用户中断
        echo -e "\n${YELLOW}⏸️ 按 Ctrl+C 停止服务${NC}"
        wait $BACKEND_PID
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
}

# 帮助信息
show_help() {
    echo "YesCoin后端服务启动脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -c, --check    仅执行环境检查"
    echo "  -d, --dev      强制开发模式"
    echo "  -p, --prod     强制生产模式"
    echo ""
    echo "环境变量:"
    echo "  NODE_ENV       运行环境 (development/production)"
    echo "  API_PORT       API服务端口 (默认: 3001)"
    echo "  DATABASE_URL   数据库连接字符串"
    echo ""
    echo "示例:"
    echo "  $0              # 正常启动"
    echo "  $0 --check     # 仅检查环境"
    echo "  $0 --dev       # 开发模式启动"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -c|--check)
            echo -e "${BLUE}🔍 仅执行环境检查...${NC}"
            check_node
            check_env
            check_database
            echo -e "${GREEN}✅ 环境检查完成${NC}"
            exit 0
            ;;
        -d|--dev)
            export NODE_ENV="development"
            echo -e "${YELLOW}🔧 强制开发模式${NC}"
            ;;
        -p|--prod)
            export NODE_ENV="production"
            echo -e "${BLUE}🏭 强制生产模式${NC}"
            ;;
        *)
            echo -e "${RED}❌ 未知选项: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    shift
done

# 执行主函数
main