import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { bookApi } from '@/services/api'
import type { Book } from '@shared/index'
import PageFlip from '@/components/Viewer/PageFlip'
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiMaximize, 
  FiMinimize,
  FiShare2
} from 'react-icons/fi'

export default function ViewerPage() {
  const { shareId } = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shareId) {
      loadBook(shareId)
    }
  }, [shareId])

  const loadBook = async (id: string) => {
    try {
      const response = await bookApi.getBookByShareId(id)
      if (response.data.success && response.data.data) {
        setBook(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (book && currentPage < book.pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book?.title,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <p className="text-2xl mb-2">未找到该作品</p>
          <p className="text-gray-400">请检查链接是否正确</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-800 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-white text-base md:text-xl font-semibold truncate">{book.title}</h1>
        <div className="flex items-center space-x-2 md:space-x-4">
          <span className="text-gray-400 text-xs md:text-sm whitespace-nowrap">
            {currentPage + 1} / {book.pages.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 md:p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? "退出全屏" : "全屏"}
          >
            {isFullscreen ? <FiMinimize className="w-4 h-4 md:w-5 md:h-5" /> : <FiMaximize className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>
      </div>

      {/* Book Viewer */}
      <div className="flex-1 overflow-hidden">
        <PageFlip
          book={book}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Enhanced Toolbar */}
      <div className="flex-shrink-0 bg-gray-800 border-t border-gray-700 px-2 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Page Navigation */}
          <div className="flex items-center space-x-0.5 md:space-x-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="p-2 md:p-2.5 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded transition-colors"
              title="上一页"
            >
              <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <span className="text-gray-300 text-sm md:text-base px-3 md:px-4 min-w-[70px] md:min-w-[90px] text-center font-medium">
              {currentPage + 1} / {book.pages.length}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= book.pages.length - 1}
              className="p-2 md:p-2.5 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded transition-colors"
              title="下一页"
            >
              <FiChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-0.5 md:space-x-1">
            <button
              onClick={toggleFullscreen}
              className="p-2 md:p-2.5 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-colors"
              title={isFullscreen ? "退出全屏" : "全屏"}
            >
              {isFullscreen ? <FiMinimize className="w-5 h-5 md:w-6 md:h-6" /> : <FiMaximize className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 md:p-2.5 hover:bg-gray-700 text-gray-300 hover:text-white rounded transition-colors"
              title="分享"
            >
              <FiShare2 className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

