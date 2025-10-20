import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.model'

export interface AuthRequest extends Request {
  user?: any
  userId?: string
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未授权，请先登录',
      })
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, jwtSecret) as { userId: string }

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      })
    }

    req.user = user
    req.userId = decoded.userId  // 同时设置 userId
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '无效的令牌',
    })
  }
}

