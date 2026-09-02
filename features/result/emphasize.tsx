// Marker (highlighter) emphasis — the highlight treatment used on the result
// screen's 성격 분석 lead/body and section headers (design handoff: result.jsx
// emphasize + emp-marker port).
//
// The marker paints one highlighter stroke behind the text and lifts the glyphs
// to a strong tone (primary-active). ADR-0008 (tailwind-only): no keyframes or
// separate CSS — all inline arbitrary utils + `<mark>`. The `background`
// shorthand also resets the mark's UA default (yellow) so it never bleeds
// through the transparent band. box-decoration-break: clone repaints the stroke
// on every line when the text wraps.
import { Fragment, type ReactNode } from 'react';

export type MarkerVariant = 'body' | 'lead' | 'head';

// Full class string per variant (ADR-0008: no conditional fragments, prettier compatible).
const MARKER_CLASS: Record<MarkerVariant, string> = {
	// Body quoted phrase — gold highlighter.
	body: 'rounded-xs px-1 font-bold text-primary-active [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [background:linear-gradient(180deg,transparent_54%,#ffd24d_54%,#ffd24d_95%,transparent_95%)]',
	// Analysis lead line — slightly deeper gold.
	lead: 'rounded-xs px-1 font-bold text-primary-active [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [background:linear-gradient(180deg,transparent_54%,#ffcf5e_54%,#ffcf5e_95%,transparent_95%)]',
	// Section header — orange-glow highlighter (Jua, weight unchanged).
	head: 'rounded-xs px-1.5 font-normal text-primary-active [-webkit-box-decoration-break:clone] [box-decoration-break:clone] [background:linear-gradient(180deg,transparent_54%,var(--color-primary-glow)_54%,var(--color-primary-glow)_95%,transparent_95%)]',
};

interface MarkerProps {
	children: ReactNode;
	variant?: MarkerVariant;
}

export function Marker({ children, variant = 'body' }: MarkerProps) {
	return <mark className={MARKER_CLASS[variant]}>{children}</mark>;
}

// Wrap "...quoted..." phrases in a marker. Type descriptions without quotes pass
// through as plain text (graceful — only some of the 16 types carry quoted lines).
export function emphasize(text: string): ReactNode {
	return text
		.split(/("[^"]+")/g)
		.map((segment, index) =>
			segment.length > 1 && segment.startsWith('"') && segment.endsWith('"') ? (
				<Marker key={index}>{segment}</Marker>
			) : (
				<Fragment key={index}>{segment}</Fragment>
			),
		);
}
