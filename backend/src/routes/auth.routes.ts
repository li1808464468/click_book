import { Router } from 'express'
import { body } from 'express-validator'
import { register, login, getProfile, getMyAudio, deleteAudio } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('请输入有效的邮箱'),
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  ],
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('请输入有效的邮箱'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  login
)

router.get('/profile', authenticate, getProfile)
router.get('/my-audio', authenticate, getMyAudio)
router.delete('/my-audio/:audioId', authenticate, deleteAudio)

export default router

