import { Link } from 'react-router-dom'
import { FiUpload, FiEdit3, FiShare2, FiZap } from 'react-icons/fi'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              创建令人惊艳的
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                3D翻页电子书
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              简单拖放，即可将PDF或图片转换为精美的3D翻页电子书。支持文字、音乐等丰富功能。
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/editor" className="btn-primary text-lg px-8 py-3">
                <FiZap className="inline-block mr-2" />
                开始制作
              </Link>
              <Link to="/my-works" className="btn-secondary text-lg px-8 py-3">
                查看示例
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">强大功能</h2>
            <p className="text-xl text-gray-600">让你的电子书更加生动有趣</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUpload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">快速上传</h3>
              <p className="text-gray-600">
                支持PDF、图片等多种格式，拖放即可上传，自动转换为电子书页面
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiEdit3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">可视化编辑</h3>
              <p className="text-gray-600">
                直观的编辑器，轻松添加文字、音乐等元素，所见即所得
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiShare2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">一键分享</h3>
              <p className="text-gray-600">
                发布后生成专属链接，支持多平台分享，随时随地阅读
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-cyan-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            准备好创建你的第一本电子书了吗？
          </h2>
          <Link
            to="/editor"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <FiZap className="mr-2" />
            立即开始
          </Link>
        </div>
      </section>
    </div>
  )
}

