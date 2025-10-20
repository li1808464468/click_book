#!/bin/bash

# PDF渲染依赖安装脚本

echo "=================================="
echo "安装PDF渲染功能所需依赖"
echo "=================================="
echo ""

# 检测操作系统
OS="$(uname -s)"

case "${OS}" in
    Darwin*)
        echo "检测到 macOS 系统"
        echo "正在检查 Homebrew..."
        
        if ! command -v brew &> /dev/null; then
            echo "❌ 未找到 Homebrew"
            echo "请先安装 Homebrew: https://brew.sh"
            exit 1
        fi
        
        echo "✅ 找到 Homebrew"
        echo ""
        echo "安装系统依赖..."
        brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
        ;;
        
    Linux*)
        echo "检测到 Linux 系统"
        
        if command -v apt-get &> /dev/null; then
            echo "使用 apt-get 安装系统依赖..."
            sudo apt-get update
            sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
        elif command -v yum &> /dev/null; then
            echo "使用 yum 安装系统依赖..."
            sudo yum install -y gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
        else
            echo "⚠️  无法识别包管理器，请手动安装canvas所需的系统依赖"
        fi
        ;;
        
    MINGW*|MSYS*|CYGWIN*)
        echo "检测到 Windows 系统"
        echo "Windows用户可能需要安装 windows-build-tools"
        echo "请以管理员身份运行："
        echo "npm install --global --production windows-build-tools"
        ;;
        
    *)
        echo "⚠️  未知操作系统: ${OS}"
        ;;
esac

echo ""
echo "=================================="
echo "安装 Node.js 依赖"
echo "=================================="
echo ""

# 进入backend目录
cd "$(dirname "$0")/../backend" || exit 1

echo "当前目录: $(pwd)"
echo ""

# 安装npm依赖
echo "正在安装 canvas 和 pdfjs-dist..."
npm install canvas@^2.11.2 pdfjs-dist@^3.11.174

if [ $? -eq 0 ]; then
    echo ""
    echo "=================================="
    echo "✅ 安装完成！"
    echo "=================================="
    echo ""
    echo "现在可以启动服务器了："
    echo "  cd backend && npm run dev"
    echo ""
    echo "或在项目根目录运行："
    echo "  npm run dev"
    echo ""
else
    echo ""
    echo "=================================="
    echo "❌ 安装失败"
    echo "=================================="
    echo ""
    echo "可能的原因："
    echo "1. 系统依赖未正确安装"
    echo "2. Node.js版本不兼容（建议使用 Node 16+）"
    echo "3. 网络问题"
    echo ""
    echo "请查看详细错误信息并参考 PDF渲染升级说明.md"
    echo ""
    exit 1
fi

