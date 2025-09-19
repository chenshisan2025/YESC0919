# YesCoin 前端项目

基于 React + Vite + Tailwind CSS +（可选）Framer Motion 的像素风 Web3 网站，实现首页、代币信息、NFT、空投、FAQ 等页面与交互。

## 运行环境
- Node.js >= 16（推荐 LTS 18+）
- npm（或 pnpm / yarn）

## 本地开发
```bash
npm install
npm run dev
# 打开 http://localhost:5173
```

## 生产构建
```bash
npm run build
npm run preview
# 打开 http://localhost:8080 进行预览
```

## 部署到 Vercel
1. 将本项目推送到 GitHub 仓库。
2. 登录 Vercel，点击 **New Project**，导入该仓库。
3. 构建命令：`npm run build`；输出目录：`dist`（已在 vercel.json 指定）。
4. 部署完成后将获得访问域名。
5. 已在 `vercel.json` 中配置了 SPA 路由重写，确保 `/nft`、`/airdrop` 等内部路由可直接访问。

## 设计规范（摘要）
- 8-bit 复古像素风；暖米白主题。
- 色彩：
  - 背景：#F8F2ED
  - 卡片：#EFE8E1
  - 主文字/边框：#4A423B
  - 主按钮（CTA）：#FFD700
  - 次按钮：#F28C28
  - 进度/强调：#FF0077
- 字体：Press Start 2P（标题）、Silkscreen（正文）、ZCOOL KuaiLe（中文）。
- 动效：按钮悬停放大 + 像素阴影；导航下划线；NFT 进度条动画；FAQ 手风琴。

## 字体与图像
- 字体通过 Google Fonts 在 `index.html` 中引入。
- 所有图像在 `src/assets/`，为像素风 SVG 占位，可替换为正式素材。
- 建议保留 `image-rendering: pixelated;` 以保持像素质感。

## 说明
- 本项目为前端静态站点，`连接钱包`、`铸造`、`空投校验/领取` 皆为前端 **模拟交互**，后续可接入真实链上与后端服务。
