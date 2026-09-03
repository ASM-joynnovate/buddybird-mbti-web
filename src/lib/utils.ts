import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			radius: ['card', 'panel'],
			shadow: [
				'raise-primary',
				'raise-primary-down',
				'raise-cream',
				'raise-cream-down',
				'raise-cream-sm',
				'raise-panel',
				'card-frame',
				'card-frame-sm',
				'window',
				'ghost',
				'inset-track',
				'raise-bar-primary',
				'raise-bar-action',
				'raise-bar-action-sm',
				'inset-highlight',
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
