import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import MyWorksPage from '@/pages/MyWorksPage'
import EditorPage from '@/pages/EditorPage'
import ViewerPage from '@/pages/ViewerPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="my-works"
            element={
              <PrivateRoute>
                <MyWorksPage />
              </PrivateRoute>
            }
          />
        </Route>
        <Route
          path="editor/:bookId?"
          element={
            <PrivateRoute>
              <EditorPage />
            </PrivateRoute>
          }
        />
        <Route path="/book/:shareId" element={<ViewerPage />} />
      </Routes>
    </Router>
  )
}

export default App

