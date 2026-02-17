import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Validate URL
        let validUrl: URL
        try {
            validUrl = new URL(url)
        } catch {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
        }

        // Fetch the page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)',
            },
            signal: AbortSignal.timeout(10000), // 10s timeout
        })

        if (!response.ok) {
            // Ensure status is within valid range (200-599)
            const validStatus = Math.max(200, Math.min(599, response.status)) || 500
            return NextResponse.json(
                { error: `Failed to fetch URL: ${response.statusText}` },
                { status: validStatus }
            )
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Extract metadata
        const metadata = {
            url,
            domain: validUrl.hostname,

            // Title (priority: og:title > twitter:title > title tag > h1)
            title:
                $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text() ||
                $('h1').first().text() ||
                validUrl.hostname,

            // Description
            description:
                $('meta[property="og:description"]').attr('content') ||
                $('meta[name="twitter:description"]').attr('content') ||
                $('meta[name="description"]').attr('content') ||
                '',

            // Thumbnail/Image
            thumbnail_url:
                $('meta[property="og:image"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content') ||
                $('meta[name="thumbnail"]').attr('content') ||
                '',

            // Favicon
            favicon:
                $('link[rel="icon"]').attr('href') ||
                $('link[rel="shortcut icon"]').attr('href') ||
                `https://www.google.com/s2/favicons?domain=${validUrl.hostname}&sz=64`,

            // Author
            author:
                $('meta[name="author"]').attr('content') ||
                $('meta[property="article:author"]').attr('content') ||
                '',

            // Published date
            published_at:
                $('meta[property="article:published_time"]').attr('content') ||
                $('meta[name="publish_date"]').attr('content') ||
                $('meta[name="date"]').attr('content') ||
                '',
        }

        // Make relative URLs absolute
        if (metadata.thumbnail_url && !metadata.thumbnail_url.startsWith('http')) {
            metadata.thumbnail_url = new URL(
                metadata.thumbnail_url,
                validUrl.origin
            ).toString()
        }

        if (metadata.favicon && !metadata.favicon.startsWith('http')) {
            metadata.favicon = new URL(metadata.favicon, validUrl.origin).toString()
        }

        // Clean up title (remove excess whitespace, newlines)
        metadata.title = metadata.title.replace(/\s+/g, ' ').trim()

        // Truncate description
        if (metadata.description.length > 500) {
            metadata.description = metadata.description.substring(0, 497) + '...'
        }

        return NextResponse.json(metadata)
    } catch (error) {
        console.error('Metadata fetch error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch metadata' },
            { status: 500 }
        )
    }
}
