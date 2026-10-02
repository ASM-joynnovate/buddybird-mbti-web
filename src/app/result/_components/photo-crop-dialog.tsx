'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';

import { PHOTO_ASPECT } from '@/lib/image-generation/input';

import { type CropArea, cropPhoto } from '@/app/result/_lib/photo/crop-photo';

import { GameButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PhotoCropDialogProps {
	src: string | null;
	onCancel: () => void;
	onConfirm: (file: File) => void;
}

const MAX_ZOOM = 3;

export function PhotoCropDialog({ src, onCancel, onConfirm }: PhotoCropDialogProps) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [area, setArea] = useState<CropArea | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const reset = () => {
		setCrop({ x: 0, y: 0 });
		setZoom(1);
		setArea(null);
		setBusy(false);
		setError(null);
	};

	const handleConfirm = async () => {
		if (!src || !area || busy) return;
		setBusy(true);
		try {
			const file = await cropPhoto(src, area);
			reset();
			onConfirm(file);
		} catch (cause) {
			setBusy(false);
			setError(cause instanceof Error ? cause.message : '사진을 자를 수 없어요.');
		}
	};

	return (
		<Dialog
			open={src !== null}
			onOpenChange={(open) => {
				if (open) return;
				reset();
				onCancel();
			}}
		>
			<DialogContent
				className="flex w-[calc(100%-2rem)] max-w-sm flex-col gap-4 rounded-3xl
					border-[length:var(--border-panel)] border-border-action bg-surface-cream p-5 shadow-raise-panel"
			>
				<div>
					<DialogTitle className="m-0 font-display text-lg font-normal text-ink">사진 맞추기</DialogTitle>
					<p className="mt-1 mb-0 text-[0.8125rem] leading-normal text-ink-muted">
						우리 새가 틀 안에 잘 보이도록 옮기거나 확대해 주세요.
					</p>
				</div>
				<div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-ink">
					{src && (
						<Cropper
							image={src}
							crop={crop}
							zoom={zoom}
							maxZoom={MAX_ZOOM}
							aspect={PHOTO_ASPECT}
							objectFit="cover"
							showGrid={false}
							onCropChange={setCrop}
							onZoomChange={setZoom}
							onCropComplete={(_, pixels) => setArea(pixels)}
							mediaProps={{ alt: '자를 사진' }}
						/>
					)}
				</div>
				<label className="flex items-center gap-3 text-sm text-ink-muted">
					<span className="shrink-0">확대</span>
					<input
						type="range"
						min={1}
						max={MAX_ZOOM}
						step={0.01}
						value={zoom}
						onChange={(event) => setZoom(Number(event.target.value))}
						className="h-11 w-full cursor-pointer accent-primary"
						aria-label="사진 확대"
					/>
				</label>
				{error && (
					<p role="alert" className="m-0 text-sm text-primary-active">
						{error}
					</p>
				)}
				<div className="grid grid-cols-2 gap-3">
					<GameButton
						variant="secondary"
						size="sm"
						className="min-h-12"
						onClick={() => {
							reset();
							onCancel();
						}}
					>
						취소
					</GameButton>
					<GameButton
						size="sm"
						className="min-h-12 px-4 text-base"
						onClick={() => void handleConfirm()}
						disabled={!area || busy}
					>
						{busy ? '자르는 중…' : '이 사진 쓰기'}
					</GameButton>
				</div>
			</DialogContent>
		</Dialog>
	);
}
