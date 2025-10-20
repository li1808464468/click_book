import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditorStore } from '@/store/editorStore'
import { useAuthStore } from '@/store/authStore'
import { bookApi, uploadApi } from '@/services/api'
import EditorSidebar from '@/components/Editor/EditorSidebar'
import EditorCanvas from '@/components/Editor/EditorCanvas'
import EditorProperties from '@/components/Editor/EditorProperties'
import UploadModal from '@/components/Editor/UploadModal'
import MusicLibraryModal from '@/components/Editor/MusicLibraryModal'
import { 
  FiSave, 
  FiEye, 
  FiType, 
  FiMusic,
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiRotateCcw,
  FiRotateCw,
  FiGrid,
  FiMaximize2,
  FiLayers,
  FiSkipBack,
  FiSkipForward,
  FiPlus,
  FiHome,
  FiUser,
  FiLogOut,
  FiBook,
  FiSidebar
} from 'react-icons/fi'
import type { BookPage } from '@shared/index'

export default function EditorPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { 
    book, 
    setBook, 
    resetEditor, 
    updateBookTitle, 
    currentPageIndex, 
    addTextElement, 
    addAudioElement, 
    setCurrentPage, 
    addPage,
    showLeftPanel,
    showRightPanel,
    toggleLeftPanel,
    toggleRightPanel
  } = useEditorStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showMusicModal, setShowMusicModal] = useState(false)
  const [title, setTitle] = useState('')
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const [showRuler, setShowRuler] = useState(false)

  useEffect(() => {
    if (bookId) {
      loadBook(bookId)
    } else {
      // 创建新书籍时清空之前的缓存
      resetEditor()
      setShowUploadModal(true)
      setLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    if (book) {
      setTitle(book.title)
    }
  }, [book])

  const loadBook = async (id: string) => {
    try {
      const response = await bookApi.getBook(id)
      if (response.data.success && response.data.data) {
        setBook(response.data.data)
      }
    } catch (error) {
      console.error('Failed to load book:', error)
      alert('加载失败')
      navigate('/my-works')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!book) return

    setSaving(true)
    try {
      if (title !== book.title) {
        updateBookTitle(title)
      }

      if (bookId) {
        await bookApi.updateBook(bookId, { ...book, title })
      } else {
        const response = await bookApi.createBook({ ...book, title })
        if (response.data.success && response.data.data) {
          navigate(`/editor/${response.data.data.id}`, { replace: true })
        }
      }
      alert('保存成功')
    } catch (error) {
      console.error('Failed to save book:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!book || !bookId) {
      alert('请先保存作品')
      return
    }

    try {
      const response = await bookApi.publishBook(bookId)
      if (response.data.success && response.data.data) {
        alert('发布成功！')
        window.open(response.data.data.shareUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to publish book:', error)
      alert('发布失败')
    }
  }

  const handleUploadComplete = (pages: BookPage[]) => {
    const newBook = {
      id: bookId || '',
      userId: '',
      title: '未命名作品',
      pages,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setBook(newBook)
    setShowUploadModal(false)
  }

  const handleAddText = () => {
    if (!book) return

    // 画布尺寸: 748 × 1000
    const textWidth = 200
    const textHeight = 50
    const newTextElement = {
      id: `text-${Date.now()}`,
      content: '双击编辑文字',
      x: (748 - textWidth) / 2,   // 居中: (748 - 200) / 2 = 274
      y: (1000 - textHeight) / 2,  // 居中: (1000 - 50) / 2 = 475
      width: textWidth,
      height: textHeight,
      fontSize: 18,
      fontFamily: 'Arial',
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textAlign: 'center',
      lineHeight: 1.5,
      letterSpacing: 0,
      textDecoration: 'none',
    }

    addTextElement(currentPageIndex, newTextElement)
  }

  const handleAddMusic = () => {
    setShowMusicModal(true)
  }

  // 底部工具栏功能
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPage(currentPageIndex - 1)
    }
  }

  const handleNextPage = () => {
    if (book && currentPageIndex < book.pages.length - 1) {
      setCurrentPage(currentPageIndex + 1)
    }
  }

  const handleFirstPage = () => {
    setCurrentPage(0)
  }

  const handleLastPage = () => {
    if (book) {
      setCurrentPage(book.pages.length - 1)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  const handleAddPage = () => {
    if (!book) return
    
    // 创建一个新的空白页面
    const newPage = {
      id: `page-${Date.now()}`,
      imageUrl: book.pages[book.pages.length - 1]?.imageUrl || '', // 使用最后一页的背景图，或空白
      textElements: [],
      audioElements: [],
    }
    
    addPage(newPage)
    // 跳转到新添加的页面
    setCurrentPage(book.pages.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!book && !showUploadModal) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Unified Top Bar */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        {/* Left Section - Logo, Title, Pages */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate('/my-works')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <FiBook className="w-6 h-6 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Click Book
            </span>
          </button>
          
          <div className="h-6 w-px bg-gray-700"></div>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="作品标题"
          />
          <span className="text-gray-400 text-sm">
            {book?.pages.length || 0} 页
          </span>
        </div>
          
        {/* Center Section - Add Components */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddText}
            className="px-4 py-2 hover:bg-gray-800 text-white transition-colors flex items-center gap-2 rounded-lg"
            title="添加文本"
          >
            <FiType size={18} />
            <span className="text-sm">文本</span>
          </button>
          <button
            onClick={handleAddMusic}
            className="px-4 py-2 hover:bg-gray-800 text-white transition-colors flex items-center gap-2 rounded-lg"
            title="添加音乐"
          >
            <FiMusic size={18} />
            <span className="text-sm">音乐</span>
          </button>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiSave size={16} />
            <span className="text-sm">{saving ? '保存中...' : '保存'}</span>
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiEye size={16} />
            <span className="text-sm">发布与导出</span>
          </button>
          
          <div className="h-6 w-px bg-gray-700"></div>
          
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FiUser className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{user?.username}</span>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              title="退出"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm">退出</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pages */}
        {showLeftPanel && <EditorSidebar />}

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <EditorCanvas zoom={zoom} onZoomChange={setZoom} />
        </div>

        {/* Right Sidebar - Properties */}
        {showRightPanel && <EditorProperties />}
      </div>

      {/* Bottom Toolbar */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* Left Section - Add Page + Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddPage}
              disabled={!book}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center space-x-1.5"
              title="添加页面"
            >
              <FiPlus className="w-4 h-4" />
              <span className="text-xs">添加页面</span>
            </button>
            
            <div className="w-px h-5 bg-gray-700 mx-1"></div>
            
            <button
              onClick={handleFirstPage}
              disabled={!book || currentPageIndex === 0}
              className="p-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded transition-colors"
              title="第一页"
            >
              <FiSkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrevPage}
              disabled={!book || currentPageIndex === 0}
              className="p-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded transition-colors"
              title="上一页"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-gray-400 text-xs px-3 min-w-[80px] text-center">
              {book ? `${currentPageIndex + 1} / ${book.pages.length}` : '0 / 0'}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!book || currentPageIndex >= (book?.pages.length || 0) - 1}
              className="p-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded transition-colors"
              title="下一页"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLastPage}
              disabled={!book || currentPageIndex >= (book?.pages.length || 0) - 1}
              className="p-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded transition-colors"
              title="最后一页"
            >
              <FiSkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Center Section - Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded transition-colors"
              title="缩小"
            >
              <FiZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="text-gray-400 hover:text-white text-xs px-3 min-w-[50px] text-center hover:bg-gray-800 rounded transition-colors py-1"
              title="重置缩放"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded transition-colors"
              title="放大"
            >
              <FiZoomIn className="w-4 h-4" />
            </button>
            
            <div className="w-px h-5 bg-gray-700 mx-2"></div>
            
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${
                showGrid ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
              title="网格"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowRuler(!showRuler)}
              className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${
                showRuler ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
              title="标尺"
            >
              <FiMaximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Right Section - Panel Toggle + View Info */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLeftPanel}
              className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${
                showLeftPanel ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
              title={showLeftPanel ? '隐藏页面列表' : '显示页面列表'}
            >
              <FiSidebar className="w-4 h-4" />
            </button>
            <button
              onClick={toggleRightPanel}
              className={`p-1.5 hover:bg-gray-800 rounded transition-colors ${
                showRightPanel ? 'text-blue-400' : 'text-gray-400 hover:text-white'
              }`}
              title={showRightPanel ? '隐藏属性设置' : '显示属性设置'}
            >
              <FiSidebar className="w-4 h-4 transform rotate-180" />
            </button>
            
            <div className="w-px h-5 bg-gray-700 mx-1"></div>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <span>画布: 748 × 1000</span>
              <span>•</span>
              <span>缩放: {zoom}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => {
            if (!book) {
              navigate('/my-works')
            }
            setShowUploadModal(false)
          }}
          onComplete={handleUploadComplete}
        />
      )}

      {/* Music Library Modal */}
      {showMusicModal && (
        <MusicLibraryModal
          onClose={() => setShowMusicModal(false)}
          onSelect={(audioUrl, name) => {
            if (!book) return

            // 创建新的音频元素，图标显示在页面中心位置
            // 画布尺寸: 748 × 1000，图标尺寸: 48
            const iconSize = 48
            const newAudioElement = {
              id: `audio-${Date.now()}`,
              audioUrl: audioUrl,
              name: name,
              behavior: {
                playMode: 'once' as const,
                autoPlay: false,
                stopOnLeave: false,
                volume: 1.0,
              },
              iconStyle: {
                x: (748 - iconSize) / 2,  // 居中: (748 - 48) / 2 = 350
                y: (1000 - iconSize) / 2,  // 居中: (1000 - 48) / 2 = 476
                size: iconSize,
                color: '#1f2937',
                icon: '🎵',
              },
            }

            addAudioElement(currentPageIndex, newAudioElement)
            setShowMusicModal(false)
          }}
        />
      )}
    </div>
  )
}

