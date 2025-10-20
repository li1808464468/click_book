import { Request, Response } from 'express'
import { nanoid } from 'nanoid'
import { Book } from '../models/Book.model'
import type { AuthRequest } from '../middlewares/auth.middleware'

export const createBook = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id
    const bookData = req.body

    const book = new Book({
      ...bookData,
      userId,
    })

    await book.save()

    res.status(201).json({
      success: true,
      data: {
        id: book._id,
        userId: book.userId,
        title: book.title,
        coverImage: book.coverImage,
        pages: book.pages,
        status: book.status,
        shareUrl: book.shareUrl,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      },
    })
  } catch (error) {
    console.error('Create book error:', error)
    res.status(500).json({
      success: false,
      message: '创建作品失败',
    })
  }
}

export const getMyBooks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id

    const books = await Book.find({ userId })
      .sort({ updatedAt: -1 })
      .lean()

    res.json({
      success: true,
      data: books.map((book) => ({
        id: book._id,
        userId: book.userId,
        title: book.title,
        coverImage: book.coverImage,
        pages: book.pages,
        status: book.status,
        shareUrl: book.shareUrl,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
        publishedAt: book.publishedAt,
      })),
    })
  } catch (error) {
    console.error('Get books error:', error)
    res.status(500).json({
      success: false,
      message: '获取作品列表失败',
    })
  }
}

export const getBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const book = await Book.findOne({ _id: id, userId })

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '作品不存在',
      })
    }

    res.json({
      success: true,
      data: {
        id: book._id,
        userId: book.userId,
        title: book.title,
        coverImage: book.coverImage,
        pages: book.pages,
        status: book.status,
        shareUrl: book.shareUrl,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
        publishedAt: book.publishedAt,
      },
    })
  } catch (error) {
    console.error('Get book error:', error)
    res.status(500).json({
      success: false,
      message: '获取作品失败',
    })
  }
}

export const getBookByShareId = async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params

    const book = await Book.findOne({ shareId, status: 'published' })

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '作品不存在或未发布',
      })
    }

    res.json({
      success: true,
      data: {
        id: book._id,
        userId: book.userId,
        title: book.title,
        coverImage: book.coverImage,
        pages: book.pages,
        status: book.status,
        createdAt: book.createdAt,
        publishedAt: book.publishedAt,
      },
    })
  } catch (error) {
    console.error('Get book by share ID error:', error)
    res.status(500).json({
      success: false,
      message: '获取作品失败',
    })
  }
}

export const updateBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const updateData = req.body

    const book = await Book.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true }
    )

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '作品不存在',
      })
    }

    res.json({
      success: true,
      data: {
        id: book._id,
        userId: book.userId,
        title: book.title,
        coverImage: book.coverImage,
        pages: book.pages,
        status: book.status,
        shareUrl: book.shareUrl,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      },
    })
  } catch (error) {
    console.error('Update book error:', error)
    res.status(500).json({
      success: false,
      message: '更新作品失败',
    })
  }
}

export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const book = await Book.findOneAndDelete({ _id: id, userId })

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '作品不存在',
      })
    }

    res.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('Delete book error:', error)
    res.status(500).json({
      success: false,
      message: '删除作品失败',
    })
  }
}

export const publishBook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const book = await Book.findOne({ _id: id, userId })

    if (!book) {
      return res.status(404).json({
        success: false,
        message: '作品不存在',
      })
    }

    // Generate share ID if not exists
    if (!book.shareId) {
      book.shareId = nanoid(10)
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
    book.shareUrl = `${baseUrl}/book/${book.shareId}`
    book.status = 'published'
    book.publishedAt = new Date()

    // Set cover image from first page if not set
    if (!book.coverImage && book.pages.length > 0) {
      book.coverImage = book.pages[0].imageUrl
    }

    await book.save()

    res.json({
      success: true,
      data: {
        shareUrl: book.shareUrl,
        shareId: book.shareId,
      },
    })
  } catch (error) {
    console.error('Publish book error:', error)
    res.status(500).json({
      success: false,
      message: '发布作品失败',
    })
  }
}

