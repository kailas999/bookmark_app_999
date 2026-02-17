"use client"

import { useState } from "react"
import { Star, Trash2, ExternalLink, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { TagBadge } from "./tag-badge"

export interface Bookmark {
  id: string
  url: string
  title: string
  favicon: string
  collection: string
  isFavorite: boolean
  createdAt: number
  description?: string | null
  thumbnail_url?: string | null
  tags?: string[]
}

interface BookmarkCardProps {
  bookmark: Bookmark
  viewMode: "grid" | "list"
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function BookmarkCard({
  bookmark,
  viewMode,
  onDelete,
  onToggleFavorite,
}: BookmarkCardProps) {
  const [imgError, setImgError] = useState(false)
  const [thumbError, setThumbError] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace("www.", "")
    } catch {
      return bookmark.url
    }
  })()

  const handleDelete = () => {
    setIsDeleting(true)
    // Short delay for visual feedback, then delete
    setTimeout(() => {
      onDelete(bookmark.id)
    }, 150)
  }

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group flex items-center gap-5 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/95 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5",
          isDeleting && "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/80 shadow-sm ring-1 ring-border/50">
          {!imgError ? (
            <img
              src={bookmark.favicon}
              alt=""
              className="h-6 w-6 rounded"
              onError={() => setImgError(true)}
            />
          ) : (
            <Globe className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {bookmark.title}
            </a>
            {bookmark.isFavorite && (
              <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400 drop-shadow-sm" />
            )}
          </div>
          {bookmark.description && (
            <p className="line-clamp-1 text-xs leading-relaxed text-muted-foreground/90">
              {bookmark.description}
            </p>
          )}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs text-muted-foreground/70 transition-colors hover:text-primary hover:underline"
          >
            {hostname}
          </a>
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="mt-1.5 flex gap-1.5">
              {bookmark.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} className="text-[10px] px-2 py-0.5 font-medium" />
              ))}
              {bookmark.tags.length > 3 && (
                <span className="text-[10px] font-medium text-muted-foreground/60">
                  +{bookmark.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => onToggleFavorite(bookmark.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            aria-label={bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={cn(
                "h-4 w-4 transition-transform",
                bookmark.isFavorite
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
          <button
            onClick={handleDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete bookmark"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-card/95 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1",
        isDeleting && "opacity-0 pointer-events-none"
      )}
    >
      {/* Preview area with thumbnail or favicon */}
      <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-secondary/30 to-secondary/50">
        {bookmark.thumbnail_url && !thumbError ? (
          <img
            src={bookmark.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-card to-card/90 shadow-lg ring-1 ring-border/50">
            {!imgError ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="h-10 w-10 rounded-lg"
                onError={() => setImgError(true)}
              />
            ) : (
              <Globe className="h-10 w-10 text-muted-foreground/70" />
            )}
          </div>
        )}

        {/* Hover actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2.5 bg-background/80 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
          <button
            onClick={() => onToggleFavorite(bookmark.id)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 shadow-lg ring-1 ring-border/50 transition-all duration-200 hover:scale-110",
              bookmark.isFavorite
                ? "text-amber-400 ring-amber-400/20"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className="h-5 w-5 transition-transform"
              fill={bookmark.isFavorite ? "currentColor" : "none"}
            />
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 text-muted-foreground shadow-lg ring-1 ring-border/50 transition-all duration-200 hover:scale-110 hover:text-foreground"
            aria-label="Open link in new tab"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
          <button
            onClick={handleDelete}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card/90 text-muted-foreground shadow-lg ring-1 ring-border/50 transition-all duration-200 hover:scale-110 hover:text-destructive"
            aria-label="Delete bookmark"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Favorite badge */}
        {bookmark.isFavorite && (
          <div className="absolute right-3 top-3 rounded-full bg-amber-400/90 p-1.5 shadow-lg backdrop-blur-sm ring-1 ring-amber-400/30">
            <Star className="h-3.5 w-3.5 text-white" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2.5 p-5">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {bookmark.title}
        </a>
        {bookmark.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground/90">
            {bookmark.description}
          </p>
        )}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-muted-foreground/70 transition-colors hover:text-primary hover:underline"
        >
          {hostname}
        </a>
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {bookmark.tags.slice(0, 4).map((tag) => (
              <TagBadge key={tag} tag={tag} className="text-[10px] px-2 py-1 font-medium" />
            ))}
            {bookmark.tags.length > 4 && (
              <span className="text-xs font-medium text-muted-foreground/60">
                +{bookmark.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
