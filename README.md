# Click Book - 3D翻页电子书在线制作平台

## 项目介绍

一个高端、现代化的3D翻页电子书在线制作平台，支持PDF和图片上传，提供丰富的编辑功能，让用户轻松创建专业的电子书作品。

## 功能特性

- 📚 **多格式支持**：支持PDF、图片等多种格式上传
- ✏️ **富文本编辑**：强大的文本编辑功能，支持字体、颜色、样式等自定义
- 🎵 **音乐管理**：支持添加背景音乐，自定义播放行为
- 📱 **响应式设计**：完美适配手机、平板、电脑等多种设备
- 🎨 **高端UI**：简洁优雅的苹果风格界面
- 👤 **用户系统**：完整的登录、注册、权限管理
- 💎 **会员系统**：支持免费和付费功能区分
- 🔗 **在线分享**：一键生成分享链接

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- TailwindCSS
- Zustand (状态管理)
- React Router (路由)
- StPageFlip (3D翻页效果)

### 后端
- Node.js + Express + TypeScript
- MongoDB (数据库)
- JWT (身份认证)
- Multer (文件上传)
- PDF.js (PDF处理)

## 项目结构

```
click-book/
├── frontend/          # 前端应用
├── backend/           # 后端API
├── shared/            # 共享类型定义
└── 开发文档/          # 项目文档
```

## 快速开始

### 环境要求
- Node.js >= 18
- MongoDB >= 5.0

### 三步启动

1. **安装依赖**
   ```bash
   ./scripts/install.sh
   # 或手动安装：npm install
   ```

2. **启动 MongoDB**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **启动应用**
   ```bash
   npm run dev
   ```

**访问地址**
- 前端：http://localhost:5173
- 后端 API：http://localhost:3000/api

### 详细文档

- 📖 [快速入门指南](./QUICKSTART.md) - 5分钟上手
- 📚 [完整安装指南](./SETUP.md) - 详细说明

## 开发进度

- [x] 项目初始化
- [x] 用户认证系统（注册、登录、JWT）
- [x] 文件上传功能（PDF、图片、音频）
- [x] PDF转图片功能
- [x] 编辑器工作台界面
- [x] 页面列表管理
- [x] 文本编辑功能（添加、编辑、样式设置）
- [x] 音乐管理功能（音乐库、上传、设置）
- [x] 3D翻页效果（基础版）
- [x] 作品发布与分享
- [x] 我的作品列表
- [x] 在线阅读器
- [x] 会员和积分系统（数据模型）
- [x] 响应式设计（高端苹果风格）

## License

MIT

