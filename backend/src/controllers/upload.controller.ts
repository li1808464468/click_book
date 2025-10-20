import { Response } from 'express'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'
import type { AuthRequest } from '../middlewares/auth.middleware'
import { renderPdfToImages } from '../utils/pdfRenderer'
import { User } from '../models/User.model'

export const uploadPdf = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的PDF文件',
      })
    }

    const pdfPath = req.file.path
    const outputDir = path.dirname(pdfPath)

    // 使用pdfjs渲染PDF为图片
    const imageNames = await renderPdfToImages(pdfPath, outputDir)
    
    // 返回相对路径，让前端通过代理访问
    const imageUrls = imageNames.map(name => `/uploads/${name}`)

    // Clean up original PDF file
    await fs.unlink(pdfPath)

    res.json({
      success: true,
      data: {
        fileUrls: imageUrls,
      },
    })
  } catch (error) {
    console.error('Upload PDF error:', error)
    res.status(500).json({
      success: false,
      message: 'PDF上传失败: ' + (error as Error).message,
    })
  }
}

export const uploadImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的图片文件',
      })
    }

    const imageUrls: string[] = []

    for (const file of req.files) {
      // Optimize and resize image
      const optimizedName = `opt-${file.filename}`
      const optimizedPath = path.join(path.dirname(file.path), optimizedName)

      await sharp(file.path)
        .resize(748, 1000, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 90 })
        .toFile(optimizedPath)

      // Remove original file
      await fs.unlink(file.path)

      // 返回相对路径，让前端通过代理访问
      imageUrls.push(`/uploads/${optimizedName}`)
    }

    res.json({
      success: true,
      data: {
        fileUrls: imageUrls,
      },
    })
  } catch (error) {
    console.error('Upload images error:', error)
    res.status(500).json({
      success: false,
      message: '图片上传失败',
    })
  }
}

export const uploadAudio = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的音频文件',
      })
    }

    // 获取前端传来的MD5值
    const fileMd5 = req.body.md5
    
    // 修复中文文件名编码问题
    // multer 使用 latin1 编码，需要转换为 UTF-8
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')

    console.log('🎵 音频上传 - 用户ID:', req.userId)
    console.log('🎵 文件MD5:', fileMd5)
    console.log('🎵 文件名:', originalName)

    // 保存音频信息到用户记录
    if (req.userId) {
      const user = await User.findById(req.userId)
      console.log('🎵 找到用户:', user ? `${user.username} (${user.email})` : '未找到')
      if (user) {
        // 确保 uploadedAudio 字段存在（兼容旧用户）
        if (!user.uploadedAudio) {
          console.log('⚠️  用户没有 uploadedAudio 字段，正在初始化...')
          user.uploadedAudio = []
        }

        // 检查MD5是否已存在
        if (fileMd5) {
          const existingAudio = user.uploadedAudio.find(audio => audio.md5 === fileMd5)
          if (existingAudio) {
            console.log('⚠️  文件已存在（MD5相同）:', existingAudio.name)
            // 删除刚上传的文件
            await fs.unlink(req.file.path)
            return res.json({
              success: true,
              data: {
                fileUrl: existingAudio.url,
                audioId: existingAudio.id,
                name: existingAudio.name,
                duplicate: true,
                message: '文件已存在，无需重复上传',
              },
            })
          }
        }

        // 返回相对路径，让前端通过代理访问
        // 音频文件保存在audio子目录中
        const audioUrl = `/uploads/audio/${req.file.filename}`
        const audioId = nanoid()

        console.log('🎵 保存前音乐数量:', user.uploadedAudio.length)
        user.uploadedAudio.push({
          id: audioId,
          name: originalName,
          url: audioUrl,
          md5: fileMd5,
          uploadedAt: new Date(),
        })
        await user.save()
        console.log('🎵 保存后音乐数量:', user.uploadedAudio.length)
        console.log('✅ 音频已保存到用户记录')

        return res.json({
          success: true,
          data: {
            fileUrl: audioUrl,
            audioId: audioId,
            name: originalName,
            duplicate: false,
          },
        })
      } else {
        console.log('❌ 未找到用户，无法保存音乐记录')
      }
    } else {
      console.log('❌ 没有用户ID，无法保存音乐记录')
    }

    return res.status(500).json({
      success: false,
      message: '音频上传失败',
    })
  } catch (error) {
    console.error('❌ 音频上传错误:', error)
    res.status(500).json({
      success: false,
      message: '音频上传失败: ' + (error as Error).message,
    })
  }
}

