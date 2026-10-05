'use client';

import { useTranslation } from '@/providers/locale-provider';

const LINES = [
	'우리 앵이에게 딱 맞는 옷을 고르고 있어요.',
	'날개 쏙, 옷을 입혀 보고 있어요.',
	'어울리는 소품을 챙기고 있어요.',
] as const;

// 막대와 문구는 실제 진행률이 아닌 시간 기준 연출이다. 합성이 길어지면 마지막 문구에서 멈춘다.
const LINE_DELAYS = ['1s', '4.5s', '8s'] as const;

export function GenerationProgress() {
	const t = useTranslation();
	return (
		<div
			role="status"
			className="flex flex-col gap-2.5 rounded-[1.375rem] border-[length:var(--border-panel)] border-border-action
				bg-surface-cream px-4 pt-3.5 pb-4 shadow-[0_5px_0_var(--color-depth-action)]"
		>
			<div className="flex items-center justify-between">
				<span className="font-display text-base text-ink">{t('우리 앵 옷 입히는 중')}</span>
				<span className="text-[0.8125rem] text-ink-muted">{t('약 10초')}</span>
			</div>
			<div
				className="relative h-2.5 overflow-hidden rounded-full bg-[#eadfc6] shadow-inset-track"
				aria-hidden="true"
			>
				<span
					className="absolute inset-0 origin-left animate-gen-bar rounded-full
						bg-[linear-gradient(90deg,var(--color-primary-glow),var(--color-primary))]"
				/>
			</div>
			<div className="relative h-[1.45em] overflow-hidden text-sm leading-[1.45] text-ink" aria-hidden="true">
				{LINES.map((line, index) => {
					const last = index === LINES.length - 1;
					return (
						<span
							key={t(line)}
							className={`absolute inset-x-0 top-0 truncate ${
								last
									? 'animate-gen-line-last motion-reduce:[animation-name:gen-line-last-fade]'
									: 'animate-gen-line motion-reduce:[animation-name:gen-line-fade]'
							}`}
							style={{ animationDelay: LINE_DELAYS[index] }}
						>
							{t(line)}
						</span>
					);
				})}
			</div>
			<span className="sr-only">{t('우리 앵 옷 입히는 중이에요. 10초 정도 걸려요.')}</span>
		</div>
	);
}
