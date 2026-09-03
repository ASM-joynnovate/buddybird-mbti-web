'use client';

import { useSyncExternalStore } from 'react';

import {
	REMOTE_DEFAULTS,
	type RemoteConfigKey,
	getRemoteConfigString,
	subscribeRemoteConfig,
} from '@/lib/firebase/remote-config';

export function useRemoteConfigString(key: RemoteConfigKey): string {
	return useSyncExternalStore(
		subscribeRemoteConfig,
		() => getRemoteConfigString(key),
		() => REMOTE_DEFAULTS[key],
	);
}
