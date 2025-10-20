import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { authenticate } from '../middlewares/auth.middleware'
import {
  uploadPdf,
  uploadImages,
  uploadAudio,
} from '../controllers/upload.controller'

const router = Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 音频文件保存到audio子目录，其他文件保存到uploads根目录
    const isAudio = file.mimetype.startsWith('audio/')
    const uploadDir = isAudio 
      ? path.join(__dirname, '../../uploads/audio')
      : path.join(__dirname, '../../uploads')
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // 检查文件扩展名
    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExts = ['.pdf', '.jpeg', '.jpg', '.png', '.mp3', '.wav', '.ogg', '.m4a']
    
    // 检查MIME类型
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a'
    ]

    if (allowedExts.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true)
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype} (${ext})`))
    }
  },
})

// Upload routes
router.post('/pdf', authenticate, upload.single('file'), uploadPdf)
router.post('/images', authenticate, upload.array('files', 50), uploadImages)
router.post('/audio', authenticate, upload.single('file'), uploadAudio)

export default router

