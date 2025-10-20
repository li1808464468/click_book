import mongoose, { Document, Schema } from 'mongoose'
import type { BookPage, TextElement, AudioElement } from '@shared/index'

export interface IBook extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  coverImage?: string
  pages: BookPage[]
  status: 'draft' | 'published'
  shareUrl?: string
  shareId?: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

const textElementSchema = new Schema<TextElement>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  fontSize: { type: Number, required: true },
  fontFamily: { type: String, required: true },
  color: { type: String, required: true },
  fontWeight: { type: String, required: true },
  fontStyle: { type: String, required: true },
  textAlign: { type: String, required: true },
  lineHeight: { type: Number, required: true },
  letterSpacing: { type: Number, required: true },
  textDecoration: { type: String, required: true },
}, { _id: false })

const audioElementSchema = new Schema<AudioElement>({
  id: { type: String, required: true },
  audioUrl: { type: String, required: true },
  name: { type: String, required: true },
  behavior: {
    playMode: { type: String, required: true },
    autoPlay: { type: Boolean, required: true },
    volume: { type: Number, required: true },
  },
  iconStyle: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    size: { type: Number, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
  },
}, { _id: false })

const bookPageSchema = new Schema<BookPage>({
  id: { type: String, required: true },
  pageNumber: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  textElements: [textElementSchema],
  audioElements: [audioElementSchema],
}, { _id: false })

const bookSchema = new Schema<IBook>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: '未命名作品',
    },
    coverImage: {
      type: String,
    },
    pages: [bookPageSchema],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    shareUrl: {
      type: String,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
bookSchema.index({ userId: 1, createdAt: -1 })
// shareId 索引已通过 unique: true 自动创建，无需重复定义

export const Book = mongoose.model<IBook>('Book', bookSchema)

