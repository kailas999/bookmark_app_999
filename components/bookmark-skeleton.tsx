"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface BookmarkSkeletonProps {
  viewMode: "grid" | "list"
}

export function BookmarkSkeleton({ viewMode }: BookmarkSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-sm">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-full rounded-md" />
        <Skeleton className="h-3 w-2/3 rounded-md" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}
