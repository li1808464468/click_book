import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadApi } from '@/services/api'
import type { BookPage } from '@shared/index'
import { FiUpload, FiFile, FiImage } from 'react-icons/fi'

interface UploadModalProps {
  onClose: () => void
  onComplete: (pages: BookPage[]) => void
}

export default function UploadModal({ onClose, onComplete }: UploadModalProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'pdf' | 'images'>('pdf')
  const [progress, setProgress] = useState(0)

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      let response

      if (uploadType === 'pdf') {
        response = await uploadApi.uploadPdf(acceptedFiles[0], (p) => setProgress(p))
      } else {
        response = await uploadApi.uploadImages(acceptedFiles, (p) => setProgress(p))
      }

      if (response.data.success && response.data.data) {
        const urls = response.data.data.fileUrls || [response.data.data.fileUrl!]
        const pages: BookPage[] = urls.map((url, index) => ({
          id: `page-${Date.now()}-${index}`,
          pageNumber: index + 1,
          imageUrl: url,
          textElements: [],
          audioElements: [],
        }))

        onComplete(pages)
      } else {
        alert('上传失败：' + response.data.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: uploadType === 'pdf' 
      ? { 'application/pdf': ['.pdf'] }
      : { 'image/*': ['.jpg', '.jpeg', '.png'] },
    disabled: uploading,
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">上传文档</h2>
          <p className="text-gray-600">生成翻页电子书</p>
        </div>

        {/* Type Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setUploadType('pdf')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              uploadType === 'pdf'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FiFile className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="font-semibold">单文件上传</div>
            <div className="text-sm text-gray-600">PDF格式</div>
          </button>

          <button
            onClick={() => setUploadType('images')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              uploadType === 'images'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FiImage className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="font-semibold">图片上传</div>
            <div className="text-sm text-gray-600">JPG, PNG格式</div>
          </button>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <FiUpload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          {uploading ? (
            <div className="w-full max-w-xs mx-auto">
              <p className="text-xl font-semibold text-gray-900 mb-2">
                {progress < 100 ? `上传中 ${progress}%` : '正在处理...'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-300 ease-out ${
                    progress < 100 ? 'bg-blue-600' : 'bg-green-500 w-full animate-pulse'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-sm animate-pulse">
                {progress < 100 
                  ? '正在上传文件...' 
                  : '正在转换格式和生成页面，大文件可能需要几分钟，请耐心等待...'}
              </p>
            </div>
          ) : isDragActive ? (
            <div>
              <p className="text-xl font-semibold text-blue-500 mb-2">释放以上传</p>
            </div>
          ) : (
            <div>
              <p className="text-xl font-semibold text-gray-900 mb-2">
                拖放文件到此处，或点击选择
              </p>
              <p className="text-gray-600">
                {uploadType === 'pdf'
                  ? '支持PDF格式，将自动拆分为单页'
                  : '支持JPG、PNG格式，可多选'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={uploading}>
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

