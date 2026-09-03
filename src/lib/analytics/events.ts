import type { TypeCode } from '@/types/mbti';

export type AnalyticsEventName =
	| 'species_selected'
	| 'test_start'
	| 'question_answered'
	| 'test_completed'
	| 'photo_attached'
	| 'share_success'
	| 'share_fallback'
	| 'app_cta_click'
	| 'deck_open'
	| 'deck_close'
	| 'detail_open'
	| 'detail_close'
	| 'detail_cta_click'
	| 'test_back'
	| 'result_view'
	| 'result_error'
	| 'restart_click'
	| 'share_cancel'
	| 'share_error'
	| 'photo_removed'
	| 'image_error';

export type PayloadOf<N extends AnalyticsEventName> = Extract<AnalyticsEvent, { name: N }>['payload'];

export type AnalyticsEvent =
	| { name: 'species_selected'; payload: { species: string } }
	| { name: 'test_start'; payload: Record<string, never> }
	| {
			name: 'question_answered';
			payload: { questionId: string; choiceId: string; index: number };
	  }
	| { name: 'test_completed'; payload: { type: TypeCode } }
	| { name: 'photo_attached'; payload: { source: 'camera' | 'gallery' } }
	| { name: 'share_success'; payload: { type: TypeCode } }
	| { name: 'share_fallback'; payload: { type: TypeCode; reason: string } }
	| { name: 'app_cta_click'; payload: { placement: 'intro' | 'result' } }
	| {
			name: 'deck_open';
			payload: { source: 'intro' | 'result'; trigger: 'button' | 'scrub' };
	  }
	| {
			name: 'deck_close';
			payload: { source: 'intro' | 'result'; trigger: 'button' | 'gesture' };
	  }
	| {
			name: 'detail_open';
			payload: { type: TypeCode; source: 'stack' | 'deck' | 'match' | 'chip' };
	  }
	| { name: 'detail_close'; payload: { method: 'button' | 'scrim' | 'escape' } }
	| { name: 'detail_cta_click'; payload: { type: TypeCode } }
	| { name: 'test_back'; payload: { index: number } }
	| { name: 'result_view'; payload: { type: TypeCode; visitor: 'owner' | 'shared' } }
	| { name: 'result_error'; payload: { reason: 'missing' | 'invalid' } }
	| { name: 'restart_click'; payload: { source: 'owner' | 'shared' | 'error' } }
	| { name: 'share_cancel'; payload: { type: TypeCode } }
	| { name: 'share_error'; payload: { type: TypeCode } }
	| { name: 'photo_removed'; payload: Record<string, never> }
	| { name: 'image_error'; payload: { type: TypeCode } };
