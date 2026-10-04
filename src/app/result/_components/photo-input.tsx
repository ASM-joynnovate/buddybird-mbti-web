'use client';

import { type ChangeEvent, useId, useRef, useState } from 'react';

import type { TypeCode } from '@/types/mbti';

import { track } from '@/lib/analytics/track';
import { photoError } from '@/lib/image-generation/input';
import { buttonTap } from '@/lib/motion/variants';

import { PhotoCropDialog } from '@/app/result/_components/photo-crop-dialog';
import { m, useReducedMotion } from 'motion/react';

interface PhotoInputProps {
	type: TypeCode;
	onPick: (file: File) => void;
}

const ACCEPT = 'image/jpeg,image/png,image/webp';

export function PhotoInput({ type, onPick }: PhotoInputProps) {
	const [error, setError] = useState<string | null>(null);
	const hintId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const reducedMotion = useReducedMotion();
	const [pending, setPending] = useState<string | null>(null);

	const closeCrop = () => {
		if (pending) URL.revokeObjectURL(pending);
		setPending(null);
	};

	// capture 속성 없이 하나의 input만 두면 휴대폰에서 OS가 "사진 찍기 / 사진 보관함" 메뉴를 띄운다.
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;
		const invalid = photoError(file);
		setError(invalid);
		if (invalid) return;
		setPending(URL.createObjectURL(file));
	};

	const handleCropped = (file: File) => {
		if (!pending) return;
		track({ name: 'photo_attached', payload: { source: 'picker' } });
		closeCrop();
		onPick(file);
	};

	return (
		<div>
			<input
				ref={inputRef}
				type="file"
				accept={ACCEPT}
				hidden
				aria-label="우리 새 사진 선택"
				onChange={handleChange}
			/>
			<m.button
				type="button"
				whileTap={reducedMotion ? undefined : buttonTap}
				aria-describedby={hintId}
				className="flex w-full cursor-pointer touch-manipulation items-center gap-3.5 rounded-[1.375rem]
					border-[length:var(--border-panel)] border-dashed border-border-action bg-surface-cream p-3.5
					text-left transition-[border-color] duration-150 ease-leaf [-webkit-tap-highlight-color:transparent]
					hover:border-primary focus-visible:outline-3 focus-visible:outline-offset-3
					focus-visible:outline-faction-sentinel"
				onClick={() => inputRef.current?.click()}
			>
				<span
					className="w-21.5 flex-none -rotate-4 rounded-[4px] bg-white px-1.25 pt-1.25 pb-3.25
						shadow-raise-bar-action"
					aria-hidden="true"
				>
					<span
						className="grid aspect-[5/4] place-items-center rounded-[3px] font-display text-[1.625rem]
							leading-none text-primary
							[background:repeating-linear-gradient(45deg,#fbeedd_0_6px,#fff6ea_6px_12px)]"
					>
						+
					</span>
				</span>
				<span className="min-w-0">
					<span className="block font-display text-base text-ink">우리 새로 카드 만들기</span>
					<span id={hintId} className="mt-0.75 block text-xs text-ink-muted">
						{type} 의상을 입혀 드려요
					</span>
				</span>
			</m.button>
			<PhotoCropDialog
				src={pending}
				type={type}
				onCancel={closeCrop}
				onReselect={() => {
					closeCrop();
					inputRef.current?.click();
				}}
				onConfirm={handleCropped}
			/>
			{error && (
				<p role="alert" className="mt-3 mb-0 text-sm text-primary-active">
					{error}
				</p>
			)}
		</div>
	);
}
