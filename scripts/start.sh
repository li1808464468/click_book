#!/bin/bash

echo "🚀 启动 Click Book 开发服务器..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
  echo "⚠️  警告: MongoDB 似乎没有运行"
  echo "请先启动 MongoDB:"
  echo "  macOS: brew services start mongodb-community"
  echo "  Linux: sudo systemctl start mongod"
  echo ""
fi

# Start the development servers
npm run dev

