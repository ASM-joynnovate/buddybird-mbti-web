'use client'

// Parrot-photo input for the result surface (issue #08). Offers direct camera
// capture and gallery upload; on devices without a camera the `capture` hint is
// ignored and the control falls back to a file picker. Shows a card-placement
// preview with re-take / re-select. 100% client-side — the file never leaves the
// device. Emits `photo_attached` with the source that fired (issue #11).
import { useRef, type ChangeEvent } from 'react'
import { GameButton } from '@/components/ui/game-button'
import { track } from '@/lib/analytics'
import './photo-input.css'

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
        <section className="photo" aria-label="우리 새 사진">
            <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                data-testid="photo-camera-input"
                onChange={handleChange('camera')}
            />
            <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                hidden
                data-testid="photo-gallery-input"
                onChange={handleChange('gallery')}
            />

            {objectUrl !== null ? (
                <div className="photo-preview" data-testid="photo-preview">
                    <div className="photo-preview-frame">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={objectUrl} alt="선택한 우리 새 사진 미리보기" />
                    </div>
                    <div className="photo-actions">
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
                <div className="photo-pick">
                    <p className="photo-hint">우리 새 사진을 더하면 공유 카드에 함께 담겨요.</p>
                    <div className="photo-actions">
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
