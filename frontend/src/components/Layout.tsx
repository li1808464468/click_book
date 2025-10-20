import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { FiUser, FiLogOut, FiBook } from 'react-icons/fi'

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-apple sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <FiBook className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Click Book
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              首页
            </Link>
            <Link to="/my-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              我的作品
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FiUser className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user?.username}</span>
                  {user?.membershipType !== 'free' && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                      {user.membershipType === 'vip' ? 'VIP' : 'Premium'}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>退出</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2024 Click Book. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

