"use client"

import { useState } from "react"
import {
  Bookmark,
  Star,
  Clock,
  FolderClosed,
  Plus,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Collection {
  id: string
  name: string
  color: string
}

interface BookmarkData {
  id: string
  isFavorite: boolean
  createdAt: number
  collection: string
}

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onAddCollection: () => void
  bookmarks: BookmarkData[]
  collections: Collection[]
  filter: string
  setFilter: (filter: string) => void
}

export function AppSidebar({
  collapsed,
  onToggle,
  onAddCollection,
  bookmarks,
  collections,
  filter,
  setFilter
}: AppSidebarProps) {

  const navItems = [
    {
      id: "all" as const,
      label: "All Bookmarks",
      icon: Bookmark,
      count: bookmarks.length,
    },
    {
      id: "favorites" as const,
      label: "Favorites",
      icon: Star,
      count: bookmarks.filter((b) => b.isFavorite).length,
    },
    {
      id: "recent" as const,
      label: "Recent",
      icon: Clock,
      count: bookmarks.filter((b) => b.createdAt > Date.now() - 7 * 86400000).length,
    },
  ]

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-sidebar-border/60 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border/60 px-4">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20 ring-1 ring-primary/20">
                <Layers className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
                  Markly
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Bookmark Manager
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20">
              <Layers className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const isActive = filter === item.id
              return collapsed ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setFilter(item.id)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 mx-auto",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
                  )}
                >
                  <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="truncate">{item.label}</span>
                  <span
                    className={cn(
                      "ml-auto text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full",
                      isActive ? "bg-background text-primary" : "bg-sidebar-accent/50 text-muted-foreground"
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Collections */}
          <div className="mt-8">
            {!collapsed && (
              <div className="mb-3 flex items-center justify-between px-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Collections
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  onClick={onAddCollection}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="sr-only">Add collection</span>
                </Button>
              </div>
            )}
            {collapsed && (
              <div className="mb-3 flex justify-center">
                <div className="h-px w-8 bg-sidebar-border/60" />
              </div>
            )}
            <nav className="flex flex-col gap-1.5">
              {collections.map((collection) => {
                const isActive = filter === collection.id
                const count = bookmarks.filter(
                  (b) => b.collection === collection.id
                ).length
                return collapsed ? (
                  <Tooltip key={collection.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setFilter(collection.id)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 mx-auto",
                          isActive
                            ? "bg-sidebar-accent text-foreground shadow-sm ring-1 ring-border"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                      >
                        <FolderClosed
                          className="h-5 w-5"
                          style={{ color: collection.color }}
                        />
                        <span className="sr-only">{collection.name}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      <p>{collection.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <button
                    key={collection.id}
                    onClick={() => setFilter(collection.id)}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-accent text-foreground shadow-sm ring-1 ring-border/50"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-0.5"
                    )}
                  >
                    <FolderClosed
                      className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110"
                      style={{ color: collection.color }}
                    />
                    <span className="truncate">{collection.name}</span>
                    <span
                      className={cn(
                        "ml-auto text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full transition-colors",
                        isActive ? "bg-background shadow-sm" : "text-muted-foreground group-hover:bg-background/50"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="border-t border-sidebar-border/60 p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-xl text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  collapsed && "mx-auto"
                )}
                onClick={onToggle}
              >
                {collapsed ? (
                  <ChevronRight className="h-4.5 w-4.5" />
                ) : (
                  <ChevronLeft className="h-4.5 w-4.5" />
                )}
                <span className="sr-only">
                  {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
