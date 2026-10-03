'use client';

import { type ChangeEvent, type ReactNode, useId, useRef, useState } from 'react';

import type { TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';
import { photoError } from '@/lib/image-generation/input';
import { buttonTap } from '@/lib/motion/variants';

import { PhotoCropDialog } from '@/app/result/_components/photo-crop-dialog';
import { CameraIcon, ImageIcon } from 'lucide-react';
import { m, useReducedMotion } from 'motion/react';

interface PhotoInputProps {
	type: TypeCode;
	onPick: (file: File) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';

interface SourceTileProps {
	icon: ReactNode;
	label: string;
	onClick: () => void;
}

function SourceTile({ icon, label, onClick }: SourceTileProps) {
	const reducedMotion = useReducedMotion();

	return (
		<m.button
			type="button"
			whileTap={reducedMotion ? undefined : buttonTap}
			className="flex min-h-23 cursor-pointer touch-manipulation flex-col items-center justify-center gap-2
				rounded-[1.25rem] border-2 border-border-action bg-white px-2 font-display text-base leading-[1.2]
				text-primary-active shadow-raise-cream transition-[box-shadow,border-color] duration-150 ease-leaf
				[-webkit-tap-highlight-color:transparent] hover:border-primary focus-visible:outline-3
				focus-visible:outline-offset-3 focus-visible:outline-faction-sentinel active:shadow-raise-cream-down"
			onClick={onClick}
		>
			<span className="grid size-10 place-items-center rounded-full bg-primary-soft" aria-hidden="true">
				{icon}
			</span>
			{label}
		</m.button>
	);
}

export function PhotoInput({ type, onPick }: PhotoInputProps) {
	const [error, setError] = useState<string | null>(null);
	const headingId = useId();
	const cameraRef = useRef<HTMLInputElement>(null);
	const galleryRef = useRef<HTMLInputElement>(null);
	const [pending, setPending] = useState<{ src: string; source: 'camera' | 'gallery' } | null>(null);

	const closeCrop = () => {
		if (pending) URL.revokeObjectURL(pending.src);
		setPending(null);
	};

	const handleChange = (source: 'camera' | 'gallery') => (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		const invalid = photoError(file);
		setError(invalid);
		if (invalid) return;
		setPending({ src: URL.createObjectURL(file), source });
	};

	const handleCropped = (file: File) => {
		if (!pending) return;
		track({ name: 'photo_attached', payload: { source: pending.source } });
		closeCrop();
		onPick(file);
	};

	return (
		<section
			className="rounded-3xl border-[length:var(--border-panel)] border-dashed border-border-action
				bg-surface-cream px-7 pt-5 pb-6"
			aria-labelledby={headingId}
		>
			<h2 id={headingId} className="m-0 font-display text-lg font-normal text-ink">
				우리 새 사진으로 카드 만들기
			</h2>
			<p className="mt-1 mb-3.5 text-[0.8125rem] leading-normal text-ink-muted">
				사진 속 우리 새에게 {type} 의상을 입혀 드려요.
			</p>
			<input
				ref={cameraRef}
				type="file"
				accept={ACCEPT}
				capture="environment"
				hidden
				aria-label="카메라로 사진 촬영"
				onChange={handleChange('camera')}
			/>
			<input
				ref={galleryRef}
				type="file"
				accept={ACCEPT}
				hidden
				aria-label="갤러리에서 사진 선택"
				onChange={handleChange('gallery')}
			/>
			<div className="grid grid-cols-2 gap-3">
				<SourceTile
					icon={<CameraIcon className="size-5.5" strokeWidth={2} />}
					label="사진 촬영"
					onClick={() => cameraRef.current?.click()}
				/>
				<SourceTile
					icon={<ImageIcon className="size-5.5" strokeWidth={2} />}
					label="갤러리에서 선택"
					onClick={() => galleryRef.current?.click()}
				/>
			</div>
			<PhotoCropDialog
				src={pending?.src ?? null}
				type={type}
				onCancel={closeCrop}
				onReselect={() => {
					const source = pending?.source;
					closeCrop();
					(source === 'camera' ? cameraRef : galleryRef).current?.click();
				}}
				onConfirm={handleCropped}
			/>
			{error && (
				<p role="alert" className="mt-3 mb-0 text-sm text-primary-active">
					{error}
				</p>
			)}
		</section>
	);
}
