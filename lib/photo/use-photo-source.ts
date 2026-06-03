'use client'

// Holds the user's chosen parrot photo as a File plus a preview object URL, entirely
// client-side (issue #08 — no upload, no network). Revokes the previous object URL on
// every change and on unmount so blobs never leak.
import { useCallback, useEffect, useRef, useState } from 'react'

export interface PhotoSource {
    file: File | null
    objectUrl: string | null
    setFile: (file: File | null) => void
    clear: () => void
}

export function usePhotoSource(): PhotoSource {
    const [file, setFileState] = useState<File | null>(null)
    const [objectUrl, setObjectUrl] = useState<string | null>(null)
    const urlRef = useRef<string | null>(null)

    const setFile = useCallback((next: File | null) => {
        if (urlRef.current !== null) {
            URL.revokeObjectURL(urlRef.current)
            urlRef.current = null
        }

        if (next !== null) {
            const url = URL.createObjectURL(next)
            urlRef.current = url
            setObjectUrl(url)
        } else {
            setObjectUrl(null)
        }

        setFileState(next)
    }, [])

    const clear = useCallback(() => setFile(null), [setFile])

    useEffect(() => {
        return () => {
            if (urlRef.current !== null) {
                URL.revokeObjectURL(urlRef.current)
                urlRef.current = null
            }
        }
    }, [])

    return { file, objectUrl, setFile, clear }
}
