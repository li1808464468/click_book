# Click Book 安装和使用指南

## 系统要求

- Node.js >= 18
- MongoDB >= 5.0
- npm 或 yarn

## 快速开始

### 1. 安装依赖

在项目根目录运行：

```bash
npm install
```

这将自动安装所有前端、后端和共享模块的依赖。

### 2. 配置环境变量

#### 后端配置

复制后端环境变量模板：

```bash
cd backend
cp .env.example .env
```

编辑 `backend/.env` 文件，配置以下内容：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/clickbook
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:5173
```

#### 前端配置（可选）

```bash
cd frontend
cp .env.example .env
```

### 3. 启动MongoDB

确保MongoDB服务正在运行：

```bash
# macOS (使用 Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# 启动MongoDB服务
```

### 4. 创建上传目录

```bash
cd backend
mkdir -p uploads/audio/default
```

### 5. 启动开发服务器

在项目根目录运行：

```bash
npm run dev
```

这将同时启动前端和后端开发服务器：

- 前端：http://localhost:5173
- 后端：http://localhost:3000

或者分别启动：

```bash
# 启动前端
npm run dev:frontend

# 启动后端
npm run dev:backend
```

## 构建生产版本

```bash
npm run build
```

## 项目结构

```
click-book/
├── frontend/          # React前端应用
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   ├── store/       # 状态管理
│   │   ├── services/    # API服务
│   │   └── ...
│   └── package.json
├── backend/           # Node.js后端API
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # 路由
│   │   ├── middlewares/ # 中间件
│   │   └── config/      # 配置
│   └── package.json
├── shared/            # 共享类型定义
│   └── src/
└── package.json       # 根配置
```

## 功能特性

### 已实现功能

✅ 用户注册和登录
✅ JWT身份认证
✅ 文件上传（PDF、图片、音频）
✅ 编辑器工作台
✅ 页面列表管理
✅ 文本元素添加和编辑
✅ 文本样式设置（字体、颜色、大小等）
✅ 音乐元素添加
✅ 音频控制设置
✅ 作品保存和更新
✅ 作品发布和分享
✅ 我的作品列表
✅ 在线阅读器
✅ 响应式设计

### 核心功能说明

#### 1. 用户系统

- 用户注册和登录
- JWT令牌认证
- 用户资料管理
- 会员等级（免费、高级、VIP）
- 积分系统

#### 2. 文件上传

- PDF上传并自动拆分为单页
- 图片批量上传
- 音频文件上传
- 文件大小限制：50MB
- 支持格式：
  - 文档：PDF
  - 图片：JPG、PNG
  - 音频：MP3、WAV、OGG

#### 3. 编辑器

- 页面列表侧边栏
- 可视化画布
- 顶部工具栏
- 属性面板
- 实时预览

#### 4. 文本编辑

- 添加文本元素
- 双击编辑文本内容
- 拖动调整位置
- 文本样式设置：
  - 字体大小
  - 字体家族
  - 文本颜色
  - 字重（粗体/正常）
  - 对齐方式
  - 行高
  - 字间距

#### 5. 音乐功能

- 音乐库（共享资源 + 我的音乐）
- 上传自定义音乐
- 音频控制设置：
  - 播放模式（单次/循环/进入页面时）
  - 图标样式
  - 图标大小和颜色

#### 6. 作品管理

- 保存草稿
- 发布作品
- 生成分享链接
- 作品列表查看
- 作品编辑和删除

#### 7. 在线阅读

- 3D翻页效果（基础版）
- 页面导航
- 全屏模式
- 文本和音频元素展示

## API接口

### 认证 API

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户资料

### 作品 API

- `POST /api/books` - 创建作品
- `GET /api/books` - 获取我的作品列表
- `GET /api/books/:id` - 获取作品详情
- `PUT /api/books/:id` - 更新作品
- `DELETE /api/books/:id` - 删除作品
- `POST /api/books/:id/publish` - 发布作品
- `GET /api/books/share/:shareId` - 通过分享ID获取作品

### 上传 API

- `POST /api/upload/pdf` - 上传PDF
- `POST /api/upload/images` - 上传图片
- `POST /api/upload/audio` - 上传音频

## 数据库模型

### User（用户）

```typescript
{
  email: string
  username: string
  password: string (hashed)
  avatar?: string
  membershipType: 'free' | 'premium' | 'vip'
  credits: number
  createdAt: Date
  updatedAt: Date
}
```

### Book（作品）

```typescript
{
  userId: ObjectId
  title: string
  coverImage?: string
  pages: BookPage[]
  status: 'draft' | 'published'
  shareUrl?: string
  shareId?: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}
```

## 开发注意事项

1. **PDF转图片功能**：当前使用的是占位实现，在生产环境中需要集成真正的PDF渲染库（如pdf-poppler或pdf2pic）

2. **3D翻页效果**：当前使用简单的页面切换，可以集成stpageflip库实现真正的3D翻页动画

3. **文件存储**：当前使用本地文件系统，生产环境建议使用云存储服务（如AWS S3、阿里云OSS等）

4. **图片优化**：已集成sharp库进行图片处理和优化

5. **安全性**：
   - 使用bcryptjs加密密码
   - JWT令牌认证
   - 文件类型和大小验证
   - CORS配置

## 常见问题

### 1. MongoDB连接失败

确保MongoDB服务正在运行，并检查 `.env` 文件中的 `MONGODB_URI` 配置。

### 2. 文件上传失败

确保后端的 `uploads` 目录存在且有写入权限。

### 3. 前端无法连接后端

检查CORS配置和代理设置，确保前端的 `vite.config.ts` 中的代理配置正确。

### 4. 端口冲突

如果默认端口被占用，可以在 `.env` 文件中修改 `PORT` 配置。

## 后续优化建议

1. 集成真正的PDF转图片库
2. 实现高级3D翻页动画
3. 添加更多编辑功能（形状、链接、视频等）
4. 实现协作编辑功能
5. 添加模板库
6. 实现支付和订阅系统
7. 添加数据分析和统计
8. 优化移动端体验
9. 实现离线编辑功能
10. 添加导出功能（PDF、视频等）

## 许可证

MIT

## 技术支持

如有问题，请查看文档或提交Issue。

