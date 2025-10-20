import { useEditorStore } from '@/store/editorStore'
import { FiPlus, FiTrash2, FiCopy, FiClipboard } from 'react-icons/fi'
import clsx from 'clsx'
import { useState } from 'react'

export default function EditorSidebar() {
  const { book, currentPageIndex, setCurrentPage, removePage } = useEditorStore()
  const [copiedPage, setCopiedPage] = useState<any>(null)

  if (!book) return null

  const handleDeletePage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (book.pages.length <= 1) {
      alert('至少需要保留一页')
      return
    }

    if (window.confirm(`确定要删除第 ${index + 1} 页吗？`)) {
      removePage(index)
      // 如果删除的是当前页，跳转到前一页或第一页
      if (currentPageIndex === index) {
        setCurrentPage(Math.max(0, index - 1))
      } else if (currentPageIndex > index) {
        setCurrentPage(currentPageIndex - 1)
      }
    }
  }

  const handleCopyPage = () => {
    if (book && book.pages[currentPageIndex]) {
      setCopiedPage(JSON.parse(JSON.stringify(book.pages[currentPageIndex])))
      alert('已复制当前页面')
    }
  }

  const handlePastePage = () => {
    if (!copiedPage) {
      alert('没有复制的页面')
      return
    }
    // TODO: 实现粘贴页面功能
    alert('粘贴功能开发中...')
  }

  const handleDeleteCurrentPage = () => {
    if (book.pages.length <= 1) {
      alert('至少需要保留一页')
      return
    }
    if (window.confirm(`确定要删除第 ${currentPageIndex + 1} 页吗？`)) {
      removePage(currentPageIndex)
      if (currentPageIndex > 0) {
        setCurrentPage(currentPageIndex - 1)
      }
    }
  }

  return (
    <div className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* 固定的顶部区域 */}
      <div className="flex-shrink-0 bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-800 font-semibold">页面列表</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPage}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="复制当前页"
            >
              <FiCopy size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handlePastePage}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="粘贴页面"
            >
              <FiClipboard size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleDeleteCurrentPage}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="删除当前页"
            >
              <FiTrash2 size={16} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 可滚动的中间区域 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2 min-h-0">
        {book.pages.map((page, index) => (
          <div
            key={page.id}
            className="relative group"
          >
            <button
              onClick={() => setCurrentPage(index)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
                currentPageIndex === index
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              )}
            >
              {/* 圆形数字 */}
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0',
                  currentPageIndex === index
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                )}
              >
                {index + 1}
              </div>
              
              {/* 页面标题 */}
              <span className="text-gray-700 font-medium">第{index + 1}页</span>
            </button>
            
            {/* 删除按钮 */}
            <button
              onClick={(e) => handleDeletePage(index, e)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除此页"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

