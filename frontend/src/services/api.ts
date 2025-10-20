import axios from 'axios'
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Book,
  UploadResponse,
} from '@shared/index'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    const { state } = JSON.parse(authStorage)
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  getProfile: () =>
    api.get<ApiResponse>('/auth/profile'),

  getMyAudio: () =>
    api.get<ApiResponse<Array<{ id: string; name: string; url: string; md5?: string; uploadedAt: string }>>>('/auth/my-audio'),

  deleteAudio: (audioId: string) =>
    api.delete<ApiResponse>(`/auth/my-audio/${audioId}`),
}

export const bookApi = {
  getMyBooks: () =>
    api.get<ApiResponse<Book[]>>('/books'),

  getBook: (id: string) =>
    api.get<ApiResponse<Book>>(`/books/${id}`),

  getBookByShareId: (shareId: string) =>
    api.get<ApiResponse<Book>>(`/books/share/${shareId}`),

  createBook: (data: Partial<Book>) =>
    api.post<ApiResponse<Book>>('/books', data),

  updateBook: (id: string, data: Partial<Book>) =>
    api.put<ApiResponse<Book>>(`/books/${id}`, data),

  deleteBook: (id: string) =>
    api.delete<ApiResponse>(`/books/${id}`),

  publishBook: (id: string) =>
    api.post<ApiResponse<{ shareUrl: string }>>(`/books/${id}/publish`),
}

export const uploadApi = {
  uploadPdf: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiResponse<UploadResponse>>('/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadImages: (files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return api.post<ApiResponse<UploadResponse>>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadAudio: (file: File, md5?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (md5) {
      formData.append('md5', md5)
    }
    return api.post<ApiResponse<UploadResponse & { duplicate?: boolean; message?: string }>>('/upload/audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default api

