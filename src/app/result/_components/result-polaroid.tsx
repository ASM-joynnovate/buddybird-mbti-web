'use client';

import type { CSSProperties } from 'react';

import type { TypeCode } from '@/types/mbti';

import { m } from 'motion/react';

import { ParrotImage } from '@/components/ui/parrot-image';

interface ResultPolaroidProps {
	type: TypeCode;
	name: string;
	gradient: string;
	photoUrl: string | null;
	reducedMotion: boolean;
}

const RAYS_CLASS =
	'pointer-events-none absolute top-6 left-1/2 z-1 aspect-square w-full -translate-x-1/2 rounded-full opacity-50 [background:conic-gradient(from_8deg,rgba(255,255,255,0.16)_0_7deg,transparent_7deg_30deg)] [-webkit-mask-image:radial-gradient(closest-side,#000_30%,transparent_72%)] [mask-image:radial-gradient(closest-side,#000_30%,transparent_72%)]';

const VIGNETTE_CLASS =
	'pointer-events-none absolute inset-0 z-2 [background:radial-gradient(120%_80%_at_28%_8%,rgba(255,255,255,0.4),transparent_56%),radial-gradient(140%_90%_at_50%_122%,rgba(0,0,0,0.3),transparent_60%)]';

interface CharShotProps {
	type: TypeCode;
	reducedMotion: boolean;
}

function CharShot({ type, reducedMotion }: CharShotProps) {
	const image = (
		<ParrotImage
			type={type}
			width={300}
			height={300}
			loading="eager"
			fetchPriority="high"
			sizes="263px"
			className="h-full w-full object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.4)]"
		/>
	);
	return (
		<>
			<span className={RAYS_CLASS} aria-hidden="true" />
			{reducedMotion ? (
				<div className="absolute inset-0 z-3">{image}</div>
			) : (
				<m.div
					className="absolute inset-0 z-3"
					animate={{ y: [0, -8, 0] }}
					transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
				>
					{image}
				</m.div>
			)}
			<span className={VIGNETTE_CLASS} aria-hidden="true" />
		</>
	);
}

export function ResultPolaroid({ type, name, gradient, photoUrl, reducedMotion }: ResultPolaroidProps) {
	const charBg = { background: gradient } as CSSProperties;

	return (
		<div
			className="relative mx-auto w-full max-w-96 -rotate-2 rounded-sm bg-white p-3.5 pb-0
				shadow-[0_7px_0_var(--color-depth-action),0_24px_38px_-18px_rgba(40,20,8,0.5),inset_0_0_0_1px_rgba(0,0,0,0.03)]"
		>
			<span
				className="pointer-events-none absolute -top-3.5 left-8 z-4 h-10 w-32 -rotate-7 opacity-80
					shadow-[0_4px_8px_rgba(0,0,0,0.16)]
					[background:repeating-linear-gradient(45deg,rgba(255,255,255,0.22)_0_10px,transparent_10px_20px),var(--color-primary)]"
				aria-hidden="true"
			/>
			<span
				className="pointer-events-none absolute -top-3 right-8 z-4 h-10 w-28 rotate-6 opacity-80
					shadow-[0_4px_8px_rgba(0,0,0,0.16)]
					[background:repeating-linear-gradient(45deg,rgba(255,255,255,0.22)_0_10px,transparent_10px_20px),var(--color-gold)]"
				aria-hidden="true"
			/>

			{photoUrl !== null ? (
				<div className="flex h-60 gap-2.5">
					<div
						className="relative flex-1 overflow-hidden rounded-sm bg-surface-cream
							shadow-[inset_0_0_0_2px_rgba(0,0,0,0.05)]"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							className="absolute inset-0 h-full w-full object-cover"
							src={photoUrl}
							alt="내 앵무새 사진"
							data-clarity-mask="True"
						/>
					</div>
					<div className="relative flex-1 overflow-hidden rounded-sm" style={charBg}>
						<CharShot type={type} reducedMotion={reducedMotion} />
					</div>
				</div>
			) : (
				<div className="relative h-72 overflow-hidden rounded-sm" style={charBg}>
					<CharShot type={type} reducedMotion={reducedMotion} />
				</div>
			)}

			<div className="flex flex-col items-center gap-0.5 px-1 pt-3 pb-4 text-center">
				<span className="font-display text-4xl leading-none tracking-wide text-primary-active">{type}</span>
				<span className="font-display text-lg break-keep text-ink">{name}</span>
			</div>
		</div>
	);
}
