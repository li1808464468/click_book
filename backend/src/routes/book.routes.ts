import { Router } from 'express'
import {
  createBook,
  getMyBooks,
  getBook,
  getBookByShareId,
  updateBook,
  deleteBook,
  publishBook,
} from '../controllers/book.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Protected routes
router.post('/', authenticate, createBook)
router.get('/', authenticate, getMyBooks)
router.get('/:id', authenticate, getBook)
router.put('/:id', authenticate, updateBook)
router.delete('/:id', authenticate, deleteBook)
router.post('/:id/publish', authenticate, publishBook)

// Public route
router.get('/share/:shareId', getBookByShareId)

export default router

