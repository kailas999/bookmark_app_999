'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from './ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog'
import { Progress } from './ui/progress'
import { cn } from '@/lib/utils'

interface ImportModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImportComplete?: () => void
}

export function ImportModal({
    open,
    onOpenChange,
    onImportComplete,
}: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<{
        success: boolean
        imported?: number
        skipped?: number
        total?: number
        error?: string
    } | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0])
            setResult(null)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/html': ['.html', '.htm'],
            'application/json': ['.json'],
        },
        maxFiles: 1,
    })

    const handleImport = async () => {
        if (!file) return

        try {
            setImporting(true)
            setProgress(0)

            const formData = new FormData()
            formData.append('file', file)

            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90))
            }, 200)

            const response = await fetch('/api/import-bookmarks', {
                method: 'POST',
                body: formData,
            })

            clearInterval(progressInterval)
            setProgress(100)

            const data = await response.json()

            if (response.ok) {
                setResult({
                    success: true,
                    imported: data.imported,
                    skipped: data.skipped,
                    total: data.total,
                })
                onImportComplete?.()
            } else {
                setResult({
                    success: false,
                    error: data.error || 'Import failed',
                })
            }
        } catch (error) {
            setResult({
                success: false,
                error: 'Failed to import bookmarks',
            })
        } finally {
            setImporting(false)
        }
    }

    const reset = () => {
        setFile(null)
        setResult(null)
        setProgress(0)
    }

    const close = () => {
        reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Import Bookmarks</DialogTitle>
                    <DialogDescription>
                        Import bookmarks from Chrome, Firefox, or other browsers.
                    </DialogDescription>
                </DialogHeader>

                {!result ? (
                    <div className="flex flex-col gap-4">
                        <div
                            {...getRootProps()}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                                isDragActive && "border-primary bg-primary/5",
                                !file && "cursor-pointer hover:border-primary/50"
                            )}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <>
                                    <FileText className="h-12 w-12 text-primary" />
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        {isDragActive
                                            ? 'Drop the file here'
                                            : 'Drag & drop or click to select'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Supports HTML and JSON formats
                                    </p>
                                </>
                            )}
                        </div>

                        {importing && (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Importing...</span>
                                    <span className="font-medium">{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        )}

                        <DialogFooter>
                            {file && !importing && (
                                <Button variant="outline" onClick={reset}>
                                    Clear
                                </Button>
                            )}
                            <Button onClick={handleImport} disabled={!file || importing}>
                                {importing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Importing…
                                    </>
                                ) : (
                                    'Import Bookmarks'
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 py-4">
                        {result.success ? (
                            <>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                    <p className="text-lg font-semibold">Import Successful!</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 rounded-lg border bg-muted/50 p-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-2xl font-bold text-green-600">
                                            {result.imported}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Imported</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {result.skipped}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Skipped</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {result.total}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <XCircle className="h-12 w-12 text-destructive" />
                                    <p className="text-lg font-semibold">Import Failed</p>
                                    <p className="text-sm text-muted-foreground">{result.error}</p>
                                </div>
                            </>
                        )}
                        <DialogFooter>
                            <Button onClick={close} variant={result.success ? 'default' : 'outline'}>
                                {result.success ? 'Done' : 'Try Again'}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
