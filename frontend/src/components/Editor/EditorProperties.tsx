import { useEditorStore } from '@/store/editorStore'
import { useState, useEffect } from 'react'
import type { TextElement, AudioElement } from '@shared/index'
import MusicLibraryModal from './MusicLibraryModal'

export default function EditorProperties() {
  const { book, currentPageIndex, selectedElement, updateTextElement, updateAudioElement, removeTextElement, removeAudioElement } = useEditorStore()
  const [properties, setProperties] = useState<Partial<TextElement | AudioElement>>({})
  const [showMusicModal, setShowMusicModal] = useState(false)

  useEffect(() => {
    if (book && selectedElement) {
      const currentPage = book.pages[currentPageIndex]
      const textElement = currentPage.textElements.find((el) => el.id === selectedElement)
      const audioElement = currentPage.audioElements.find((el) => el.id === selectedElement)
      
      if (textElement) {
        setProperties(textElement)
      } else if (audioElement) {
        setProperties(audioElement)
      }
    } else {
      setProperties({})
    }
  }, [book, selectedElement, currentPageIndex])

  if (!selectedElement || !book) {
    return (
      <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col p-4">
        <h3 className="text-gray-800 font-semibold mb-4">属性设置</h3>
        <p className="text-gray-500 text-sm">请选择一个元素以查看其属性</p>
      </div>
    )
  }

  const currentPage = book.pages[currentPageIndex]
  const isTextElement = currentPage.textElements.some((el) => el.id === selectedElement)
  const isAudioElement = currentPage.audioElements.some((el) => el.id === selectedElement)

  const handleTextPropertyChange = (key: keyof TextElement, value: any) => {
    updateTextElement(currentPageIndex, selectedElement, { [key]: value })
  }

  const handleDelete = () => {
    if (confirm('确定要删除这个元素吗？')) {
      if (isTextElement) {
        removeTextElement(currentPageIndex, selectedElement)
      } else if (isAudioElement) {
        removeAudioElement(currentPageIndex, selectedElement)
      }
    }
  }

  return (
    <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-gray-800 font-semibold">
          {isTextElement ? '文本设置' : '音频设置'}
        </h3>
        <button
          onClick={handleDelete}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
        >
          删除
        </button>
      </div>

      <div className="p-4 space-y-4">
        {isTextElement && (
          <>
            <div>
              <label className="block text-gray-700 text-sm mb-2">字体大小</label>
              <input
                type="number"
                value={(properties as TextElement).fontSize || 18}
                onChange={(e) => handleTextPropertyChange('fontSize', parseInt(e.target.value))}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">字体</label>
              <select
                value={(properties as TextElement).fontFamily || 'Arial'}
                onChange={(e) => handleTextPropertyChange('fontFamily', e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 px-3 py-2 rounded"
              >
                <option value="Arial">Arial</option>
                <option value="微软雅黑">微软雅黑</option>
                <option value="宋体">宋体</option>
                <option value="黑体">黑体</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">文本颜色</label>
              <input
                type="color"
                value={(properties as TextElement).color || '#000000'}
                onChange={(e) => handleTextPropertyChange('color', e.target.value)}
                className="w-full h-10 bg-gray-50 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">字重</label>
              <select
                value={(properties as TextElement).fontWeight || 'normal'}
                onChange={(e) => handleTextPropertyChange('fontWeight', e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 px-3 py-2 rounded"
              >
                <option value="normal">正常</option>
                <option value="bold">粗体</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">对齐方式</label>
              <select
                value={(properties as TextElement).textAlign || 'left'}
                onChange={(e) => handleTextPropertyChange('textAlign', e.target.value)}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 px-3 py-2 rounded"
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">行高</label>
              <input
                type="number"
                step="0.1"
                value={(properties as TextElement).lineHeight || 1.5}
                onChange={(e) => handleTextPropertyChange('lineHeight', parseFloat(e.target.value))}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm mb-2">字间距</label>
              <input
                type="number"
                value={(properties as TextElement).letterSpacing || 0}
                onChange={(e) => handleTextPropertyChange('letterSpacing', parseInt(e.target.value))}
                className="w-full bg-gray-50 text-gray-900 border border-gray-300 px-3 py-2 rounded"
              />
            </div>
          </>
        )}

        {isAudioElement && (
          <>
            {/* 音频设置 */}
            <div className="pb-4 border-b border-gray-200">
              <h4 className="text-gray-800 font-semibold mb-3">音频设置</h4>
              <div>
                <label className="block text-gray-700 text-sm mb-2">音乐名称</label>
                <div className="relative">
                  <input
                    type="text"
                    value={(properties as AudioElement).name || ''}
                    className="w-full bg-gray-50 text-gray-900 border border-gray-300 px-3 py-2 rounded text-sm cursor-pointer hover:bg-gray-600 transition-colors"
                    readOnly
                    onClick={() => setShowMusicModal(true)}
                    placeholder="点击选择音乐"
                  />
                  <button
                    onClick={() => setShowMusicModal(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                  >
                    更换
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">点击可重新选择音乐</p>
              </div>
            </div>

            {/* 图标设置 */}
            <div className="pb-3 border-b border-gray-200">
              <h4 className="text-gray-800 font-semibold mb-2 text-sm">图标设置</h4>
              
              {/* 图标选择 */}
              <div className="mb-2">
                <label className="block text-gray-700 text-xs mb-1">播放图标</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['🎵', '🎶', '🎧', '🔊', '▶️', '⏸️', '⏯️', '🎼'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        const audio = properties as AudioElement
                        updateAudioElement(currentPageIndex, selectedElement, {
                          iconStyle: { ...audio.iconStyle, icon: emoji },
                        })
                      }}
                      className={`p-2 rounded text-xl transition-colors ${
                        (properties as AudioElement).iconStyle?.icon === emoji
                          ? 'bg-gray-800'
                          : 'bg-gray-50 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 图标大小 */}
              <div className="mb-2">
                <label className="block text-gray-700 text-xs mb-1">
                  大小: {(properties as AudioElement).iconStyle?.size || 36}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="80"
                  value={(properties as AudioElement).iconStyle?.size || 36}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      iconStyle: { ...audio.iconStyle, size: parseInt(e.target.value) },
                    })
                  }}
                  className="w-full range-dark"
                  style={{
                    '--value': `${((((properties as AudioElement).iconStyle?.size || 36) - 24) / (80 - 24)) * 100}%`
                  } as React.CSSProperties}
                />
              </div>

              {/* 图标颜色 */}
              <div>
                <label className="block text-gray-700 text-xs mb-1">颜色</label>
                <input
                  type="color"
                  value={(properties as AudioElement).iconStyle?.color || '#1f2937'}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      iconStyle: { ...audio.iconStyle, color: e.target.value },
                    })
                  }}
                  className="w-full h-8 bg-gray-50 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* 播放控制 */}
            <div className="pb-4 border-b border-gray-200">
              <h4 className="text-gray-800 font-semibold mb-3">播放控制</h4>
              
              {/* 进入播放 */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-700 text-sm">进入播放</label>
                <input
                  type="checkbox"
                  checked={(properties as AudioElement).behavior?.autoPlay || false}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      behavior: { ...audio.behavior, autoPlay: e.target.checked },
                    })
                  }}
                  className="checkbox-dark"
                />
              </div>

              {/* 离开停止 */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-700 text-sm">离开停止</label>
                <input
                  type="checkbox"
                  checked={(properties as AudioElement).behavior?.stopOnLeave || false}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      behavior: { ...audio.behavior, stopOnLeave: e.target.checked },
                    })
                  }}
                  className="checkbox-dark"
                />
              </div>

              {/* 循环播放 */}
              <div className="flex items-center justify-between mb-3">
                <label className="text-gray-700 text-sm">循环播放</label>
                <input
                  type="checkbox"
                  checked={(properties as AudioElement).behavior?.playMode === 'loop'}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      behavior: { 
                        ...audio.behavior, 
                        playMode: e.target.checked ? 'loop' : 'once' 
                      },
                    })
                  }}
                  className="checkbox-dark"
                />
              </div>

              {/* 音量控制 */}
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  音量: {Math.round(((properties as AudioElement).behavior?.volume || 1.0) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={(properties as AudioElement).behavior?.volume || 1.0}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      behavior: { ...audio.behavior, volume: parseFloat(e.target.value) },
                    })
                  }}
                  className="w-full range-dark"
                  style={{
                    '--value': `${((properties as AudioElement).behavior?.volume || 1.0) * 100}%`
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* 位置设置 */}
            <div>
              <h4 className="text-gray-800 font-semibold mb-3">位置设置</h4>
              
              <div className="mb-3">
                <label className="block text-gray-700 text-sm mb-2">
                  X坐标: {(properties as AudioElement).iconStyle?.x || 0}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="700"
                  value={(properties as AudioElement).iconStyle?.x || 0}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      iconStyle: { ...audio.iconStyle, x: parseInt(e.target.value) },
                    })
                  }}
                  className="w-full range-dark"
                  style={{
                    '--value': `${(((properties as AudioElement).iconStyle?.x || 0) / 700) * 100}%`
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Y坐标: {(properties as AudioElement).iconStyle?.y || 0}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="950"
                  value={(properties as AudioElement).iconStyle?.y || 0}
                  onChange={(e) => {
                    const audio = properties as AudioElement
                    updateAudioElement(currentPageIndex, selectedElement, {
                      iconStyle: { ...audio.iconStyle, y: parseInt(e.target.value) },
                    })
                  }}
                  className="w-full range-dark"
                  style={{
                    '--value': `${(((properties as AudioElement).iconStyle?.y || 0) / 950) * 100}%`
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 音乐库模态框 */}
      {showMusicModal && isAudioElement && (
        <MusicLibraryModal
          onClose={() => setShowMusicModal(false)}
          onSelect={(audioUrl, name) => {
            // 更新当前音频元素的音乐URL和名称
            updateAudioElement(currentPageIndex, selectedElement, {
              audioUrl: audioUrl,
              name: name,
            })
            setShowMusicModal(false)
          }}
        />
      )}
    </div>
  )
}

