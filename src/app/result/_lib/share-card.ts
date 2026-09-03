import type { TypeCode } from '@/types/mbti';

export type ShareOutcome = { kind: 'shared' } | { kind: 'canceled' } | { kind: 'fallback'; reason: string };

export async function shareCard(blob: Blob, type: TypeCode): Promise<ShareOutcome> {
	const file = new File([blob], `buddybird-${type}.png`, { type: blob.type });

	const isDesktop = !isMobileUserAgent();

	const canShareFiles =
		!isDesktop &&
		typeof navigator.share === 'function' &&
		typeof navigator.canShare === 'function' &&
		navigator.canShare({ files: [file] });

	if (canShareFiles) {
		try {
			await navigator.share({
				files: [file],
				title: '우리 앵무새의 앵BTI 결과',
				text: `우리 앵무새는 ${type}! 너희 앵무새도 테스트해봐 🦜`,
			});
			return { kind: 'shared' };
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				return { kind: 'canceled' };
			}
			downloadFile(file);
			return { kind: 'fallback', reason: getErrorMessage(error) };
		}
	}

	downloadFile(file);
	return { kind: 'fallback', reason: isDesktop ? 'desktop-download' : 'web-share-unsupported' };
}

function isMobileUserAgent(): boolean {
	if (typeof navigator === 'undefined') {
		return false;
	}
	const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
	if (typeof uaData?.mobile === 'boolean') {
		return uaData.mobile;
	}
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function downloadFile(file: File): void {
	const url = URL.createObjectURL(file);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = file.name;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return 'share-failed';
}
