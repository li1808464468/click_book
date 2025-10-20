import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { createCanvas } from 'canvas'
import sharp from 'sharp'
import fs from 'fs/promises'

// 设置worker，使用本地路径
const workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.entry')
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export async function renderPdfToImages(pdfPath: string, outputDir: string): Promise<string[]> {
  try {
    // 读取PDF文件
    const data = await fs.readFile(pdfPath)
    
    // 加载PDF文档
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(data),
      useSystemFonts: true,
    })
    
    const pdfDocument = await loadingTask.promise
    const numPages = pdfDocument.numPages
    const imagePaths: string[] = []

    // 渲染每一页
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      
      // 设置渲染尺寸
      const viewport = page.getViewport({ scale: 2.0 })
      const canvas = createCanvas(viewport.width, viewport.height)
      const context = canvas.getContext('2d')

      // 渲染PDF页面到canvas
      const renderContext = {
        canvasContext: context as any,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // 将canvas转换为buffer
      const imageBuffer = canvas.toBuffer('image/png')

      // 使用sharp优化并保存为JPEG
      const imageName = `${Date.now()}-page-${pageNum}.jpg`
      const imagePath = `${outputDir}/${imageName}`

      await sharp(imageBuffer)
        .resize(748, 1000, {
          fit: 'inside',
          withoutEnlargement: false,
          background: { r: 255, g: 255, b: 255 },
        })
        .jpeg({ quality: 90 })
        .toFile(imagePath)

      imagePaths.push(imageName)
    }

    return imagePaths
  } catch (error) {
    console.error('PDF rendering error:', error)
    throw new Error('PDF渲染失败: ' + (error as Error).message)
  }
}

