'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSupabaseBookmarks } from '@/lib/supabase-bookmark-store'
import { AppSidebar } from '@/components/app-sidebar'
import { TopBar } from '@/components/top-bar'
import { BookmarkCard } from '@/components/bookmark-card'
import { BookmarkSkeleton } from '@/components/bookmark-skeleton'
import { AddBookmarkModal } from '@/components/add-bookmark-modal'
import { AddCollectionModal } from '@/components/add-collection-modal'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'

export function BookmarkApp({ user }: { user: User }) {
    const {
        bookmarks,
        allBookmarks,
        collections,
        filter,
        setFilter,
        viewMode,
        loading,
        addBookmark,
        deleteBookmark,
        toggleFavorite,
        addCollection,
    } = useSupabaseBookmarks(user)

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [addBookmarkOpen, setAddBookmarkOpen] = useState(false)
    const [addCollectionOpen, setAddCollectionOpen] = useState(false)

    return (
        <div className="flex h-dvh overflow-hidden bg-background">
            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - desktop */}
            <div className="hidden lg:block">
                <AppSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    onAddCollection={() => setAddCollectionOpen(true)}
                    bookmarks={allBookmarks}
                    collections={collections}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>

            {/* Sidebar - mobile */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:hidden",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <AppSidebar
                    collapsed={false}
                    onToggle={() => setMobileMenuOpen(false)}
                    onAddCollection={() => {
                        setAddCollectionOpen(true)
                        setMobileMenuOpen(false)
                    }}
                    bookmarks={allBookmarks}
                    collections={collections}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden">
                <TopBar
                    onAddBookmark={() => setAddBookmarkOpen(true)}
                    onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                />

                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {loading ? (
                        <div
                            className={cn(
                                viewMode === "grid"
                                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                                    : "flex flex-col gap-4"
                            )}
                        >
                            {Array.from({ length: 8 }).map((_, i) => (
                                <BookmarkSkeleton key={i} viewMode={viewMode} />
                            ))}
                        </div>
                    ) : bookmarks.length === 0 ? (
                        <EmptyState onAddBookmark={() => setAddBookmarkOpen(true)} />
                    ) : (
                        <div
                            className={cn(
                                viewMode === "grid"
                                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                                    : "flex flex-col gap-4"
                            )}
                        >
                            {bookmarks.map((bookmark) => (
                                <BookmarkCard
                                    key={bookmark.id}
                                    bookmark={bookmark}
                                    viewMode={viewMode}
                                    onDelete={deleteBookmark}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Floating add button - mobile */}
                <div className="fixed bottom-6 right-6 sm:hidden">
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg"
                        onClick={() => setAddBookmarkOpen(true)}
                    >
                        <Plus className="h-6 w-6" />
                        <span className="sr-only">Add bookmark</span>
                    </Button>
                </div>
            </main>

            {/* Modals */}
            <AddBookmarkModal
                open={addBookmarkOpen}
                onOpenChange={setAddBookmarkOpen}
                onAdd={addBookmark}
            />
            <AddCollectionModal
                open={addCollectionOpen}
                onOpenChange={setAddCollectionOpen}
                onAdd={addCollection}
            />
        </div>
    )
}
