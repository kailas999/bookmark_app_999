"use client"

import { Search, LayoutGrid, List, Plus, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useBookmarkStore } from "@/lib/bookmark-store"

interface TopBarProps {
  onAddBookmark: () => void
  onMobileMenuToggle: () => void
}

export function TopBar({ onAddBookmark, onMobileMenuToggle }: TopBarProps) {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, filter, collections } =
    useBookmarkStore()

  const filterLabel = (() => {
    switch (filter) {
      case "all":
        return "All Bookmarks"
      case "favorites":
        return "Favorites"
      case "recent":
        return "Recent"
      default: {
        const c = collections.find((col) => col.id === filter)
        return c?.name || "Bookmarks"
      }
    }
  })()

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="-ml-2 h-9 w-9 lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Title */}
        <div className="hidden flex-col gap-0.5 sm:flex">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            {filterLabel}
          </h1>
          <p className="text-[11px] font-medium text-muted-foreground">
            Manage your bookmarks
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
        {/* Search */}
        <div className="relative w-full max-w-sm transition-all focus-within:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            type="search"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border-border/50 bg-muted/40 pl-9 text-sm transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* View Toggle */}
        <div className="hidden items-center rounded-xl border border-border/50 bg-muted/40 p-1 sm:flex">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
              viewMode === "list"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Add Bookmark - desktop */}
        <Button
          onClick={onAddBookmark}
          size="sm"
          className="hidden h-10 gap-2 rounded-xl px-4 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Add Bookmark
        </Button>

        {/* User avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-sm ring-2 ring-background">
          A
        </div>
      </div>
    </header>
  )
}
