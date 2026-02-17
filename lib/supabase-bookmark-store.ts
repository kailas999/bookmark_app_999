'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from './supabase/client'
import type { User } from '@supabase/supabase-js'

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

export interface Collection {
    id: string
    name: string
    color: string
}

type Filter = 'all' | 'favorites' | 'recent' | string

interface DBBookmark {
    id: string
    user_id: string
    url: string
    title: string
    favicon: string | null
    collection: string | null
    is_favorite: boolean
    created_at: string
    updated_at: string
    description: string | null
    thumbnail_url: string | null
    author: string | null
    published_at: string | null
    domain: string | null
}

interface DBCollection {
    id: string
    user_id: string
    name: string
    color: string
    created_at: string
}

export function useSupabaseBookmarks(user: User | null) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<Filter>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const supabase = createClient()

    const convertBookmark = (db: DBBookmark & { tags?: { tag: string }[] }): Bookmark => ({
        id: db.id,
        url: db.url,
        title: db.title,
        favicon: db.favicon || '',
        collection: db.collection || '',
        isFavorite: db.is_favorite,
        createdAt: new Date(db.created_at).getTime(),
        description: db.description,
        thumbnail_url: db.thumbnail_url,
        tags: db.tags?.map(t => t.tag) || [],
    })

    useEffect(() => {
        if (!user) {
            setBookmarks([])
            setCollections([])
            setLoading(false)
            return
        }

        const fetchData = async () => {
            const { data: bookmarksData } = await supabase
                .from('bookmarks')
                .select(`
                    *,
                    tags:bookmark_tags(tag)
                `)
                .order('created_at', { ascending: false })

            if (bookmarksData) {
                setBookmarks(bookmarksData.map(convertBookmark))
            }

            const { data: collectionsData } = await supabase
                .from('collections')
                .select('*')
                .order('created_at', { ascending: true })

            if (collectionsData) {
                setCollections(
                    collectionsData.map((c) => ({
                        id: c.id,
                        name: c.name,
                        color: c.color,
                    }))
                )
            }

            setLoading(false)
        }

        fetchData()
    }, [user, supabase])

    useEffect(() => {
        if (!user) return

        const bookmarksChannel = supabase
            .channel('bookmarks_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((prev) => [convertBookmark(payload.new as DBBookmark), ...prev])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                    } else if (payload.eventType === 'UPDATE') {
                        setBookmarks((prev) =>
                            prev.map((b) =>
                                b.id === payload.new.id ? convertBookmark(payload.new as DBBookmark) : b
                            )
                        )
                    }
                }
            )
            .subscribe()

        const collectionsChannel = supabase
            .channel('collections_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'collections',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newCol = payload.new as DBCollection
                        setCollections((prev) => [
                            ...prev,
                            { id: newCol.id, name: newCol.name, color: newCol.color },
                        ])
                    } else if (payload.eventType === 'DELETE') {
                        setCollections((prev) => prev.filter((c) => c.id !== payload.old.id))
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as DBCollection
                        setCollections((prev) =>
                            prev.map((c) =>
                                c.id === updated.id
                                    ? { id: updated.id, name: updated.name, color: updated.color }
                                    : c
                            )
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(bookmarksChannel)
            supabase.removeChannel(collectionsChannel)
        }
    }, [user, supabase])

    const addBookmark = useCallback(
        async (
            url: string,
            title: string,
            tags?: string[],
            metadata?: any
        ) => {
            if (!user) return

            const hostname = (() => {
                try {
                    return new URL(url).hostname
                } catch {
                    return url
                }
            })()

            // Insert bookmark
            const { data: newBookmark, error } = await supabase
                .from('bookmarks')
                .insert({
                    user_id: user.id,
                    url,
                    title: title || hostname,
                    favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
                    collection: null,
                    is_favorite: false,
                    description: metadata?.description || null,
                    thumbnail_url: metadata?.thumbnail_url || null,
                    domain: hostname,
                })
                .select()
                .single()

            // If tags are provided and bookmark was created successfully, insert tags
            if (!error && newBookmark && tags && tags.length > 0) {
                const tagInserts = tags.map(tag => ({
                    bookmark_id: newBookmark.id,
                    tag: tag.toLowerCase().trim(),
                }))

                await supabase.from('bookmark_tags').insert(tagInserts)
            }
        },
        [user, supabase]
    )

    const deleteBookmark = useCallback(
        async (id: string) => {
            await supabase.from('bookmarks').delete().eq('id', id)
        },
        [supabase]
    )

    const toggleFavorite = useCallback(
        async (id: string) => {
            const bookmark = bookmarks.find((b) => b.id === id)
            if (!bookmark) return

            await supabase
                .from('bookmarks')
                .update({ is_favorite: !bookmark.isFavorite })
                .eq('id', id)
        },
        [bookmarks, supabase]
    )

    const addCollection = useCallback(
        async (name: string) => {
            if (!user) return

            const colors = [
                'hsl(220, 70%, 50%)',
                'hsl(150, 60%, 40%)',
                'hsl(340, 70%, 50%)',
                'hsl(38, 92%, 50%)',
                'hsl(270, 60%, 55%)',
                'hsl(180, 55%, 42%)',
            ]

            await supabase.from('collections').insert({
                user_id: user.id,
                name,
                color: colors[collections.length % colors.length],
            })
        },
        [user, collections.length, supabase]
    )

    const filteredBookmarks = bookmarks.filter((b) => {
        const matchesSearch =
            !searchQuery ||
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.url.toLowerCase().includes(searchQuery.toLowerCase())

        if (!matchesSearch) return false

        switch (filter) {
            case 'all':
                return true
            case 'favorites':
                return b.isFavorite
            case 'recent':
                return b.createdAt > Date.now() - 7 * 86400000
            default:
                return b.collection === filter
        }
    })

    return {
        bookmarks: filteredBookmarks,
        allBookmarks: bookmarks,
        collections,
        filter,
        searchQuery,
        viewMode,
        loading,
        addBookmark,
        deleteBookmark,
        toggleFavorite,
        addCollection,
        setFilter,
        setSearchQuery,
        setViewMode,
    }
}
