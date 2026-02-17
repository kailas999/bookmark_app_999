"use client"

import { useState, useEffect, useRef } from "react"
import { Link, Loader2, Image as ImageIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/tag-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddBookmarkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (url: string, title: string, tags?: string[], metadata?: any) => void
  popularTags?: string[]
}

export function AddBookmarkModal({
  open,
  onOpenChange,
  onAdd,
  popularTags = [],
}: AddBookmarkModalProps) {
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiError, setAiError] = useState<string>("")
  const [metadata, setMetadata] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setUrl("")
      setTitle("")
      setDescription("")
      setThumbnailUrl("")
      setTags([])
      setMetadata(null)
      setIsLoading(false)
      setIsGeneratingAI(false)
      setAiError("")
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const fetchMetadata = async (urlToFetch: string) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/fetch-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToFetch }),
      })

      if (response.ok) {
        const data = await response.json()
        setMetadata(data)
        setTitle(data.title || "")
        setDescription(data.description || "")
        setThumbnailUrl(data.thumbnail_url || "")
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (value.length > 10 && (value.startsWith("http://") || value.startsWith("https://"))) {
      const timeout = setTimeout(() => fetchMetadata(value), 800)
      return () => clearTimeout(timeout)
    }
  }

  const generateWithAI = async () => {
    if (!url || !title) {
      setAiError("Please enter a URL and wait for the title to load first")
      return
    }

    try {
      setIsGeneratingAI(true)
      setAiError("")

      const response = await fetch("/api/ai/generate-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || "Failed to generate metadata")
      }

      const data = await response.json()

      // Auto-populate fields
      if (data.description) {
        setDescription(data.description)
      }
      if (data.tags && data.tags.length > 0) {
        setTags(data.tags)
      }
    } catch (error) {
      console.error("AI generation error:", error)
      setAiError(error instanceof Error ? error.message : "Failed to generate")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    let finalUrl = url.trim()
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`
    }

    // Create metadata object with current form values
    const bookmarkMetadata = {
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
    }

    onAdd(finalUrl, title || finalUrl, tags, bookmarkMetadata)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 gap-0 overflow-hidden rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-muted/20">
          <DialogTitle className="text-xl font-bold tracking-tight">Add Bookmark</DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Paste a URL to automatically fetch metadata and save to your collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                URL
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-lg bg-background/50 border border-border/50 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                  <Link className="h-4 w-4" />
                </div>
                <Input
                  id="url"
                  ref={inputRef}
                  type="text"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="pl-12 h-11 bg-muted/30 border-border/50 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-3 text-sm text-primary animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex h-5 w-5 items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <span className="font-medium">Fetching page details...</span>
              </div>
            )}

            {metadata && thumbnailUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-muted shadow-sm group">
                <img
                  src={thumbnailUrl}
                  alt="Preview"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setThumbnailUrl("")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Page title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 bg-muted/30 border-border/50 focus:bg-background"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Description
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateWithAI}
                  disabled={!url || !title || isLoading || isGeneratingAI}
                  className="h-6 text-[10px] gap-1.5 px-2.5 font-medium text-primary hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Brief description about this link..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none bg-muted/30 border-border/50 focus:bg-background"
              />
              {aiError && (
                <p className="text-xs font-medium text-destructive animate-in slide-in-from-top-1">{aiError}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Tags
              </Label>
              <TagInput
                tags={tags}
                onTagsChange={setTags}
                suggestions={popularTags}
                placeholder="Type to add tags..."
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!url.trim()}
              className="min-w-[100px] shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
            >
              Save Bookmark
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
