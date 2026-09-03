'use client';

import { useEffect } from 'react';

import {
	type AnalyticsAdapter,
	consoleAdapter,
	getAnalyticsAdapter,
	setAnalyticsAdapter,
} from '@/lib/analytics/adapter';
import { createClarityAdapter } from '@/lib/analytics/clarity-adapter';
import type { AnalyticsEvent } from '@/lib/analytics/events';
import { createFanoutAdapter } from '@/lib/analytics/fanout-adapter';
import { createFirebaseAdapter } from '@/lib/analytics/firebase-adapter';
import { initClarity } from '@/lib/clarity/client';
import { isClarityConfigured } from '@/lib/clarity/config';
import { initFirebase } from '@/lib/firebase/client';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { getRemoteConfigString } from '@/lib/firebase/remote-config';

const BUFFER_CAP = 50;

export function AnalyticsBootstrap() {
	useEffect(() => {
		if (!isFirebaseConfigured() && !isClarityConfigured()) return;

		const buffered: AnalyticsEvent[] = [];
		const bufferingAdapter: AnalyticsAdapter = {
			track(event: AnalyticsEvent): void {
				consoleAdapter.track(event);
				if (buffered.length < BUFFER_CAP) buffered.push(event);
			},
		};
		setAnalyticsAdapter(bufferingAdapter);

		let started = false;
		let idleHandle: number | undefined;
		let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

		const removeTriggers = () => {
			window.removeEventListener('load', schedule);
			if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
			if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
		};

		async function boot(): Promise<void> {
			const sinks: AnalyticsAdapter[] = [];
			if (isFirebaseConfigured()) {
				const services = await initFirebase();
				if (services?.analytics) {
					sinks.push(createFirebaseAdapter(services.analytics, services.logEvent));
				}
			}
			if (isClarityConfigured() && getRemoteConfigString('clarity_enabled') !== 'false') {
				const clarity = await initClarity();
				if (clarity) sinks.push(createClarityAdapter(clarity));
			}
			if (getAnalyticsAdapter() !== bufferingAdapter) return;
			if (sinks.length > 0) {
				const adapter = createFanoutAdapter(sinks);
				setAnalyticsAdapter(adapter);
				buffered.forEach((event) => adapter.track(event));
			} else {
				setAnalyticsAdapter(consoleAdapter);
			}
		}

		function start(): void {
			if (started) return;
			started = true;
			removeTriggers();
			boot().catch((error: unknown) => {
				console.warn('[analytics] bootstrap failed', error);
				if (getAnalyticsAdapter() === bufferingAdapter) {
					setAnalyticsAdapter(consoleAdapter);
				}
			});
		}

		function schedule(): void {
			if (typeof window.requestIdleCallback === 'function') {
				idleHandle = window.requestIdleCallback(start);
				return;
			}
			timeoutHandle = setTimeout(start, 3000);
		}

		if (document.readyState === 'complete') {
			schedule();
		} else {
			window.addEventListener('load', schedule, { once: true });
		}

		return () => {
			removeTriggers();
			if (getAnalyticsAdapter() === bufferingAdapter) {
				setAnalyticsAdapter(consoleAdapter);
			}
		};
	}, []);

	return null;
}
