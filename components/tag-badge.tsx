'use client'

import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
    tag: string
    count?: number
    selected?: boolean
    onClick?: () => void
    onRemove?: () => void
    className?: string
}

const tagColors: Record<string, string> = {
    default: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    red: 'bg-red-500/10 text-red-700 dark:text-red-300',
    green: 'bg-green-500/10 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    pink: 'bg-pink-500/10 text-pink-700 dark:text-pink-300',
    orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    cyan: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
}

function getTagColor(tag: string): string {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = Object.values(tagColors)
    return colors[hash % colors.length]
}

export function TagBadge({
    tag,
    count,
    selected = false,
    onClick,
    onRemove,
    className,
}: TagBadgeProps) {
    const colorClass = getTagColor(tag)

    return (
        <Badge
            variant={selected ? 'default' : 'secondary'}
            className={cn(
                'cursor-pointer text-xs transition-colors',
                !selected && colorClass,
                onClick && 'hover:opacity-80',
                className
            )}
            onClick={onClick}
        >
            #{tag}
            {count !== undefined && (
                <span className="ml-1 opacity-70">({count})</span>
            )}
        </Badge>
    )
}

interface TagCloudProps {
    tags: Array<{ tag: string; count: number }>
    selectedTag?: string
    onTagClick?: (tag: string) => void
    maxTags?: number
    className?: string
}

export function TagCloud({
    tags,
    selectedTag,
    onTagClick,
    maxTags = 20,
    className,
}: TagCloudProps) {
    const sortedTags = [...tags]
        .sort((a, b) => b.count - a.count)
        .slice(0, maxTags)

    if (sortedTags.length === 0) {
        return (
            <div className={cn('text-center text-sm text-muted-foreground p-4', className)}>
                No tags yet. Add tags to your bookmarks to see them here.
            </div>
        )
    }

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {sortedTags.map(({ tag, count }) => (
                <TagBadge
                    key={tag}
                    tag={tag}
                    count={count}
                    selected={selectedTag === tag}
                    onClick={() => onTagClick?.(tag)}
                />
            ))}
        </div>
    )
}
