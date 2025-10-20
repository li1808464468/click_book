#!/bin/bash

echo "🚀 开始安装 Click Book..."

# Check and install MongoDB (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🔍 检查 MongoDB 安装..."
  if ! brew list mongodb-community &>/dev/null; then
    echo "⚠️  MongoDB 未安装，开始安装..."
    echo "📦 添加 MongoDB tap..."
    brew tap mongodb/brew
    echo "📦 安装 MongoDB Community Edition..."
    brew install mongodb-community
    echo "✅ MongoDB 安装完成"
  else
    echo "✅ MongoDB 已安装"
  fi
  
  # Start MongoDB service
  echo "🚀 启动 MongoDB 服务..."
  brew services start mongodb-community
  echo "✅ MongoDB 服务已启动"
fi

# Install root dependencies
echo "📦 安装根目录依赖..."
npm install

# Install frontend dependencies
echo "📦 安装前端依赖..."
cd frontend && npm install && cd ..

# Install backend dependencies
echo "📦 安装后端依赖..."
cd backend && npm install && cd ..

# Setup backend
echo "⚙️  配置后端..."
cd backend

# Create uploads directory
mkdir -p uploads/audio/default

# Copy env file if not exists
if [ ! -f .env ]; then
  cat > .env << EOL
PORT=3000
MONGODB_URI=mongodb://localhost:27017/clickbook
JWT_SECRET=click-book-secret-key-2024-change-in-production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
BASE_URL=http://localhost:5173
EOL
  echo "✅ 创建了后端 .env 文件"
fi

cd ..

echo ""
echo "🎉 安装完成！"
echo ""
echo "📝 下一步："
echo "   运行 'npm run dev' 启动开发服务器"
echo ""
echo "🌐 访问地址："
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3000/api"
echo ""

