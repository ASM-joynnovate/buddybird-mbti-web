import * as Sentry from '@sentry/nextjs';

const CHECK_INTERVAL_MS = 30 * 60_000;

async function checkCredits(key: string) {
	try {
		const response = await fetch('https://openrouter.ai/api/v1/credits', {
			headers: { Authorization: `Bearer ${key}` },
			signal: AbortSignal.timeout(10_000),
		});
		if (!response.ok) throw new Error(`OpenRouter credits request failed: ${response.status}`);
		const { data } = await response.json();
		// 잔액 기준($10)은 Sentry metric monitor "OpenRouter 잔액 $10 이하"에서 관리한다.
		Sentry.metrics.gauge('openrouter.credits.remaining_usd', data.total_credits - data.total_usage);
	} catch (error) {
		Sentry.captureException(error);
	}
}

// ponytail: ECS 태스크마다 따로 조회하므로 태스크 수만큼 중복 전송된다. 태스크가 늘면 예약 작업 하나로 옮긴다.
export function watchOpenRouterCredits() {
	// /credits는 관리 키로만 조회할 수 있다.
	const key = process.env.OPENROUTER_MANAGEMENT_KEY;
	if (!key) return;
	void checkCredits(key);
	setInterval(() => void checkCredits(key), CHECK_INTERVAL_MS).unref();
}
