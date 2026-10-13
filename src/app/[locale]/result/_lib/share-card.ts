import type { TypeCode } from '@/types/mbti';

import type { Locale } from '@/lib/i18n/locale';
import { translator } from '@/lib/i18n/translate';

const BLOB_URL_TTL_MS = 30_000;

export type ShareOutcome =
	| { kind: 'shared' }
	| { kind: 'canceled' }
	| { kind: 'fallback'; reason: string }
	// 인앱 브라우저는 blob: 다운로드를 처리하지 못해 사용자가 카드 이미지를 직접 길게 눌러 저장해야 한다.
	| { kind: 'manual-save'; reason: string };

export async function shareCard(blob: Blob, type: TypeCode, locale: Locale): Promise<ShareOutcome> {
	const t = translator(locale);
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
				title: t('우리 앵무새의 앵BTI 결과'),
				text: t('우리 앵무새는 {type}! 너희 앵무새도 테스트해봐 🦜').replace('{type}', type),
			});
			return { kind: 'shared' };
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				return { kind: 'canceled' };
			}
			return saveFile(file, getErrorMessage(error));
		}
	}

	return saveFile(file, isDesktop ? 'desktop-download' : 'web-share-unsupported');
}

function saveFile(file: File, reason: string): ShareOutcome {
	if (isInAppBrowser()) {
		return { kind: 'manual-save', reason };
	}
	downloadFile(file);
	return { kind: 'fallback', reason };
}

function isInAppBrowser(): boolean {
	if (typeof navigator === 'undefined') {
		return false;
	}
	// Instagram, Facebook, KakaoTalk, NAVER, LINE 앱과 그 밖의 Android WebView(`; wv)`).
	return /Instagram|FBAN|FBAV|KAKAOTALK|NAVER\(inapp|Line\/|; wv\)/.test(navigator.userAgent);
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
	// 일부 브라우저는 다운로드를 비동기로 시작하므로 URL을 바로 해제하면 저장에 실패한다.
	setTimeout(() => URL.revokeObjectURL(url), BLOB_URL_TTL_MS);
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return 'share-failed';
}
