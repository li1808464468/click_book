// 共享类型定义

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  membershipType: 'free' | 'premium' | 'vip';
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Book {
  id: string;
  userId: string;
  title: string;
  coverImage?: string;
  pages: BookPage[];
  status: 'draft' | 'published';
  shareUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface BookPage {
  id: string;
  pageNumber: number;
  imageUrl: string;
  textElements: TextElement[];
  audioElements: AudioElement[];
}

export interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  lineHeight: number;
  letterSpacing: number;
  textDecoration: string;
}

export interface AudioElement {
  id: string;
  audioUrl: string;
  name: string;
  behavior: AudioBehavior;
  iconStyle: AudioIconStyle;
}

export interface AudioBehavior {
  playMode: 'once' | 'loop' | 'page-enter';
  autoPlay: boolean;
  stopOnLeave: boolean;
  volume: number;
}

export interface AudioIconStyle {
  x: number;
  y: number;
  size: number;
  color: string;
  icon: string;
}

export interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  fileUrls?: string[];
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

