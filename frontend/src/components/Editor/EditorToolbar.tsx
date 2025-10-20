import { useEditorStore } from '@/store/editorStore'
import { FiType, FiMusic } from 'react-icons/fi'
import { useState } from 'react'
import MusicLibraryModal from './MusicLibraryModal'

export default function EditorToolbar() {
  const { book, currentPageIndex, addTextElement, addAudioElement } = useEditorStore()
  const [showMusicModal, setShowMusicModal] = useState(false)

  const handleAddText = () => {
    if (!book) return

    const newTextElement = {
      id: `text-${Date.now()}`,
      content: '双击编辑文字',
      x: 150,
      y: 150,
      width: 200,
      height: 50,
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

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-center space-x-2">
        <button
          onClick={handleAddText}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2 border border-gray-300"
        >
          <FiType />
          <span>文本</span>
        </button>

        <button
          onClick={handleAddMusic}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2 border border-gray-300"
        >
          <FiMusic />
          <span>音乐</span>
        </button>
      </div>

      {showMusicModal && (
        <MusicLibraryModal
          onClose={() => setShowMusicModal(false)}
          onSelect={(audioUrl, name) => {
            if (!book) return

            // 创建新的音频元素，图标显示在页面中心位置
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
                x: 350, // 页面中心附近的X坐标（页面宽度748的中心）
                y: 450, // 页面中心附近的Y坐标（页面高度1000的中心）
                size: 48, // 图标大小
                color: '#1f2937', // 深灰色
                icon: '🎵', // 音乐图标
              },
            }

            addAudioElement(currentPageIndex, newAudioElement)
            setShowMusicModal(false)
          }}
        />
      )}
    </>
  )
}

