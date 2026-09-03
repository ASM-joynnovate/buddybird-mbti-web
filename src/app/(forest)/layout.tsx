import type { ReactNode } from 'react';

import { MobileForestBackground } from '@/components/forest/mobile-forest-background';

export default function ForestLayout({ children }: { children: ReactNode }) {
	return <MobileForestBackground>{children}</MobileForestBackground>;
}
