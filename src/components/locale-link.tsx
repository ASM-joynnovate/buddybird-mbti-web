'use client';

import type { ComponentProps } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { currentLocalePath } from '@/lib/i18n/path';

type LocaleLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function LocaleLink({ href, onClick, ...props }: LocaleLinkProps) {
	const router = useRouter();
	return (
		<Link
			href={href}
			onClick={(event) => {
				onClick?.(event);
				const target = currentLocalePath(href);
				if (event.defaultPrevented || target === href) return;
				event.preventDefault();
				router.push(target);
			}}
			{...props}
		/>
	);
}
