import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as cheerio from 'cheerio'

interface BookmarkData {
    title: string
    url: string
    href: string
    add_date?: string
    icon?: string
}

interface FolderData {
    name: string
    bookmarks: BookmarkData[]
    folders: FolderData[]
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const content = await file.text()
        const bookmarks: any[] = []
        const collections: Map<string, { name: string; color: string }> = new Map()

        // Detect file type and parse
        if (file.name.endsWith('.html')) {
            const parsed = parseHTMLBookmarks(content)
            processParsedData(parsed, bookmarks, collections, user.id)
        } else if (file.name.endsWith('.json')) {
            const parsed = parseJSONBookmarks(content)
            processParsedData(parsed, bookmarks, collections, user.id)
        } else {
            return NextResponse.json(
                { error: 'Unsupported file format. Please upload HTML or JSON.' },
                { status: 400 }
            )
        }

        // Check for duplicates
        const { data: existingBookmarks } = await supabase
            .from('bookmarks')
            .select('url')
            .eq('user_id', user.id)

        const existingUrls = new Set(existingBookmarks?.map((b) => b.url) || [])
        const newBookmarks = bookmarks.filter((b) => !existingUrls.has(b.url))

        // Insert collections first
        const collectionIds: Map<string, string> = new Map()
        for (const [name, data] of collections) {
            const { data: collection, error } = await supabase
                .from('collections')
                .insert({
                    user_id: user.id,
                    name: data.name,
                    color: data.color,
                })
                .select()
                .single()

            if (collection) {
                collectionIds.set(name, collection.id)
            }
        }

        // Map collection names to IDs in bookmarks
        const bookmarksToInsert = newBookmarks.map((b) => ({
            ...b,
            collection: b.collection ? collectionIds.get(b.collection) || null : null,
        }))

        // Batch insert bookmarks
        let insertedCount = 0
        if (bookmarksToInsert.length > 0) {
            const { data, error } = await supabase
                .from('bookmarks')
                .insert(bookmarksToInsert)
                .select()

            if (!error && data) {
                insertedCount = data.length
            }
        }

        return NextResponse.json({
            success: true,
            imported: insertedCount,
            skipped: bookmarks.length - newBookmarks.length,
            total: bookmarks.length,
        })
    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json(
            { error: 'Failed to import bookmarks' },
            { status: 500 }
        )
    }
}

function parseHTMLBookmarks(html: string): FolderData {
    const $ = cheerio.load(html)
    const root: FolderData = { name: 'root', bookmarks: [], folders: [] }

    function parseNode(element: cheerio.Element, parent: FolderData) {
        const $el = $(element)

        if ($el.is('dt')) {
            const $a = $el.find('> a')
            const $dl = $el.find('> dl')

            if ($a.length > 0) {
                // It's a bookmark
                parent.bookmarks.push({
                    title: $a.text().trim(),
                    url: $a.attr('href') || '',
                    href: $a.attr('href') || '',
                    add_date: $a.attr('add_date'),
                    icon: $a.attr('icon'),
                })
            } else if ($dl.length > 0) {
                // It's a folder
                const folder: FolderData = {
                    name: $el.find('> h3').text().trim() || 'Unnamed',
                    bookmarks: [],
                    folders: [],
                }
                parent.folders.push(folder)
                $dl.children().each((_, child) => parseNode(child, folder))
            }
        }
    }

    $('dl').first().children().each((_, child) => parseNode(child, root))
    return root
}

function parseJSONBookmarks(json: string): FolderData {
    const data = JSON.parse(json)
    const root: FolderData = { name: 'root', bookmarks: [], folders: [] }

    function parseFirefoxNode(node: any, parent: FolderData) {
        if (node.type === 'text/x-moz-place') {
            // Bookmark
            parent.bookmarks.push({
                title: node.title || '',
                url: node.uri || '',
                href: node.uri || '',
            })
        } else if (node.type === 'text/x-moz-place-container') {
            // Folder
            const folder: FolderData = {
                name: node.title || 'Unnamed',
                bookmarks: [],
                folders: [],
            }
            parent.folders.push(folder)
            if (node.children) {
                node.children.forEach((child: any) => parseFirefoxNode(child, folder))
            }
        }
    }

    if (data.children) {
        data.children.forEach((child: any) => parseFirefoxNode(child, root))
    }

    return root
}

function processParsedData(
    data: FolderData,
    bookmarks: any[],
    collections: Map<string, { name: string; color: string }>,
    userId: string,
    parentCollection?: string
) {
    const colors = [
        'hsl(220, 70%, 50%)',
        'hsl(150, 60%, 40%)',
        'hsl(340, 70%, 50%)',
        'hsl(38, 92%, 50%)',
        'hsl(270, 60%, 55%)',
        'hsl(180, 55%, 42%)',
    ]

    // Add bookmarks from this folder
    data.bookmarks.forEach((bookmark) => {
        if (bookmark.url && bookmark.url.startsWith('http')) {
            try {
                const url = new URL(bookmark.url)
                bookmarks.push({
                    user_id: userId,
                    url: bookmark.url,
                    title: bookmark.title || url.hostname,
                    favicon:
                        bookmark.icon ||
                        `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`,
                    collection: parentCollection || null,
                    is_favorite: false,
                    domain: url.hostname,
                })
            } catch {
                // Skip invalid URLs
            }
        }
    })

    // Process subfolders
    data.folders.forEach((folder, index) => {
        if (folder.name && folder.name !== 'root') {
            if (!collections.has(folder.name)) {
                collections.set(folder.name, {
                    name: folder.name,
                    color: colors[collections.size % colors.length],
                })
            }
            processParsedData(folder, bookmarks, collections, userId, folder.name)
        } else {
            processParsedData(folder, bookmarks, collections, userId, parentCollection)
        }
    })
}
