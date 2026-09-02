import type { Metadata } from 'next';

import { SpeciesView } from '@/features/species/species-view';

export const metadata: Metadata = {
	title: '앵무새 종 선택 · 앵BTI',
};

export default function SpeciesPage() {
	return <SpeciesView />;
}
