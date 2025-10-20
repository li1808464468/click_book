import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import type { TextElement, AudioElement } from '@shared/index'

interface EditorCanvasProps {
  zoom: number
  onZoomChange: (zoom: number) => void
}

export default function EditorCanvas({ zoom, onZoomChange }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const { book, currentPageIndex, selectedElement, selectElement, updateTextElement, updateAudioElement } = useEditorStore()
  const [editingText, setEditingText] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; type: 'text' | 'audio'; offsetX: number; offsetY: number } | null>(null)

  // 计算基础缩放比例
  const scale = zoom / 100

  // 鼠标滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 根据滚轮方向调整缩放
    const delta = e.deltaY > 0 ? -10 : 10
    const newZoom = Math.max(50, Math.min(200, zoom + delta))
    onZoomChange(newZoom)
  }

  if (!book || !book.pages[currentPageIndex]) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">请先上传文件</p>
      </div>
    )
  }

  const currentPage = book.pages[currentPageIndex]

  const handleTextDoubleClick = (textId: string) => {
    setEditingText(textId)
    selectElement(textId)
  }

  const handleTextChange = (textId: string, newContent: string) => {
    updateTextElement(currentPageIndex, textId, { content: newContent })
  }

  const handleTextBlur = () => {
    setEditingText(null)
  }

  // 音频图标拖拽处理
  const handleAudioMouseDown = (e: React.MouseEvent, audioId: string, audio: AudioElement) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 获取画布容器的位置
    const canvas = e.currentTarget.parentElement
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    setDragging({
      id: audioId,
      type: 'audio',
      offsetX: mouseX - audio.iconStyle.x * scale,
      offsetY: mouseY - audio.iconStyle.y * scale,
    })
    selectElement(audioId)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !book) return

    const currentPage = book.pages[currentPageIndex]
    
    if (dragging.type === 'audio') {
      const audio = currentPage.audioElements.find(a => a.id === dragging.id)
      if (!audio) return

      // 获取画布容器的位置
      const canvas = e.currentTarget as HTMLElement
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // 计算新的位置（先减去offset，再除以scale转换回原始坐标）
      const newX = (mouseX - dragging.offsetX) / scale
      const newY = (mouseY - dragging.offsetY) / scale

      // 限制在画布范围内
      const boundedX = Math.max(0, Math.min(748 - audio.iconStyle.size, newX))
      const boundedY = Math.max(0, Math.min(1000 - audio.iconStyle.size, newY))

      updateAudioElement(currentPageIndex, dragging.id, {
        iconStyle: { ...audio.iconStyle, x: boundedX, y: boundedY },
      })
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  return (
    <div 
      ref={canvasRef} 
      className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-hidden"
      onWheel={handleWheel}
    >
      <div
        className="relative bg-white shadow-2xl"
        style={{
          width: 748 * scale,
          height: 1000 * scale,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Image */}
        <img
          src={currentPage.imageUrl}
          alt={`Page ${currentPageIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Text Elements */}
        {currentPage.textElements.map((text) => (
          <div
            key={text.id}
            className={`absolute cursor-move ${
              selectedElement === text.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              left: text.x * scale,
              top: text.y * scale,
              width: text.width * scale,
              height: text.height * scale,
            }}
            onClick={() => selectElement(text.id)}
            onDoubleClick={() => handleTextDoubleClick(text.id)}
          >
            {editingText === text.id ? (
              <textarea
                autoFocus
                value={text.content}
                onChange={(e) => handleTextChange(text.id, e.target.value)}
                onBlur={handleTextBlur}
                className="w-full h-full resize-none border-2 border-blue-500 p-2"
                style={{
                  fontSize: text.fontSize * scale,
                  fontFamily: text.fontFamily,
                  color: text.color,
                  fontWeight: text.fontWeight,
                  fontStyle: text.fontStyle,
                  textAlign: text.textAlign as any,
                  lineHeight: text.lineHeight,
                  letterSpacing: text.letterSpacing * scale,
                  textDecoration: text.textDecoration,
                }}
              />
            ) : (
              <div
                className="w-full h-full p-2 break-words"
                style={{
                  fontSize: text.fontSize * scale,
                  fontFamily: text.fontFamily,
                  color: text.color,
                  fontWeight: text.fontWeight,
                  fontStyle: text.fontStyle,
                  textAlign: text.textAlign as any,
                  lineHeight: text.lineHeight,
                  letterSpacing: text.letterSpacing * scale,
                  textDecoration: text.textDecoration,
                }}
              >
                {text.content}
              </div>
            )}
          </div>
        ))}

        {/* Audio Elements */}
        {currentPage.audioElements.map((audio) => (
          <div
            key={audio.id}
            className={`absolute cursor-move ${
              selectedElement === audio.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              left: audio.iconStyle.x * scale,
              top: audio.iconStyle.y * scale,
              width: audio.iconStyle.size * scale,
              height: audio.iconStyle.size * scale,
            }}
            onClick={() => selectElement(audio.id)}
            onMouseDown={(e) => handleAudioMouseDown(e, audio.id, audio)}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: audio.iconStyle.color }}
            >
              <span className="text-white" style={{ fontSize: 24 * scale }}>{audio.iconStyle.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

