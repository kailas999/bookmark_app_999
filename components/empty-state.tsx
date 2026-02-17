"use client"

import { Bookmark, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  onAddBookmark: () => void
}

export function EmptyState({ onAddBookmark }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 px-4 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5 shadow-inner ring-1 ring-primary/10">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-transparent to-primary/10" />
        <Bookmark className="h-10 w-10 text-primary transition-transform duration-500 hover:scale-110" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Your collection starts here
        </h3>
        <p className="max-w-[18rem] text-sm leading-relaxed text-muted-foreground sm:max-w-sm">
          Save articles, videos, and inspiration for later. Organize with tags and collections to keep everything within reach.
        </p>
      </div>
      <Button
        onClick={onAddBookmark}
        size="lg"
        className="mt-2 gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-primary/30"
      >
        <Plus className="h-5 w-5" />
        Add First Bookmark
      </Button>
    </div>
  )
}
