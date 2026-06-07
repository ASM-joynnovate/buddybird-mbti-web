'use client'

// Parrot-photo input for the result surface (issue #08). Offers direct camera
// capture and gallery upload; on devices without a camera the `capture` hint is
// ignored and the control falls back to a file picker. Shows a card-placement
// preview with re-take / re-select. 100% client-side — the file never leaves the
// device. Emits `photo_attached` with the source that fired (issue #11).
// Skinned inline with the raised-block vocabulary (lives inside the result's
// photo GamePanel).
import { useRef, type ChangeEvent } from 'react'
import { GameButton } from '@/components/ui/game-button'
import { track } from '@/lib/analytics'

interface PhotoInputProps {
    objectUrl: string | null
    onPick: (file: File) => void
    onClear: () => void
}

export function PhotoInput({ objectUrl, onPick, onClear }: PhotoInputProps) {
    const cameraRef = useRef<HTMLInputElement>(null)
    const galleryRef = useRef<HTMLInputElement>(null)

    const handleChange =
        (source: 'camera' | 'gallery') => (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            // Reset so re-picking the same file still fires change.
            event.target.value = ''
            if (file === undefined || !file.type.startsWith('image/')) {
                return
            }
            track({ name: 'photo_attached', payload: { source } })
            onPick(file)
        }

    return (
        <section className="flex flex-col gap-3" aria-label="우리 새 사진">
            <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                aria-label="카메라로 사진 촬영"
                data-testid="photo-camera-input"
                onChange={handleChange('camera')}
            />
            <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                hidden
                aria-label="갤러리에서 사진 선택"
                data-testid="photo-gallery-input"
                onChange={handleChange('gallery')}
            />

            {objectUrl !== null ? (
                <div className="flex flex-col gap-3" data-testid="photo-preview">
                    <div className="overflow-hidden rounded-md border-2 border-border-action bg-white shadow-raise-bar-action">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            className="block max-h-72 w-full object-cover"
                            src={objectUrl}
                            alt="선택한 우리 새 사진 미리보기"
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        <GameButton
                            variant="secondary"
                            size="sm"
                            data-testid="photo-retake"
                            onClick={() => cameraRef.current?.click()}
                        >
                            다시 찍기
                        </GameButton>
                        <GameButton
                            variant="secondary"
                            size="sm"
                            onClick={() => galleryRef.current?.click()}
                        >
                            다시 선택
                        </GameButton>
                        <GameButton
                            variant="ghost"
                            size="sm"
                            data-testid="photo-clear"
                            onClick={onClear}
                        >
                            제거
                        </GameButton>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <p className="m-0 text-center text-sm text-ink-muted">
                        우리 새 사진을 더하면 공유 카드에 함께 담겨요.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <GameButton
                            variant="secondary"
                            size="sm"
                            data-testid="photo-camera-button"
                            onClick={() => cameraRef.current?.click()}
                        >
                            📷 사진 촬영
                        </GameButton>
                        <GameButton
                            variant="secondary"
                            size="sm"
                            data-testid="photo-gallery-button"
                            onClick={() => galleryRef.current?.click()}
                        >
                            🖼️ 갤러리에서 선택
                        </GameButton>
                    </div>
                </div>
            )}
        </section>
    )
}
