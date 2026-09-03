'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PhotoSource {
	file: File | null;
	objectUrl: string | null;
	setFile: (file: File | null) => void;
	clear: () => void;
}

export function usePhotoSource(): PhotoSource {
	const [file, setFileState] = useState<File | null>(null);
	const [objectUrl, setObjectUrl] = useState<string | null>(null);
	const urlRef = useRef<string | null>(null);

	const revokeUrl = useCallback(() => {
		if (urlRef.current !== null) {
			URL.revokeObjectURL(urlRef.current);
			urlRef.current = null;
		}
	}, []);

	const setFile = useCallback(
		(next: File | null) => {
			revokeUrl();

			if (next !== null) {
				const url = URL.createObjectURL(next);
				urlRef.current = url;
				setObjectUrl(url);
			} else {
				setObjectUrl(null);
			}

			setFileState(next);
		},
		[revokeUrl],
	);

	const clear = useCallback(() => setFile(null), [setFile]);

	useEffect(() => {
		return () => revokeUrl();
	}, [revokeUrl]);

	return { file, objectUrl, setFile, clear };
}
