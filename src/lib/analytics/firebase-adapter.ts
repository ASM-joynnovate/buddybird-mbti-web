import type { TypeCode } from '@/types/mbti';

import { type AnalyticsAdapter, consoleAdapter } from '@/lib/analytics/adapter';
import type { AnalyticsEvent } from '@/lib/analytics/events';
import type { LogEventFn } from '@/lib/firebase/client';

import type { Analytics } from 'firebase/analytics';

type GaParams = Record<string, string | number | boolean>;

function renameType(payload: { type: TypeCode } & Record<string, string | number>): GaParams {
	const { type, ...rest } = payload;
	return { ...rest, parrot_type: type };
}

function toGaParams(event: AnalyticsEvent): GaParams {
	switch (event.name) {
		case 'test_start':
		case 'photo_removed':
			return {};
		case 'question_answered':
			return {
				question_id: event.payload.questionId,
				choice_id: event.payload.choiceId,
				index: event.payload.index,
			};
		case 'test_completed':
		case 'share_success':
		case 'share_cancel':
		case 'share_error':
		case 'detail_cta_click':
		case 'image_error':
			return { parrot_type: event.payload.type };
		case 'share_fallback':
		case 'detail_open':
		case 'result_view':
			return renameType(event.payload);
		case 'photo_attached':
		case 'app_cta_click':
		case 'deck_open':
		case 'deck_close':
		case 'detail_close':
		case 'test_back':
		case 'restart_click':
		case 'result_error':
		case 'species_selected':
			return { ...event.payload };
	}
}

export function createFirebaseAdapter(analytics: Analytics, logEvent: LogEventFn): AnalyticsAdapter {
	const isDev = process.env.NODE_ENV === 'development';
	return {
		track(event: AnalyticsEvent): void {
			if (isDev) consoleAdapter.track(event);
			const params = toGaParams(event);
			logEvent(analytics, event.name, isDev ? { ...params, debug_mode: true } : params);
		},
	};
}
