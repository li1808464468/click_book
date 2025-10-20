import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { connectDatabase } from './config/database'
import authRoutes from './routes/auth.routes'
import bookRoutes from './routes/book.routes'
import uploadRoutes from './routes/upload.routes'
import { errorHandler } from './middlewares/error.middleware'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/upload', uploadRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Error handler
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase()
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`)
      console.log(`📚 API available at http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

