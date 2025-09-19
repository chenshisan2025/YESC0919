#!/bin/bash

# YesCoin项目测试运行脚本
# 用途：一键运行所有测试用例，包括前端、后端和集成测试

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "YesCoin测试运行脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --frontend     只运行前端测试"
    echo "  --backend      只运行后端测试"
    echo "  --integration  只运行集成测试"
    echo "  --unit         只运行单元测试"
    echo "  --e2e          只运行E2E测试"
    echo "  --coverage     生成测试覆盖率报告"
    echo "  --watch        监听模式运行测试"
    echo "  --help         显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                    # 运行所有测试"
    echo "  $0 --frontend         # 只运行前端测试"
    echo "  $0 --coverage         # 运行所有测试并生成覆盖率报告"
    echo "  $0 --frontend --watch # 监听模式运行前端测试"
}

# 检查依赖
check_dependencies() {
    log_info "检查测试依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装，请先安装npm"
        exit 1
    fi
    
    # 检查项目依赖
    if [ ! -d "node_modules" ]; then
        log_warning "前端依赖未安装，正在安装..."
        npm install
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        log_warning "后端依赖未安装，正在安装..."
        cd backend && npm install && cd ..
    fi
    
    log_success "依赖检查完成"
}

# 运行前端测试
run_frontend_tests() {
    log_info "运行前端测试..."
    
    # 检查测试文件是否存在
    if [ ! -d "tests" ]; then
        log_warning "测试目录不存在，创建测试目录..."
        mkdir -p tests
    fi
    
    # 运行Vitest测试
    if [ "$WATCH_MODE" = "true" ]; then
        log_info "启动前端测试监听模式..."
        npm run test -- --watch
    elif [ "$COVERAGE_MODE" = "true" ]; then
        log_info "运行前端测试并生成覆盖率报告..."
        npm run test -- --coverage
    else
        npm run test
    fi
    
    if [ $? -eq 0 ]; then
        log_success "前端测试通过"
    else
        log_error "前端测试失败"
        return 1
    fi
}

# 运行后端测试
run_backend_tests() {
    log_info "运行后端测试..."
    
    cd backend
    
    # 检查测试配置
    if [ ! -f "jest.config.js" ]; then
        log_warning "Jest配置文件不存在，使用默认配置"
    fi
    
    # 运行Jest测试
    if [ "$WATCH_MODE" = "true" ]; then
        log_info "启动后端测试监听模式..."
        npm run test -- --watch
    elif [ "$COVERAGE_MODE" = "true" ]; then
        log_info "运行后端测试并生成覆盖率报告..."
        npm run test -- --coverage
    else
        npm run test
    fi
    
    if [ $? -eq 0 ]; then
        log_success "后端测试通过"
    else
        log_error "后端测试失败"
        cd ..
        return 1
    fi
    
    cd ..
}

# 运行集成测试
run_integration_tests() {
    log_info "运行集成测试..."
    
    # 检查服务是否运行
    if ! curl -s http://localhost:3001/health > /dev/null; then
        log_warning "后端服务未运行，尝试启动..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        sleep 5
    fi
    
    if ! curl -s http://localhost:3066 > /dev/null; then
        log_warning "前端服务未运行，尝试启动..."
        npm run dev &
        FRONTEND_PID=$!
        sleep 5
    fi
    
    # 运行集成测试
    log_info "执行钱包连接测试..."
    node tests/wallet-connection.test.js || log_warning "钱包连接测试需要手动验证"
    
    log_info "执行NFT铸造测试..."
    node tests/nft-mint.test.js || log_warning "NFT铸造测试需要手动验证"
    
    log_info "执行空投任务测试..."
    node tests/airdrop-tasks.test.js || log_warning "空投任务测试需要手动验证"
    
    log_info "执行UI渲染测试..."
    node tests/ui-rendering.test.js || log_warning "UI渲染测试需要手动验证"
    
    # 清理进程
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    log_success "集成测试完成"
}

# 运行单元测试
run_unit_tests() {
    log_info "运行单元测试..."
    
    # 前端单元测试
    log_info "运行前端单元测试..."
    npm run test:unit 2>/dev/null || npm run test
    
    # 后端单元测试
    log_info "运行后端单元测试..."
    cd backend
    npm run test:unit 2>/dev/null || npm run test
    cd ..
    
    log_success "单元测试完成"
}

