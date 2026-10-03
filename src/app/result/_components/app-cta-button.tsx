'use client';

import { useSyncExternalStore } from 'react';

import Image from 'next/image';

import { useRemoteConfigString } from '@/hooks/use-remote-config-string';

import { track } from '@/lib/analytics/track';
import { APP_CTA_LABEL } from '@/lib/content/cta';

import { resolveStoreUrl } from '@/app/result/_lib/store-link';

import { GameButtonLink } from '@/components/ui/button';

import buddybirdIcon from '@/public/assets/buddybird-headphones.webp';

interface AppCtaButtonProps {
	placement: 'intro' | 'result';
}

const noopSubscribe = () => () => {};
const getStoreUrl = () => resolveStoreUrl(navigator.userAgent, navigator.maxTouchPoints);
const getFallbackStoreUrl = () => resolveStoreUrl('');

export function AppCtaButton({ placement }: AppCtaButtonProps) {
	const remoteResultLabel = useRemoteConfigString('result_cta_label');
	const isResult = placement === 'result';
	const label = isResult ? remoteResultLabel : APP_CTA_LABEL;

	const storeUrl = useSyncExternalStore(noopSubscribe, getStoreUrl, getFallbackStoreUrl);

	const handleClick = () => {
		track({ name: 'app_cta_click', payload: { placement } });
	};

	return (
		<GameButtonLink
			variant={isResult ? 'primary' : 'secondary'}
			size="sm"
			className={isResult ? 'w-full' : undefined}
			href={storeUrl}
			target="_blank"
			rel="noopener noreferrer"
			onClick={handleClick}
		>
			<Image src={buddybirdIcon} alt="" width={32} height={32} className="-my-1 size-8 shrink-0" />
			{label}
		</GameButtonLink>
	);
}
