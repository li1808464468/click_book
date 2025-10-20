import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { bookApi } from '@/services/api'
import type { Book } from '@shared/index'
import { FiPlus, FiEdit, FiTrash2, FiShare2, FiEye } from 'react-icons/fi'
import { format } from 'date-fns'

export default function MyWorksPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      const response = await bookApi.getMyBooks()
      if (response.data.success && response.data.data) {
        setBooks(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这本电子书吗？')) return

    try {
      await bookApi.deleteBook(id)
      setBooks(books.filter((book) => book.id !== id))
    } catch (error) {
      console.error('Failed to delete book:', error)
      alert('删除失败，请稍后重试')
    }
  }

  const handleCreateNew = () => {
    navigate('/editor')
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">我的作品</h1>
          <button onClick={handleCreateNew} className="btn-primary">
            <FiPlus className="inline-block mr-2" />
            创建作品
          </button>
        </div>

        {books.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-gray-400 mb-4">
              <FiPlus className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl">还没有作品</p>
              <p className="mt-2">点击上方按钮创建你的第一本电子书</p>
            </div>
            <button onClick={handleCreateNew} className="btn-primary mt-6">
              立即创建
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book.id} className="card-hover group">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FiEye className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {book.title || '未命名作品'}
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{book.pages.length} 页</span>
                  <span>{format(new Date(book.updatedAt), 'yyyy-MM-dd')}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {book.status === 'published' && book.shareUrl && (
                    <a
                      href={book.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-secondary text-sm"
                    >
                      <FiShare2 className="inline-block mr-1" />
                      分享
                    </a>
                  )}
                  <Link
                    to={`/editor/${book.id}`}
                    className="flex-1 btn-primary text-sm"
                  >
                    <FiEdit className="inline-block mr-1" />
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="btn-secondary text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

