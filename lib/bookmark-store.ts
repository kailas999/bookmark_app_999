import { useSyncExternalStore, useCallback } from "react"

export interface Bookmark {
  id: string
  url: string
  title: string
  favicon: string
  collection: string
  isFavorite: boolean
  createdAt: number
}

export interface Collection {
  id: string
  name: string
  color: string
}

type Filter = "all" | "favorites" | "recent" | string

interface BookmarkState {
  bookmarks: Bookmark[]
  collections: Collection[]
  filter: Filter
  searchQuery: string
  viewMode: "grid" | "list"
}

const COLLECTION_COLORS = [
  "hsl(220, 70%, 50%)",
  "hsl(150, 60%, 40%)",
  "hsl(340, 70%, 50%)",
  "hsl(38, 92%, 50%)",
  "hsl(270, 60%, 55%)",
  "hsl(180, 55%, 42%)",
]

let state: BookmarkState = {
  bookmarks: [
    {
      id: "1",
      url: "https://nextjs.org",
      title: "Next.js by Vercel - The React Framework",
      favicon: "https://nextjs.org/favicon.ico",
      collection: "dev",
      isFavorite: true,
      createdAt: Date.now() - 86400000,
    },
    {
      id: "2",
      url: "https://tailwindcss.com",
      title: "Tailwind CSS - Rapidly build modern websites",
      favicon: "https://tailwindcss.com/favicons/favicon-32x32.png",
      collection: "dev",
      isFavorite: false,
      createdAt: Date.now() - 172800000,
    },
    {
      id: "3",
      url: "https://react.dev",
      title: "React - The library for web and native user interfaces",
      favicon: "https://react.dev/favicon-32x32.png",
      collection: "dev",
      isFavorite: true,
      createdAt: Date.now() - 259200000,
    },
    {
      id: "4",
      url: "https://vercel.com",
      title: "Vercel - Build and deploy the best web experiences",
      favicon: "https://vercel.com/favicon.ico",
      collection: "dev",
      isFavorite: false,
      createdAt: Date.now() - 345600000,
    },
    {
      id: "5",
      url: "https://github.com",
      title: "GitHub - Where the world builds software",
      favicon: "https://github.githubassets.com/favicons/favicon.svg",
      collection: "dev",
      isFavorite: true,
      createdAt: Date.now() - 432000000,
    },
    {
      id: "6",
      url: "https://linear.app",
      title: "Linear - A better way to build products",
      favicon: "https://linear.app/favicon.ico",
      collection: "tools",
      isFavorite: false,
      createdAt: Date.now() - 518400000,
    },
    {
      id: "7",
      url: "https://figma.com",
      title: "Figma - The collaborative interface design tool",
      favicon: "https://static.figma.com/app/icon/1/favicon.png",
      collection: "design",
      isFavorite: true,
      createdAt: Date.now() - 604800000,
    },
    {
      id: "8",
      url: "https://dribbble.com",
      title: "Dribbble - Discover the world's top designers",
      favicon: "https://cdn.dribbble.com/assets/favicon-b38525134603b9513174ec887944bde1a869eb6cd414f9571f24b15a2bcba76e.ico",
      collection: "design",
      isFavorite: false,
      createdAt: Date.now() - 691200000,
    },
  ],
  collections: [
    { id: "dev", name: "Development", color: COLLECTION_COLORS[0] },
    { id: "design", name: "Design", color: COLLECTION_COLORS[2] },
    { id: "tools", name: "Tools", color: COLLECTION_COLORS[3] },
  ],
  filter: "all",
  searchQuery: "",
  viewMode: "grid",
}

const listeners = new Set<() => void>()

function emitChange() {
  state = { ...state }
  listeners.forEach((l) => l())
}

function getSnapshot() {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useBookmarkStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const addBookmark = useCallback((url: string, title: string) => {
    const hostname = (() => {
      try {
        return new URL(url).hostname
      } catch {
        return url
      }
    })()
    const bookmark: Bookmark = {
      id: crypto.randomUUID(),
      url,
      title: title || hostname,
      favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
      collection: "",
      isFavorite: false,
      createdAt: Date.now(),
    }
    state = { ...state, bookmarks: [bookmark, ...state.bookmarks] }
    emitChange()
  }, [])

  const deleteBookmark = useCallback((id: string) => {
    state = {
      ...state,
      bookmarks: state.bookmarks.filter((b) => b.id !== id),
    }
    emitChange()
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    state = {
      ...state,
      bookmarks: state.bookmarks.map((b) =>
        b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
      ),
    }
    emitChange()
  }, [])

  const addCollection = useCallback((name: string) => {
    const collection: Collection = {
      id: crypto.randomUUID(),
      name,
      color: COLLECTION_COLORS[state.collections.length % COLLECTION_COLORS.length],
    }
    state = { ...state, collections: [...state.collections, collection] }
    emitChange()
  }, [])

  const setFilter = useCallback((filter: Filter) => {
    state = { ...state, filter }
    emitChange()
  }, [])

  const setSearchQuery = useCallback((searchQuery: string) => {
    state = { ...state, searchQuery }
    emitChange()
  }, [])

  const setViewMode = useCallback((viewMode: "grid" | "list") => {
    state = { ...state, viewMode }
    emitChange()
  }, [])

  const filteredBookmarks = snap.bookmarks.filter((b) => {
    const matchesSearch =
      !snap.searchQuery ||
      b.title.toLowerCase().includes(snap.searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(snap.searchQuery.toLowerCase())

    if (!matchesSearch) return false

    switch (snap.filter) {
      case "all":
        return true
      case "favorites":
        return b.isFavorite
      case "recent":
        return b.createdAt > Date.now() - 7 * 86400000
      default:
        return b.collection === snap.filter
    }
  })

  return {
    bookmarks: filteredBookmarks,
    allBookmarks: snap.bookmarks,
    collections: snap.collections,
    filter: snap.filter,
    searchQuery: snap.searchQuery,
    viewMode: snap.viewMode,
    addBookmark,
    deleteBookmark,
    toggleFavorite,
    addCollection,
    setFilter,
    setSearchQuery,
    setViewMode,
  }
}
