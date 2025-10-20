# Click Book - 快速入门指南 🚀

欢迎使用 Click Book！这是一个5分钟快速入门指南。

## 系统要求

- ✅ Node.js 18 或更高版本
- ✅ MongoDB 5.0 或更高版本
- ✅ 8GB RAM（推荐）

## 快速开始（3步）

### 步骤 1: 安装依赖

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

或手动安装：

```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 步骤 2: 启动 MongoDB

#### ⚠️ Apple Silicon (M1/M2/M3) Mac 用户注意

如果您使用的是 Apple Silicon Mac，请确保：

1. **使用 ARM64 版本的 Homebrew**：
   ```bash
   # 检查 Homebrew 位置
   which brew
   # 应该显示：/opt/homebrew/bin/brew
   
   # 如果显示 /usr/local/bin/brew，需要安装 ARM64 版本：
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. **安装 ARM64 版本的 MongoDB**：
   ```bash
   /opt/homebrew/bin/brew tap mongodb/brew
   /opt/homebrew/bin/brew install mongodb-community@7.0
   ```

#### 启动 MongoDB

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community@7.0

# 或者 Apple Silicon Mac：
/opt/homebrew/bin/brew services start mongodb-community@7.0

# Linux
sudo systemctl start mongod

# Windows
# 在服务中启动 MongoDB
```

验证 MongoDB 正在运行：

```bash
mongosh --eval "db.version()"
```

### 步骤 3: 启动应用

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

或手动启动：

```bash
npm run dev
```

## 访问应用

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000/api
- **健康检查**: http://localhost:3000/api/health

## 第一次使用

### 1. 注册账号

1. 打开浏览器访问 http://localhost:5173
2. 点击右上角"注册"按钮
3. 填写邮箱、用户名和密码
4. 注册成功后自动登录

### 2. 创建第一本电子书

1. 点击"开始制作"或"创建作品"按钮
2. 选择上传方式：
   - **PDF**: 上传PDF文件，自动拆分成单页
   - **图片**: 上传多张图片作为书页
3. 上传完成后进入编辑器

### 3. 编辑电子书

#### 添加文本

1. 点击顶部工具栏的"文本"按钮
2. 在页面上双击文本框进行编辑
3. 右侧属性面板可以调整：
   - 字体大小
   - 字体类型
   - 文本颜色
   - 对齐方式
   - 等等...

#### 添加音乐

1. 点击顶部工具栏的"音乐"按钮
2. 选择"共享资源"中的音乐，或上传自己的音乐
3. 调整音乐图标的位置、大小和颜色
4. 设置播放模式（单次/循环/自动播放）

#### 页面管理

- 左侧显示所有页面的缩略图
- 点击缩略图切换到对应页面
- 可以添加、删除页面

### 4. 保存和发布

1. 点击右上角"保存"按钮保存作品
2. 点击"发布与导出"按钮发布作品
3. 获得分享链接，可以分享给他人查看

### 5. 查看我的作品

1. 点击导航栏的"我的作品"
2. 查看所有创建的电子书
3. 可以编辑、删除或分享作品

## 目录结构

```
click-book/
├── frontend/          # 前端 React 应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/        # 页面
│   │   ├── store/        # 状态管理
│   │   └── services/     # API 服务
│   └── package.json
├── backend/           # 后端 Node.js API
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   └── config/       # 配置
│   └── package.json
├── shared/            # 共享类型定义
└── package.json
```

## 主要功能

✅ **用户系统**
- 注册和登录
- 用户资料管理
- 会员等级系统

✅ **文件上传**
- PDF 自动拆分
- 图片批量上传
- 音频文件上传

✅ **编辑器**
- 可视化编辑界面
- 实时预览
- 拖拽操作

✅ **文本编辑**
- 丰富的文本样式
- 自由位置调整
- 字体、颜色自定义

✅ **音乐功能**
- 音乐库管理
- 自定义音频
- 播放控制

✅ **作品管理**
- 保存草稿
- 发布分享
- 在线阅读

✅ **响应式设计**
- 支持电脑、平板、手机
- 高端苹果风格 UI

## 常见问题

### MongoDB 连接失败？

#### 错误：`MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**解决方案**：MongoDB 服务未启动

```bash
# 检查状态
brew services list | grep mongodb  # macOS
systemctl status mongod             # Linux

# 启动 MongoDB
brew services start mongodb-community@7.0  # macOS
sudo systemctl start mongod                 # Linux
```

#### 错误：`illegal hardware instruction`

**原因**：Apple Silicon (M1/M2/M3) Mac 上使用了 x86_64 版本的 MongoDB

**解决方案**：

1. 卸载旧版本并安装 ARM64 版本：
   ```bash
   # 卸载 x86_64 版本
   /usr/local/bin/brew uninstall mongodb-community
   
   # 安装 ARM64 Homebrew（如果还没有）
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
   source ~/.zshrc
   
   # 安装 ARM64 版本的 MongoDB
   /opt/homebrew/bin/brew tap mongodb/brew
   /opt/homebrew/bin/brew install mongodb-community@7.0
   /opt/homebrew/bin/brew services start mongodb-community@7.0
   ```

2. 验证架构：
   ```bash
   # 检查 mongod 架构
   file $(which mongod)
   # 应该显示：Mach-O 64-bit executable arm64
   ```

### 端口被占用？

修改 `backend/.env` 文件中的 `PORT` 配置。

### 文件上传失败？

确保 `backend/uploads` 目录存在且有写入权限：

```bash
cd backend
mkdir -p uploads/audio/default
chmod 755 uploads
```

### 前端无法连接后端？

#### 错误：`Failed to connect to localhost port 3000`

**可能原因**：

1. **后端依赖未安装**
   ```bash
   # 检查 backend/node_modules 是否存在
   ls -la backend/node_modules
   
   # 如果不存在，安装依赖
   cd backend && npm install && cd ..
   ```

2. **后端服务未启动**
   ```bash
   # 检查端口 3000 是否被占用
   lsof -i :3000
   
   # 如果没有输出，启动后端
   cd backend && npm run dev
   ```

3. **环境变量问题（Apple Silicon Mac）**
   ```bash
   # 确保使用正确的 npm
   export PATH="/opt/homebrew/bin:$PATH"
   cd backend && npm run dev
   ```

验证后端是否正常运行：
```bash
curl http://localhost:3000/api/health
# 应该返回：{"status":"ok","message":"Server is running"}
```

## 开发命令

```bash
# 启动开发服务器（前端+后端）
npm run dev

# 只启动前端
npm run dev:frontend

# 只启动后端
npm run dev:backend

# 构建生产版本
npm run build

# 构建前端
npm run build:frontend

# 构建后端
npm run build:backend
```

## 技术栈

**前端**
- React 18
- TypeScript
- Vite
- TailwindCSS
- Zustand

**后端**
- Node.js
- Express
- TypeScript
- MongoDB
- JWT

## 下一步

查看完整文档：
- [SETUP.md](./SETUP.md) - 详细安装指南
- [README.md](./README.md) - 项目介绍

## 获取帮助

- 📖 阅读完整文档
- 🐛 报告问题
- 💡 提出建议

祝你使用愉快！ 🎉

