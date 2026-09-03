import { Fragment, type ReactNode } from 'react';

export type MarkerVariant = 'body' | 'lead' | 'head';

const MARKER_CLASS: Record<MarkerVariant, string> = {
	body: 'rounded-xs px-1 font-bold text-primary-active [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [background:linear-gradient(180deg,transparent_54%,#ffd24d_54%,#ffd24d_95%,transparent_95%)]',
	lead: 'rounded-xs px-1 font-bold text-primary-active [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [background:linear-gradient(180deg,transparent_54%,#ffcf5e_54%,#ffcf5e_95%,transparent_95%)]',
	head: 'rounded-xs px-1.5 font-normal text-primary-active [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [background:linear-gradient(180deg,transparent_54%,var(--color-primary-glow)_54%,var(--color-primary-glow)_95%,transparent_95%)]',
};

const QUOTED_TEXT_PATTERN = /("[^"]+")/g;

interface MarkerProps {
	children: ReactNode;
	variant?: MarkerVariant;
}

export function Marker({ children, variant = 'body' }: MarkerProps) {
	return <mark className={MARKER_CLASS[variant]}>{children}</mark>;
}

export function emphasize(text: string): ReactNode {
	return text
		.split(QUOTED_TEXT_PATTERN)
		.map((segment, index) =>
			segment.length > 1 && segment.startsWith('"') && segment.endsWith('"') ? (
				<Marker key={index}>{segment}</Marker>
			) : (
				<Fragment key={index}>{segment}</Fragment>
			),
		);
}
