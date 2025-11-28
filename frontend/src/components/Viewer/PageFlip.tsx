import { useEffect, useRef, useState, useCallback } from 'react'
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
const Page = ({
  pageData,
  pageNumber,
  scale,
  playingAudios,
  onToggleAudio
}: {
  pageData: BookPage
  pageNumber: number
  scale: number
  playingAudios: Set<string>
  onToggleAudio: (audio: AudioElement) => void
}) => {
  const imageRef = useRef<HTMLImageElement>(null)

  // 当 imageUrl 变化时，强制更新图片 src
  useEffect(() => {
    if (imageRef.current && imageRef.current.src !== pageData.imageUrl) {
      imageRef.current.src = pageData.imageUrl
    }
  }, [pageData.imageUrl])

  return (
    <div className="relative bg-white w-full h-full overflow-hidden">
      {/* 页面图片 - 填充整个页面 */}
      <img
        ref={imageRef}
        src={pageData.imageUrl}
        alt={`Page ${pageNumber + 1}`}
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
}

export default function PageFlip({ book, currentPage, onPageChange }: PageFlipProps) {
  const flipBookRef = useRef<any>(null)
  // 保存每个音频元素的 Audio 对象引用
  const audioRefsMap = useRef<Map<string, HTMLAudioElement>>(new Map())
  // 记录哪些音频正在播放
  const [playingAudios, setPlayingAudios] = useState<Set<string>>(new Set())
  // 音频播放队列
  const audioQueueRef = useRef<AudioElement[]>([])
  // 是否正在播放队列
  const isPlayingQueueRef = useRef(false)
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
  const playAudio = useCallback((audio: AudioElement, fromQueue = false) => {
    console.log('playAudio 被调用:', { name: audio.name, id: audio.id, fromQueue })
    
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
    
    // 播放队列中的下一个音频的函数
    const playNext = () => {
      if (audioQueueRef.current.length === 0) {
        isPlayingQueueRef.current = false
        return
      }

      const nextAudio = audioQueueRef.current.shift()
      if (nextAudio) {
        playAudio(nextAudio, true)
      }
    }
    
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
        
        // 如果是从队列播放的音频，播放完后继续播放下一个
        if (fromQueue) {
          playNext()
        }
      })
      
      // 错误处理
      audioEl.addEventListener('error', (e) => {
        console.error('音频加载失败:', audio.audioUrl, e)
        setPlayingAudios(prev => {
          const newSet = new Set(prev)
          newSet.delete(audio.id)
          return newSet
        })
        
        // 如果是从队列播放的音频，出错后继续播放下一个
        if (fromQueue) {
          playNext()
        }
      })
      
      audioRefsMap.current.set(audio.id, audioEl)
    } else {
      // 更新现有音频的设置
      audioEl.volume = audio.behavior?.volume ?? 1.0
      audioEl.loop = audio.behavior?.playMode === 'loop'
    }

    // 播放音频
    console.log('开始播放音频:', audio.name, 'URL:', audio.audioUrl)
    audioEl.play().then(() => {
      console.log('音频播放成功:', audio.name)
      setPlayingAudios(prev => new Set(prev).add(audio.id))
    }).catch(err => {
      console.error('播放音频失败:', audio.audioUrl, err)
      // 如果播放失败且是从队列播放的，继续播放下一个
      if (fromQueue) {
        playNext()
      }
    })
  }, [])

  // 播放队列中的下一个音频
  const playNextInQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingQueueRef.current = false
      return
    }

    const nextAudio = audioQueueRef.current.shift()
    if (!nextAudio) {
      isPlayingQueueRef.current = false
      return
    }

    playAudio(nextAudio, true)
  }, [playAudio])

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

    // 收集所有设置了自动播放的音频
    const autoPlayAudios = currentPageData.audioElements.filter(
      audio => audio.behavior?.autoPlay
    )

    console.log('页面切换，检查自动播放音频:', {
      pageIndex: currentPage,
      totalAudios: currentPageData.audioElements.length,
      autoPlayAudios: autoPlayAudios.length,
      audioDetails: autoPlayAudios.map(a => ({ id: a.id, name: a.name, autoPlay: a.behavior?.autoPlay }))
    })

    // 如果有多个自动播放音频，加入队列按顺序播放
    if (autoPlayAudios.length > 0) {
      // 清空之前的队列
      audioQueueRef.current = []
      isPlayingQueueRef.current = false

      if (autoPlayAudios.length === 1) {
        // 只有一个音频，直接播放
        console.log('播放单个音频:', autoPlayAudios[0].name)
        playAudio(autoPlayAudios[0])
      } else {
        // 多个音频，加入队列按顺序播放
        console.log('加入队列播放，共', autoPlayAudios.length, '个音频')
        audioQueueRef.current = [...autoPlayAudios]
        isPlayingQueueRef.current = true
        playNextInQueue()
      }
    }

    // 清理函数：离开页面时停止所有设置了 stopOnLeave 的当前页音频
    return () => {
      // 停止队列播放
      audioQueueRef.current = []
      isPlayingQueueRef.current = false

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
  }, [currentPage, book, playAudio, playNextInQueue])

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
    <div 
      className="relative w-full h-full flex items-center justify-center bg-gray-900 overflow-hidden"
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
    >
      <div className="relative overflow-hidden" style={{ 
        maxWidth: '100vw',
        maxHeight: '100vh',
        transition: 'transform 0.3s ease-out',
        transform: !isMobile && currentPage === 0 ? 'translateX(-25%)' : 'translateX(0)'
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
          flippingTime={500}
          usePortrait={isMobile}
          startPage={0}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showCover={true}
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
            <div 
              key={`page-${index}-${pageData.imageUrl}`}
              className="page-wrapper"
              style={{ width: '100%', height: '100%' }}
            >
              <Page
                pageData={pageData}
                pageNumber={index}
                scale={scale}
                playingAudios={playingAudios}
                onToggleAudio={toggleAudio}
              />
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  )
}

