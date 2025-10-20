import { useEffect, useRef, useState, useCallback, forwardRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import type { Book, AudioElement, BookPage, TextElement } from '@shared/index'

interface PageFlipProps {
  book: Book
  currentPage: number
  onPageChange: (page: number) => void
}

// 画布原始尺寸
const CANVAS_WIDTH = 748
const CANVAS_HEIGHT = 1000

// 单页组件
const Page = forwardRef<HTMLDivElement, {
  pageData: BookPage
  scale: number
  playingAudios: Set<string>
  onToggleAudio: (audio: AudioElement) => void
}>(({ pageData, scale, playingAudios, onToggleAudio }, ref) => {
  const imageRef = useRef<HTMLImageElement>(null)

  return (
    <div ref={ref} className="relative bg-white" style={{ 
      width: '100%', 
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* 页面图片 - 填充整个页面 */}
      <img
        ref={imageRef}
        src={pageData.imageUrl}
        alt="Page"
        className="w-full h-full"
        style={{
          userSelect: 'none',
          pointerEvents: 'none',
          objectFit: 'fill',
          display: 'block'
        }}
      />

      {/* 覆盖层容器 */}
      <div 
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {/* 文本元素覆盖层 */}
        {pageData.textElements.map((text: TextElement) => (
          <div
            key={text.id}
            className="absolute pointer-events-none"
            style={{
              left: `${(text.x / CANVAS_WIDTH) * 100}%`,
              top: `${(text.y / CANVAS_HEIGHT) * 100}%`,
              width: `${(text.width / CANVAS_WIDTH) * 100}%`,
              height: `${(text.height / CANVAS_HEIGHT) * 100}%`,
              fontSize: `${text.fontSize * scale}px`,
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

        {/* 音频元素 */}
        {pageData.audioElements.map((audio: AudioElement) => {
          const isPlaying = playingAudios.has(audio.id)
          
          return (
            <div
              key={audio.id}
              className="absolute cursor-pointer z-10"
              style={{
                left: `${(audio.iconStyle.x / CANVAS_WIDTH) * 100}%`,
                top: `${(audio.iconStyle.y / CANVAS_HEIGHT) * 100}%`,
                width: `${(audio.iconStyle.size / CANVAS_WIDTH) * 100}%`,
                height: `${(audio.iconStyle.size / CANVAS_HEIGHT) * 100}%`,
              }}
              onClick={() => onToggleAudio(audio)}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                  isPlaying 
                    ? 'scale-110 animate-pulse' 
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: audio.iconStyle.color }}
              >
                <span className="text-white" style={{ fontSize: `${24 * scale}px` }}>
                  {audio.iconStyle.icon || '🎵'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

Page.displayName = 'Page'

export default function PageFlip({ book, currentPage, onPageChange }: PageFlipProps) {
  const flipBookRef = useRef<any>(null)
  // 保存每个音频元素的 Audio 对象引用
  const audioRefsMap = useRef<Map<string, HTMLAudioElement>>(new Map())
  // 记录哪些音频正在播放
  const [playingAudios, setPlayingAudios] = useState<Set<string>>(new Set())
  // 记录缩放比例
  const [scale, setScale] = useState(1)
  // 窗口尺寸
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 计算翻页书的尺寸和配置
  const isMobile = windowSize.width < 768
  
  // 计算可用空间（减去 padding 和其他 UI 元素）
  const availableWidth = windowSize.width - 80  // 左右留边
  const availableHeight = windowSize.height - 120  // 上下留边
  
  // 根据可用空间和画布比例计算最佳尺寸
  let bookWidth: number
  let bookHeight: number
  
  if (isMobile) {
    // 移动端：单页显示，使用画布原始比例
    const scale = Math.min(
      availableWidth / CANVAS_WIDTH,
      availableHeight / CANVAS_HEIGHT
    )
    bookWidth = CANVAS_WIDTH * scale
    bookHeight = CANVAS_HEIGHT * scale
  } else {
    // 电脑端：双页显示，宽度翻倍
    const scale = Math.min(
      availableWidth / (CANVAS_WIDTH * 2),  // 双页宽度
      availableHeight / CANVAS_HEIGHT
    )
    bookWidth = CANVAS_WIDTH * scale
    bookHeight = CANVAS_HEIGHT * scale
  }

  // 计算缩放比例用于覆盖层
  useEffect(() => {
    const calculatedScale = bookWidth / CANVAS_WIDTH
    setScale(calculatedScale)
  }, [bookWidth])

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

  // 同步外部currentPage到翻页书
  useEffect(() => {
    if (flipBookRef.current) {
      const pageFlip = flipBookRef.current.pageFlip()
      if (pageFlip && pageFlip.getCurrentPageIndex() !== currentPage) {
        pageFlip.turnToPage(currentPage)
      }
    }
  }, [currentPage])

  // 处理翻页事件
  const handleFlip = useCallback((e: any) => {
    const newPage = e.data
    if (newPage !== currentPage) {
      onPageChange(newPage)
    }
  }, [currentPage, onPageChange])

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

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden">
      <div className="relative overflow-hidden" style={{ 
        maxWidth: '100vw',
        maxHeight: '100vh'
      }}>
        <HTMLFlipBook
          ref={flipBookRef}
          width={bookWidth}
          height={bookHeight}
          size="fixed"
          minWidth={200}
          maxWidth={CANVAS_WIDTH * 2}
          minHeight={300}
          maxHeight={CANVAS_HEIGHT}
          drawShadow={true}
          flippingTime={800}
          usePortrait={isMobile}
          startPage={0}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showCover={false}
          mobileScrollSupport={true}
          swipeDistance={30}
          clickEventForward={true}
          useMouseEvents={true}
          showPageCorners={true}
          disableFlipByClick={false}
          onFlip={handleFlip}
          className="shadow-2xl rounded"
          style={{}}
        >
          {book.pages.map((pageData, index) => (
            <Page
              key={index}
              pageData={pageData}
              scale={scale}
              playingAudios={playingAudios}
              onToggleAudio={toggleAudio}
            />
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  )
}

