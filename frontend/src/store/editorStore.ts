import { create } from 'zustand'
import type { Book, BookPage, TextElement, AudioElement } from '@shared/index'

interface EditorState {
  book: Book | null
  currentPageIndex: number
  selectedElement: string | null
  showLeftPanel: boolean
  showRightPanel: boolean
  setBook: (book: Book) => void
    resetEditor: () => void
  setCurrentPage: (index: number) => void
  selectElement: (id: string | null) => void
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  addTextElement: (pageIndex: number, element: TextElement) => void
  updateTextElement: (pageIndex: number, elementId: string, updates: Partial<TextElement>) => void
  removeTextElement: (pageIndex: number, elementId: string) => void
  addAudioElement: (pageIndex: number, element: AudioElement) => void
  updateAudioElement: (pageIndex: number, elementId: string, updates: Partial<AudioElement>) => void
  removeAudioElement: (pageIndex: number, elementId: string) => void
  addPage: (page: BookPage) => void
  removePage: (pageIndex: number) => void
  updateBookTitle: (title: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  book: null,
  currentPageIndex: 0,
  selectedElement: null,
  showLeftPanel: true,
  showRightPanel: true,

  setBook: (book) => set({ book, currentPageIndex: 0 }),

  resetEditor: () => set({ book: null, currentPageIndex: 0, selectedElement: null }),

  setCurrentPage: (index) => set({ currentPageIndex: index }),

  selectElement: (id) => set({ selectedElement: id }),

  toggleLeftPanel: () => set((state) => ({ showLeftPanel: !state.showLeftPanel })),

  toggleRightPanel: () => set((state) => ({ showRightPanel: !state.showRightPanel })),

  addTextElement: (pageIndex, element) =>
    set((state) => {
      if (!state.book) return state
      const pages = [...state.book.pages]
      pages[pageIndex] = {
        ...pages[pageIndex],
        textElements: [...pages[pageIndex].textElements, element],
      }
      return { book: { ...state.book, pages } }
    }),

  updateTextElement: (pageIndex, elementId, updates) =>
    set((state) => {
      if (!state.book) return state
      const pages = [...state.book.pages]
      const textElements = pages[pageIndex].textElements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      )
      pages[pageIndex] = { ...pages[pageIndex], textElements }
      return { book: { ...state.book, pages } }
    }),

  removeTextElement: (pageIndex, elementId) =>
    set((state) => {
      if (!state.book) return state
      const pages = [...state.book.pages]
      pages[pageIndex] = {
        ...pages[pageIndex],
        textElements: pages[pageIndex].textElements.filter((el) => el.id !== elementId),
      }
      return { book: { ...state.book, pages } }
    }),

  addAudioElement: (pageIndex, element) =>
    set((state) => {
      if (!state.book) return state
      const pages = [...state.book.pages]
      pages[pageIndex] = {
        ...pages[pageIndex],
        audioElements: [...pages[pageIndex].audioElements, element],
      }
      return { book: { ...state.book, pages } }
    }),

  updateAudioElement: (pageIndex, elementId, updates) =>
    set((state) => {
      if (!state.book) return state
      const pages = [...state.book.pages]
      const audioElements = pages[pageIndex].audioElements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      )
      pages[pageIndex] = { ...pages[pageIndex], audioElements }
      return { book: { ...state.book, pages } }
    }),

  removeAudioElement: (pageIndex, elementId) =>
    set((state) => {
      if (!state.book) return state
      const pages = [...state.book.pages]
      pages[pageIndex] = {
        ...pages[pageIndex],
        audioElements: pages[pageIndex].audioElements.filter((el) => el.id !== elementId),
      }
      return { book: { ...state.book, pages } }
    }),

  addPage: (page) =>
    set((state) => {
      if (!state.book) return state
      return { book: { ...state.book, pages: [...state.book.pages, page] } }
    }),

  removePage: (pageIndex) =>
    set((state) => {
      if (!state.book) return state
      const pages = state.book.pages.filter((_, idx) => idx !== pageIndex)
      return { book: { ...state.book, pages } }
    }),

  updateBookTitle: (title) =>
    set((state) => {
      if (!state.book) return state
      return { book: { ...state.book, title } }
    }),
}))

