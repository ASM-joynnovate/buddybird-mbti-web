'use client';

import { useCallback, useState } from 'react';

import Image from 'next/image';

import type { TypeCode } from '@/types/mbti';

import { trackEvent } from '@/lib/analytics/track';
import { parrotImageSrc } from '@/lib/content/assets';
import { getTypeInfo } from '@/lib/content/type-infos';

const reportedTypes = new Set<TypeCode>();

function reportImageError(type: TypeCode): void {
	if (reportedTypes.has(type)) {
		return;
	}
	reportedTypes.add(type);
	trackEvent('image_error', { type });
}

interface ParrotImageProps {
	type: TypeCode;
	width: number;
	height: number;
	className?: string;
	loading?: 'eager' | 'lazy';
	fetchPriority?: 'high' | 'low' | 'auto';
	sizes?: string;
}

export function ParrotImage({
	type,
	width,
	height,
	className,
	loading = 'lazy',
	fetchPriority,
	sizes,
}: ParrotImageProps) {
	const [failed, setFailed] = useState(false);
	const info = getTypeInfo(type);
	const alt = info ? `${info.name} (${type}) 앵무새` : `${type} 앵무새`;

	const checkBroken = useCallback(
		(node: HTMLImageElement | null) => {
			if (node !== null && node.complete && node.naturalWidth === 0) {
				reportImageError(type);
				setFailed(true);
			}
		},
		[type],
	);

	if (failed) {
		return (
			<span
				className={`flex h-full w-full flex-col items-center justify-center gap-2
					bg-[linear-gradient(160deg,#fffdf6_0%,#f4e9cc_100%)] text-ink-muted ${className ?? ''}`}
				role="img"
				aria-label={alt}
			>
				<span className="text-4xl leading-none" aria-hidden="true">
					🦜
				</span>
				<span className="font-display text-xl tracking-wider text-ink">{type}</span>
			</span>
		);
	}

	return (
		<Image
			ref={checkBroken}
			src={parrotImageSrc(type)}
			alt={alt}
			width={width}
			height={height}
			quality={65}
			loading={loading}
			fetchPriority={fetchPriority}
			sizes={sizes}
			className={className}
			onError={() => {
				reportImageError(type);
				setFailed(true);
			}}
		/>
	);
}
