# PDF渲染功能升级说明

## 问题描述
之前的PDF上传功能只能识别页数，但页面显示为空白，因为使用的是占位实现。

## 解决方案
添加了真实的PDF渲染功能，使用 `pdfjs-dist` 和 `canvas` 库将PDF页面渲染为图片。

## 安装步骤

### 1. 停止当前运行的服务
如果服务器正在运行，请先停止它（Ctrl+C）

### 2. 安装新的依赖包

在项目根目录执行：

```bash
cd backend
npm install
```

这将安装以下新增依赖：
- `canvas@^2.11.2` - 用于图像渲染
- `pdfjs-dist@^3.11.174` - Mozilla的PDF解析库

### 3. 注意事项

**canvas 依赖系统库**

`canvas` 库需要系统级的依赖。如果安装失败，请根据您的操作系统安装相应依赖：

#### macOS:
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
```

#### Ubuntu/Debian:
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

#### Windows:
Windows用户可能需要额外的构建工具。建议：
```bash
npm install --global --production windows-build-tools
```

### 4. 重启服务器

安装完成后，重启开发服务器：

```bash
npm run dev
```

或在项目根目录使用：
```bash
npm run dev
```

## 新功能特性

✅ **真实PDF渲染** - PDF内容将被正确渲染为图片
✅ **高质量输出** - 使用2倍缩放渲染，输出质量90%的JPEG
✅ **自动调整尺寸** - 渲染后的图片会自动调整到748x1000标准尺寸
✅ **完整错误处理** - 更详细的错误信息提示

## 技术细节

### 新增文件
- `backend/src/utils/pdfRenderer.ts` - PDF渲染工具函数

### 修改文件
- `backend/package.json` - 添加了canvas和pdfjs-dist依赖
- `backend/src/controllers/upload.controller.ts` - 使用真实的PDF渲染替代占位实现

### 工作流程
1. 用户上传PDF文件
2. 后端使用pdfjs-dist解析PDF
3. 每一页使用canvas渲染为高分辨率图像
4. 使用sharp优化并调整到标准尺寸
5. 保存为JPEG格式
6. 返回图片路径给前端

## 测试建议

上传一个包含文字和图片的PDF文件，确认：
1. ✅ 所有页面都能正常显示
2. ✅ 文字清晰可读
3. ✅ 图片质量良好
4. ✅ 页面布局保持正确

## 故障排除

### 如果遇到 canvas 安装失败

**选项1：使用预编译版本**
```bash
npm install canvas --build-from-source=false
```

**选项2：使用替代方案**
如果canvas安装一直失败，可以考虑使用`pdf2pic`或`pdf-poppler`等替代方案。

### 如果PDF渲染失败

检查错误日志，常见问题：
- PDF文件损坏或加密
- 内存不足（大PDF文件可能需要更多内存）
- 字体缺失（pdfjs会尝试使用系统字体）

## 性能说明

- 小PDF（<10页）：渲染时间 < 5秒
- 中PDF（10-50页）：渲染时间 5-20秒
- 大PDF（>50页）：可能需要更长时间

建议在生产环境中：
1. 添加进度提示
2. 使用队列处理大文件
3. 设置文件大小和页数限制

