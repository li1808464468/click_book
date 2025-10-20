import { useState, useEffect } from 'react'
import { uploadApi, authApi } from '@/services/api'
import { FiUpload, FiMusic, FiTrash2 } from 'react-icons/fi'
import SparkMD5 from 'spark-md5'

interface MusicLibraryModalProps {
  onClose: () => void
  onSelect: (audioUrl: string, name: string) => void
}

interface AudioFile {
  id: string
  name: string
  url: string
  md5?: string
  uploadedAt: string
}

// 计算文件MD5
const calculateMD5 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const spark = new SparkMD5.ArrayBuffer()
      spark.append(e.target?.result as ArrayBuffer)
      resolve(spark.end())
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const DEFAULT_MUSIC = [
  { id: '1', name: '轻松愉快-轻松愉悦.mp3', url: '/audio/default/1.mp3' },
  { id: '2', name: '云端之上-电子音乐.mp3', url: '/audio/default/2.mp3' },
  { id: '3', name: '魔星-爵士女声.mp3', url: '/audio/default/3.mp3' },
]

export default function MusicLibraryModal({ onClose, onSelect }: MusicLibraryModalProps) {
  const [tab, setTab] = useState<'shared' | 'mine'>('shared')
  const [uploading, setUploading] = useState(false)
  const [myMusic, setMyMusic] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // 初始化：检查用户是否有音乐，决定默认显示哪个标签页
  useEffect(() => {
    const initializeModal = async () => {
      try {
        console.log('🎵 初始化音乐库...')
        const response = await authApi.getMyAudio()
        if (response.data.success && response.data.data) {
          setMyMusic(response.data.data)
          // 如果用户有上传过音乐，默认显示"我的音乐"标签页
          if (response.data.data.length > 0) {
            console.log('🎵 用户有音乐，默认显示"我的音乐"')
            setTab('mine')
          } else {
            console.log('🎵 用户无音乐，默认显示"共享资源"')
          }
        }
      } catch (error) {
        console.error('❌ 初始化音乐库错误:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }
    
    initializeModal()
  }, [])

  // 当用户手动切换到"我的音乐"标签时，如果数据已过期则刷新
  // 注意：初始化时已经加载过数据，这里只处理后续的标签切换

  const loadMyMusic = async () => {
    if (!initialized) return // 避免在初始化期间重复加载
    
    setLoading(true)
    try {
      console.log('🎵 刷新音乐列表...')
      const response = await authApi.getMyAudio()
      console.log('🎵 API响应:', response.data)
      if (response.data.success && response.data.data) {
        console.log('🎵 音乐列表:', response.data.data)
        setMyMusic(response.data.data)
      } else {
        console.log('🎵 加载失败:', response.data.message)
      }
    } catch (error) {
      console.error('❌ 加载音乐错误:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a']
    const allowedExts = ['.mp3', '.wav', '.ogg', '.m4a']
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(fileExt)) {
      alert(`不支持的音频格式。请上传 MP3, WAV, OGG 或 M4A 格式的音频文件。\n当前文件: ${file.type || '未知类型'}`)
      e.target.value = ''
      return
    }

    // 验证文件大小（最大50MB）
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      alert('文件太大！最大支持50MB的音频文件。')
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      console.log('🎵 开始上传音频文件:', file.name)
      
      // 计算文件MD5
      console.log('📊 正在计算MD5...')
      const md5 = await calculateMD5(file)
      console.log('📊 文件MD5:', md5)

      // 检查是否已存在
      const existing = myMusic.find(audio => audio.md5 === md5)
      if (existing) {
        alert(`文件已存在：${existing.name}\n无需重复上传`)
        e.target.value = ''
        setUploading(false)
        return
      }

      const response = await uploadApi.uploadAudio(file, md5)
      console.log('🎵 上传响应:', response.data)
      
      if (response.data.success && response.data.data) {
        const wasEmpty = myMusic.length === 0
        if (response.data.data.duplicate) {
          console.log('⚠️  文件已存在（后端检查）')
          alert(response.data.data.message || '文件已存在')
        } else {
          console.log('✅ 上传成功')
        }
        // 刷新音乐列表
        await loadMyMusic()
        // 如果之前没有音乐，上传成功后自动切换到"我的音乐"标签
        if (wasEmpty && tab === 'shared') {
          setTab('mine')
        }
      } else {
        alert('上传失败: ' + (response.data.message || '未知错误'))
      }
    } catch (error: any) {
      console.error('❌ 上传错误:', error)
      const errorMsg = error.response?.data?.message || error.message || '上传失败，请稍后重试'
      alert('上传失败: ' + errorMsg)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (audioId: string, name: string) => {
    if (!window.confirm(`确定要删除 "${name}" 吗？`)) {
      return
    }

    try {
      console.log('🗑️ 删除音乐:', audioId)
      const response = await authApi.deleteAudio(audioId)
      if (response.data.success) {
        console.log('✅ 删除成功')
        // 刷新列表
        await loadMyMusic()
      } else {
        alert('删除失败: ' + response.data.message)
      }
    } catch (error: any) {
      console.error('❌ 删除错误:', error)
      alert('删除失败: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">音乐库</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4">
            <button
              onClick={() => setTab('shared')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === 'shared'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              共享资源
            </button>
            <button
              onClick={() => setTab('mine')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                tab === 'mine'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              我的音乐
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'shared' && (
            <div className="space-y-2">
              {DEFAULT_MUSIC.map((music) => (
                <div
                  key={music.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiMusic className="text-blue-500" />
                    <span className="text-gray-900">{music.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      onSelect(music.url, music.name)
                      onClose()
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    使用
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'mine' && (
            <div>
              {!initialized || loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">加载中...</p>
                </div>
              ) : myMusic.length > 0 ? (
                <div className="space-y-2">
                  {myMusic.map((music) => (
                    <div
                      key={music.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <FiMusic className="text-green-500" />
                        <div className="flex-1">
                          <div className="text-gray-900">{music.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(music.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onSelect(music.url, music.name)
                            onClose()
                          }}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          使用
                        </button>
                        <button
                          onClick={() => handleDelete(music.id, music.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="删除"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* 上传按钮 */}
                  <div className="pt-4 border-t border-gray-200 text-center">
                    <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-colors">
                      <FiUpload className="mr-2" />
                      {uploading ? '上传中...' : '上传更多音乐'}
                      <input
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">支持 MP3、WAV、OGG、M4A 格式，最大50MB</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiMusic className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 mb-6">还没有上传音乐</p>
                  <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-cyan-600 transition-colors">
                    <FiUpload className="mr-2" />
                    {uploading ? '上传中...' : '上传音乐'}
                    <input
                      type="file"
                      accept=".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a"
                      onChange={handleUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-4">支持 MP3、WAV、OGG、M4A 格式，最大50MB</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

