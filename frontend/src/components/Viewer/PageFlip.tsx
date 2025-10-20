import { useEffect, useRef, useState, useCallback } from 'react'
import type { Book, AudioElement } from '@shared/index'

interface PageFlipProps {
  book: Book
  currentPage: number
  onPageChange: (page: number) => void
}

export default function PageFlip({ book, currentPage, onPageChange }: PageFlipProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  // 保存每个音频元素的 Audio 对象引用
  const audioRefsMap = useRef<Map<string, HTMLAudioElement>>(new Map())
  // 记录哪些音频正在播放
  const [playingAudios, setPlayingAudios] = useState<Set<string>>(new Set())
  // 记录缩放比例
  const [scale, setScale] = useState(1)

  // 画布原始尺寸
  const CANVAS_WIDTH = 748
  const CANVAS_HEIGHT = 1000

  // Simple page display for now, can be enhanced with stpageflip library
  const currentPageData = book.pages[currentPage]

  // 播放音频函数
  const playAudio = useCallback((audio: AudioElement) => {
    let audioEl = audioRefsMap.current.get(audio.id)
    
    // 标准化 URL 用于比较
    const normalizeUrl = (url: string) => {
      try {
        return new URL(url, window.location.origin).href
      } catch {
        return url
      }
    }
    
    const currentUrl = audioEl ? normalizeUrl(audioEl.src) : null
    const newUrl = normalizeUrl(audio.audioUrl)
    
    // 如果音频对象不存在或URL已改变，创建新的
    if (!audioEl || currentUrl !== newUrl) {
      // 清理旧的音频对象
      if (audioEl) {
        audioEl.pause()
        audioEl.remove()
      }
      
      // 创建新的音频对象
      audioEl = new Audio(audio.audioUrl)
      audioEl.volume = audio.behavior?.volume ?? 1.0
      audioEl.loop = audio.behavior?.playMode === 'loop'
      
      // 播放结束事件
      audioEl.addEventListener('ended', () => {
        setPlayingAudios(prev => {
          const newSet = new Set(prev)
          newSet.delete(audio.id)
          return newSet
        })
      })
      
      // 错误处理
      audioEl.addEventListener('error', (e) => {
        console.error('音频加载失败:', audio.audioUrl, e)
        setPlayingAudios(prev => {
          const newSet = new Set(prev)
          newSet.delete(audio.id)
          return newSet
        })
      })
      
      audioRefsMap.current.set(audio.id, audioEl)
    } else {
      // 更新现有音频的设置
      audioEl.volume = audio.behavior?.volume ?? 1.0
      audioEl.loop = audio.behavior?.playMode === 'loop'
    }

    // 播放音频
    audioEl.play().then(() => {
      setPlayingAudios(prev => new Set(prev).add(audio.id))
    }).catch(err => {
      console.error('播放音频失败:', audio.audioUrl, err)
    })
  }, [])

  // 切换音频播放状态
  const toggleAudio = useCallback((audio: AudioElement) => {
    const audioEl = audioRefsMap.current.get(audio.id)
    const isPlaying = playingAudios.has(audio.id)

    if (isPlaying && audioEl) {
      // 暂停音频
      audioEl.pause()
      setPlayingAudios(prev => {
        const newSet = new Set(prev)
        newSet.delete(audio.id)
        return newSet
      })
    } else {
      // 播放音频
      playAudio(audio)
    }
  }, [playAudio, playingAudios])

  // 计算缩放比例
  useEffect(() => {
    const updateScale = () => {
      if (imageRef.current) {
        const imgWidth = imageRef.current.clientWidth
        const imgHeight = imageRef.current.clientHeight
        // 使用宽度或高度中较小的缩放比例，确保内容不会超出边界
        const scaleX = imgWidth / CANVAS_WIDTH
        const scaleY = imgHeight / CANVAS_HEIGHT
        setScale(Math.min(scaleX, scaleY))
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    
    // 图片加载完成后也更新一次
    const img = imageRef.current
    if (img) {
      img.addEventListener('load', updateScale)
    }

    return () => {
      window.removeEventListener('resize', updateScale)
      if (img) {
        img.removeEventListener('load', updateScale)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  // 处理页面切换：停止旧页面音频，播放新页面自动播放音频
  useEffect(() => {
    const currentPageData = book.pages[currentPage]
    if (!currentPageData) return

    // 播放当前页面所有设置了自动播放的音频
    currentPageData.audioElements.forEach(audio => {
      if (audio.behavior?.autoPlay) {
        playAudio(audio)
      }
    })

    // 清理函数：离开页面时停止所有设置了 stopOnLeave 的当前页音频
    return () => {
      currentPageData.audioElements.forEach(audio => {
        if (audio.behavior?.stopOnLeave) {
          const audioEl = audioRefsMap.current.get(audio.id)
          if (audioEl) {
            audioEl.pause()
            audioEl.currentTime = 0
            setPlayingAudios(prev => {
              const newSet = new Set(prev)
              newSet.delete(audio.id)
              return newSet
            })
          }
        }
      })
    }
  }, [currentPage, book, playAudio])

  // 组件卸载时清理所有音频
  useEffect(() => {
    return () => {
      audioRefsMap.current.forEach(audioEl => {
        audioEl.pause()
        audioEl.remove()
      })
      audioRefsMap.current.clear()
    }
  }, [])

  if (!currentPageData) {
    return <div className="text-white">Page not found</div>
  }

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center p-2 md:p-4">
      <div 
        className="relative bg-white shadow-2xl rounded overflow-hidden" 
        style={{ 
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`
        }}
      >
        <img
          ref={imageRef}
          src={currentPageData.imageUrl}
          alt={`Page ${currentPage + 1}`}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Text Elements Overlay */}
        {currentPageData.textElements.map((text) => (
          <div
            key={text.id}
            className="absolute pointer-events-none"
            style={{
              left: text.x * scale,
              top: text.y * scale,
              width: text.width * scale,
              height: text.height * scale,
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
        ))}

        {/* Audio Elements */}
        {currentPageData.audioElements.map((audio) => {
          const isPlaying = playingAudios.has(audio.id)
          
          return (
            <div
              key={audio.id}
              className="absolute cursor-pointer"
              style={{
                left: audio.iconStyle.x * scale,
                top: audio.iconStyle.y * scale,
                width: audio.iconStyle.size * scale,
                height: audio.iconStyle.size * scale,
              }}
              onClick={() => toggleAudio(audio)}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                  isPlaying 
                    ? 'scale-110 animate-pulse' 
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: audio.iconStyle.color }}
              >
                <span className="text-white" style={{ fontSize: 24 * scale }}>{audio.iconStyle.icon || '🎵'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

