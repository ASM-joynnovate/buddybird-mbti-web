'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';

import type { TypeCode } from '@/types/mbti';

import { getTypeName } from '@/lib/content/type-infos';
import { PHOTO_ASPECT } from '@/lib/image-generation/input';

import { type CropArea, cropPhoto } from '@/app/[locale]/result/_lib/photo/crop-photo';
import { useTranslation } from '@/providers/locale-provider';
import { Move } from 'lucide-react';

import { GameButton } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PhotoCropDialogProps {
	src: string | null;
	type: TypeCode;
	onCancel: () => void;
	onReselect: () => void;
	onConfirm: (file: File) => void;
}

const MAX_ZOOM = 3;

const TAPE_CLASS =
	'pointer-events-none absolute -top-3 z-4 h-8 opacity-85 shadow-[0_4px_8px_rgba(0,0,0,0.16)] [background:repeating-linear-gradient(45deg,rgba(255,255,255,0.22)_0_10px,transparent_10px_20px),var(--tape)]';

export function PhotoCropDialog({ src, type, onCancel, onReselect, onConfirm }: PhotoCropDialogProps) {
	const t = useTranslation();
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [area, setArea] = useState<CropArea | null>(null);
	const [adjusting, setAdjusting] = useState(false);
	const [moved, setMoved] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const reset = () => {
		setCrop({ x: 0, y: 0 });
		setZoom(1);
		setArea(null);
		setAdjusting(false);
		setMoved(false);
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
			setError(cause instanceof Error ? cause.message : t('사진을 자를 수 없어요.'));
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
				className="top-0 left-0 flex h-dvh w-full translate-x-0 translate-y-0 items-center justify-center
					overflow-y-auto bg-[rgba(20,14,8,0.45)] px-gutter py-8"
			>
				<div className="flex w-full max-w-sm flex-col items-center gap-6">
					<div className="text-center">
						<DialogTitle className="m-0 font-display text-xl font-normal text-white">
							{t('폴라로이드에 맞춰 주세요')}
						</DialogTitle>
						<p className="mt-1 mb-0 text-[0.8125rem] text-white/80">
							{t('이 틀 그대로 결과 카드에 들어가요')}
						</p>
					</div>

					{/* 조작하는 동안에는 수평을 맞추기 쉽게 기울기를 편다. */}
					<div
						className={`relative w-full rounded-sm bg-white px-3 pt-3
							shadow-[0_7px_0_var(--color-depth-action),0_24px_38px_-18px_rgba(0,0,0,0.6)]
							transition-transform duration-300 ease-leaf motion-reduce:transition-none
							${adjusting ? 'rotate-0' : '-rotate-2'}`}
					>
						<span
							className={`${TAPE_CLASS} left-6 w-24 -rotate-7 [--tape:var(--color-primary)]`}
							aria-hidden="true"
						/>
						<span
							className={`${TAPE_CLASS} right-6 w-21 rotate-6 [--tape:var(--color-gold)]`}
							aria-hidden="true"
						/>
						<div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2px] bg-ink">
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
									onInteractionStart={() => {
										setAdjusting(true);
										setMoved(true);
									}}
									onInteractionEnd={() => setAdjusting(false)}
									style={{ cropAreaStyle: { border: 0, boxShadow: 'none' } }}
									mediaProps={{ alt: t('자를 사진') }}
								/>
							)}
							{!moved && (
								<span
									className="pointer-events-none absolute top-1/2 left-1/2 z-2 inline-flex
										-translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-ink/60
										px-3 py-1.5 font-display text-[0.8125rem] whitespace-nowrap text-white"
									aria-hidden="true"
								>
									<Move className="size-4" strokeWidth={2} />
									{t('끌어서 옮기기')}
								</span>
							)}
						</div>
						<div className="flex flex-col items-center gap-0.5 pt-2.5 pb-3 text-center">
							<span className="font-display text-3xl leading-none text-primary-active">{type}</span>
							<span className="font-display text-[0.9375rem] break-keep text-ink">
								{t(getTypeName(type))}
							</span>
						</div>
					</div>

					<label className="flex w-full items-center gap-3 font-display text-sm text-white/80">
						<span className="shrink-0">{t('확대')}</span>
						<input
							type="range"
							min={1}
							max={MAX_ZOOM}
							step={0.01}
							value={zoom}
							onChange={(event) => {
								setZoom(Number(event.target.value));
								setMoved(true);
							}}
							className="h-11 w-full cursor-pointer accent-primary"
							aria-label={t('사진 확대')}
						/>
					</label>

					{error && (
						<p role="alert" className="m-0 text-sm text-primary-glow">
							{t(error)}
						</p>
					)}

					<div className="flex w-full flex-col gap-1">
						<GameButton
							size="sm"
							className="min-h-12 w-full"
							onClick={() => void handleConfirm()}
							disabled={!area || busy}
						>
							{busy ? t('자르는 중…') : t('이대로 합성하기')}
						</GameButton>
						<GameButton
							variant="ghost"
							size="sm"
							className="min-h-11 w-full text-base text-white/85 hover:bg-white/10 hover:text-white"
							onClick={() => {
								reset();
								onReselect();
							}}
						>
							{t('다른 사진 고르기')}
						</GameButton>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
