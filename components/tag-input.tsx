'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

interface TagInputProps {
    tags: string[]
    onTagsChange: (tags: string[]) => void
    suggestions?: string[]
    placeholder?: string
    className?: string
}

export function TagInput({
    tags,
    onTagsChange,
    suggestions = [],
    placeholder = 'Add tags...',
    className,
}: TagInputProps) {
    const [input, setInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const filteredSuggestions = suggestions
        .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
        .filter((s) => !tags.includes(s))
        .slice(0, 5)

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim().toLowerCase()
        if (trimmedTag && !tags.includes(trimmedTag)) {
            onTagsChange([...tags, trimmedTag])
        }
        setInput('')
        setShowSuggestions(false)
    }

    const removeTag = (tagToRemove: string) => {
        onTagsChange(tags.filter((t) => t !== tagToRemove))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault()
            addTag(input)
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            removeTag(tags[tags.length - 1])
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={cn('relative', className)}>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
                {tags.map((tag) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className="gap-1 pl-2 pr-1 text-xs"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <Input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value)
                        setShowSuggestions(true)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="h-6 flex-1 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border bg-popover p-1 shadow-md">
                    {filteredSuggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                        >
                            <Plus className="h-3 w-3" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
