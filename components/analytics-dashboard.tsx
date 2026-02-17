'use client'

import { useEffect, useState } from 'react'
import { BarChart, TrendingUp, Bookmark, Tag, Folder, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { TagCloud } from './tag-badge'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AnalyticsDashboardProps {
    user: User
}

interface Stats {
    total: number
    favorites: number
    collections: number
    tags: number
    thisWeek: number
    thisMonth: number
}

export function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
    const [stats, setStats] = useState<Stats>({
        total: 0,
        favorites: 0,
        collections: 0,
        tags: 0,
        thisWeek: 0,
        thisMonth: 0,
    })
    const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
    const [topDomains, setTopDomains] = useState<Array<{ domain: string; count: number }>>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const now = new Date()
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

                // Get total bookmarks
                const { count: totalCount } = await supabase
                    .from('bookmarks')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                // Get favorites count
                const { count: favoritesCount } = await supabase
                    .from('bookmarks')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('is_favorite', true)

                // Get collections count
                const { count: collectionsCount } = await supabase
                    .from('collections')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)

                // Get unique tags count
                const { data: tagsData } = await supabase
                    .from('bookmark_tags')
                    .select('tag, bookmarks!inner(user_id)')
                    .eq('bookmarks.user_id', user.id)

                const uniqueTags = new Set(tagsData?.map((t) => t.tag) || [])

                // Get this week's bookmarks
                const { count: weekCount } = await supabase
                    .from('bookmarks')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('created_at', weekAgo.toISOString())

                // Get this month's bookmarks
                const { count: monthCount } = await supabase
                    .from('bookmarks')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .gte('created_at', monthAgo.toISOString())

                // Get popular tags
                const { data: popularTagsData } = await supabase.rpc('get_popular_tags', {
                    user_uuid: user.id,
                    limit_count: 15,
                })

                // Get top domains
                const { data: domainsData } = await supabase
                    .from('bookmarks')
                    .select('domain')
                    .eq('user_id', user.id)
                    .not('domain', 'is', null)

                const domainCounts = new Map<string, number>()
                domainsData?.forEach((d) => {
                    if (d.domain) {
                        domainCounts.set(d.domain, (domainCounts.get(d.domain) || 0) + 1)
                    }
                })

                const topDomainsArray = Array.from(domainCounts.entries())
                    .map(([domain, count]) => ({ domain, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)

                setStats({
                    total: totalCount || 0,
                    favorites: favoritesCount || 0,
                    collections: collectionsCount || 0,
                    tags: uniqueTags.size,
                    thisWeek: weekCount || 0,
                    thisMonth: monthCount || 0,
                })

                setPopularTags(popularTagsData || [])
                setTopDomains(topDomainsArray)
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user.id, supabase])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <BarChart className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-background p-4 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Insights about your bookmarks</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
                        <Bookmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.favorites}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Collections</CardTitle>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.collections}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tags</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.tags}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">This Week</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.thisWeek}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.thisMonth}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Popular Tags */}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Popular Tags</CardTitle>
                        <CardDescription>Your most used tags</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TagCloud tags={popularTags} maxTags={15} />
                    </CardContent>
                </Card>

                {/* Top Domains */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Domains</CardTitle>
                        <CardDescription>Most bookmarked websites</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topDomains.length > 0 ? (
                            <div className="space-y-2">
                                {topDomains.map(({ domain, count }) => (
                                    <div key={domain} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                                                alt=""
                                                className="h-4 w-4"
                                            />
                                            <span className="text-sm truncate">{domain}</span>
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No bookmarks yet
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
