import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.model'
import type { AuthRequest } from '../middlewares/auth.middleware'

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      })
    }

    const { email, username, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册',
      })
    }

    // Create new user
    const user = new User({
      email,
      username,
      password,
    })

    await user.save()

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          membershipType: user.membershipType,
          credits: user.credits,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试',
    })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      })
    }

    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
      })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误',
      })
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    })

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          membershipType: user.membershipType,
          credits: user.credits,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试',
    })
  }
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        membershipType: user.membershipType,
        credits: user.credits,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败',
    })
  }
}

export const getMyAudio = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🎵 获取音乐列表 - 用户ID:', req.userId)
    const user = await User.findById(req.userId).select('uploadedAudio')
    
    if (!user) {
      console.log('❌ 用户不存在')
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      })
    }

    console.log('🎵 找到用户:', user._id)
    console.log('🎵 音乐数量:', user.uploadedAudio?.length || 0)
    console.log('🎵 音乐列表:', user.uploadedAudio)

    res.json({
      success: true,
      data: user.uploadedAudio || [],
    })
  } catch (error) {
    console.error('❌ 获取音乐列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取音乐列表失败',
    })
  }
}

export const deleteAudio = async (req: AuthRequest, res: Response) => {
  try {
    const { audioId } = req.params
    console.log('🗑️ 删除音乐 - 用户ID:', req.userId, '音频ID:', audioId)

    const user = await User.findById(req.userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      })
    }

    // 找到要删除的音频
    const audioIndex = user.uploadedAudio.findIndex(audio => audio.id === audioId)
    
    if (audioIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '音频不存在',
      })
    }

    // 删除音频记录
    user.uploadedAudio.splice(audioIndex, 1)
    await user.save()

    console.log('✅ 音频已删除，剩余数量:', user.uploadedAudio.length)

    res.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('❌ 删除音乐错误:', error)
    res.status(500).json({
      success: false,
      message: '删除失败',
    })
  }
}

