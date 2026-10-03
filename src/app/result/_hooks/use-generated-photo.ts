'use client';

import { useEffect, useRef, useState } from 'react';

import type { TypeCode } from '@/types/mbti';

import { trackEvent } from '@/lib/analytics/track';

interface Generation {
	file: File;
	type: TypeCode;
	status: 'pending' | 'success' | 'error';
	url: string | null;
	error: string | null;
}

export function useGeneratedPhoto(selectedFile: File | null, type: TypeCode | null) {
	const [generation, setGeneration] = useState<Generation | null>(null);
	const active = useRef<AbortController | null>(null);
	const url = useRef<string | null>(null);
	useEffect(
		() => () => {
			active.current?.abort();
			active.current = null;
			if (url.current) URL.revokeObjectURL(url.current);
			url.current = null;
		},
		[type],
	);

	const current = generation?.file === selectedFile && generation?.type === type ? generation : null;
	const generate = async (nextFile?: File) => {
		const file = nextFile ?? selectedFile;
		if (!file || !type) return;
		if (active.current && !nextFile) return;
		// Selecting a new photo replaces any in-flight request immediately.
		active.current?.abort();
		const controller = new AbortController();
		active.current = controller;
		const started = performance.now();
		if (url.current) URL.revokeObjectURL(url.current);
		url.current = null;
		setGeneration({ file, type, status: 'pending', url: null, error: null });
		try {
			const form = new FormData();
			form.set('photo', file);
			form.set('type', type);
			const response = await fetch('/api/generate-image', {
				method: 'POST',
				body: form,
				signal: AbortSignal.any([controller.signal, AbortSignal.timeout(120_000)]),
			});
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.message ?? '사진을 합성하지 못했어요. 다시 시도해 주세요.');
			}
			const blob = await response.blob();
			if (!blob.type.startsWith('image/') || !blob.size) throw new Error('합성 이미지를 읽을 수 없어요.');
			if (active.current !== controller) return;
			url.current = URL.createObjectURL(blob);
			setGeneration({ file, type, status: 'success', url: url.current, error: null });
			trackEvent('generation_completed', {
				outcome: 'success',
				duration_ms: Math.round(performance.now() - started),
			});
		} catch (error) {
			if (active.current !== controller || controller.signal.aborted) return;
			setGeneration({
				file,
				type,
				status: 'error',
				url: null,
				error:
					error instanceof Error && error.name !== 'TimeoutError'
						? error.message
						: '합성 시간이 길어지고 있어요. 다시 시도해 주세요.',
			});
			trackEvent('generation_completed', {
				outcome: 'error',
				duration_ms: Math.round(performance.now() - started),
			});
		} finally {
			if (active.current === controller) active.current = null;
		}
	};
	return {
		url: current?.url ?? null,
		busy: current?.status === 'pending',
		error: current?.error ?? null,
		generate,
	};
}
