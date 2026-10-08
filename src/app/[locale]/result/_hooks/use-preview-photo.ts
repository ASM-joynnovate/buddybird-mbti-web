'use client';

import { useEffect, useState } from 'react';

const SAMPLE_SRC = '/__bb620-preview/photo.jpeg';

export function usePreviewPhoto(enabled: boolean): string | null {
	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!enabled) return;
		let disposed = false;
		let objectUrl: string | null = null;

		const prepare = async () => {
			try {
				const source = new Image();
				source.src = SAMPLE_SRC;
				await source.decode();
				const canvas = document.createElement('canvas');
				canvas.width = 1400;
				canvas.height = 1120;
				const context = canvas.getContext('2d');
				if (!context) return;
				const sourceHeight = source.naturalWidth * (canvas.height / canvas.width);
				const sourceY = Math.min(source.naturalHeight - sourceHeight, source.naturalHeight * 0.18);
				context.drawImage(
					source,
					0,
					sourceY,
					source.naturalWidth,
					sourceHeight,
					0,
					0,
					canvas.width,
					canvas.height,
				);
				const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
				if (!blob || disposed) return;
				objectUrl = URL.createObjectURL(blob);
				setUrl(objectUrl);
			} catch {
				// The result page still works without the local sample photo.
			}
		};

		void prepare();
		return () => {
			disposed = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [enabled]);

	return url;
}
