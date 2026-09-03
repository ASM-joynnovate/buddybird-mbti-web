'use client';

import dynamic from 'next/dynamic';

export const DetailDialog = dynamic(() => import('./detail-dialog').then((mod) => mod.DetailDialog), {
	ssr: false,
});