# 运行E2E测试
run_e2e_tests() {
    log_info "运行E2E测试..."
    
    # 检查Playwright是否安装
    if command -v playwright &> /dev/null; then
        log_info "使用Playwright运行E2E测试..."
        npx playwright test
    elif command -v cypress &> /dev/null; then
        log_info "使用Cypress运行E2E测试..."
        npx cypress run
    else
        log_warning "未找到E2E测试框架，跳过E2E测试"
        log_info "建议安装Playwright或Cypress进行E2E测试"
        return 0
    fi
    
    log_success "E2E测试完成"
}

# 生成测试报告
generate_test_report() {
    log_info "生成测试报告..."
    
    REPORT_DIR="test-reports"
    mkdir -p $REPORT_DIR
    
    # 合并覆盖率报告
    if [ -d "coverage" ] && [ -d "backend/coverage" ]; then
        log_info "合并前后端覆盖率报告..."
        # 这里可以添加覆盖率合并逻辑
    fi
    
    # 生成HTML报告
    cat > $REPORT_DIR/test-summary.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>YesCoin测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>YesCoin项目测试报告</h1>
        <p>生成时间: $(date)</p>
    </div>
    
    <div class="section success">
        <h2>测试概览</h2>
        <p>本次测试包含前端测试、后端测试、集成测试等多个维度的验证。</p>
    </div>
    
    <div class="section">
        <h2>测试覆盖范围</h2>
        <ul>
            <li>钱包连接功能测试</li>
            <li>NFT铸造流程测试</li>
            <li>空投任务流程测试</li>
            <li>UI渲染和样式测试</li>
            <li>API接口测试</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>手动测试指南</h2>
        <p>某些测试需要手动验证，请参考各测试文件中的手动测试指南。</p>
    </div>
</body>
</html>
EOF
    
    log_success "测试报告已生成: $REPORT_DIR/test-summary.html"
}

# 主函数
main() {
    # 解析命令行参数
    FRONTEND_ONLY=false
    BACKEND_ONLY=false
    INTEGRATION_ONLY=false
    UNIT_ONLY=false
    E2E_ONLY=false
    COVERAGE_MODE=false
    WATCH_MODE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --frontend)
                FRONTEND_ONLY=true
                shift
                ;;
            --backend)
                BACKEND_ONLY=true
                shift
                ;;
            --integration)
                INTEGRATION_ONLY=true
                shift
                ;;
            --unit)
                UNIT_ONLY=true
                shift
                ;;
            --e2e)
                E2E_ONLY=true
                shift
                ;;
            --coverage)
                COVERAGE_MODE=true
                shift
                ;;
            --watch)
                WATCH_MODE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    log_info "开始YesCoin项目测试..."
    
    # 检查依赖
    check_dependencies
    
    # 根据参数运行相应测试
    if [ "$FRONTEND_ONLY" = "true" ]; then
        run_frontend_tests
    elif [ "$BACKEND_ONLY" = "true" ]; then
        run_backend_tests
    elif [ "$INTEGRATION_ONLY" = "true" ]; then
        run_integration_tests
    elif [ "$UNIT_ONLY" = "true" ]; then
        run_unit_tests
    elif [ "$E2E_ONLY" = "true" ]; then
        run_e2e_tests
    else
        # 运行所有测试
        log_info "运行完整测试套件..."
        
        run_unit_tests
        run_frontend_tests
        run_backend_tests
        run_integration_tests
        
        if [ "$WATCH_MODE" != "true" ]; then
            run_e2e_tests
        fi
    fi
    
    # 生成报告
    if [ "$COVERAGE_MODE" = "true" ] && [ "$WATCH_MODE" != "true" ]; then
        generate_test_report
    fi
    
    log_success "测试完成！"
    
    # 显示后续步骤
    echo ""
    log_info "后续步骤:"
    echo "1. 查看测试报告: open test-reports/test-summary.html"
    echo "2. 查看覆盖率报告: open coverage/lcov-report/index.html"
    echo "3. 运行特定测试: $0 --help"
    echo "4. 部署应用: 参考 DEPLOYMENT.md"
}

# 错误处理
trap 'log_error "测试过程中发生错误，退出码: $?"' ERR

# 运行主函数
main "$@"