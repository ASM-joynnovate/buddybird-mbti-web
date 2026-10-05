import { TYPES } from '@/lib/content/type-infos';
import { localeFromCountry } from '@/lib/i18n/locale';
import { translator } from '@/lib/i18n/translate';
import { MAX_PHOTO_BYTES, PHOTO_HEIGHT, PHOTO_WIDTH, photoError } from '@/lib/image-generation/input';
import { COSTUME_PROMPT } from '@/lib/image-generation/prompt';

import * as Sentry from '@sentry/nextjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 120;
const MODEL = 'google/gemini-3.1-flash-lite-image';
const MAX_BODY_BYTES = MAX_PHOTO_BYTES + 64 * 1024;
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
	const t = translator(localeFromCountry(request.headers.get('cloudfront-viewer-country')));
	const failure = (message: string, status: number) => Response.json({ message: t(message) }, { status, headers });
	const timeout = AbortSignal.timeout(120_000);
	const signal = AbortSignal.any([request.signal, timeout]);
	try {
		// Bound the streamed body too; Content-Length may be absent or forged.
		if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
			return failure('10MB 이하의 사진을 선택해 주세요.', 413);
		}
		const reader = request.body?.getReader();
		if (!reader) return failure('사진을 선택해 주세요.', 400);
		const chunks: Uint8Array[] = [];
		let length = 0;
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				length += value.byteLength;
				if (length > MAX_BODY_BYTES) {
					await reader.cancel();
					return failure('10MB 이하의 사진을 선택해 주세요.', 413);
				}
				chunks.push(value);
			}
		} finally {
			reader.releaseLock();
		}
		let form: FormData;
		try {
			form = await new Response(Buffer.concat(chunks), {
				headers: { 'Content-Type': request.headers.get('content-type') ?? '' },
			}).formData();
		} catch {
			return failure('사진 요청을 확인해 주세요.', 400);
		}
		const file = form.get('photo');
		const type = form.get('type');
		if (!(file instanceof File) || typeof type !== 'string' || !Object.hasOwn(TYPES, type)) {
			return failure('사진과 MBTI 결과를 확인해 주세요.', 400);
		}
		const invalid = photoError(file);
		if (invalid) return failure(invalid, file.size > MAX_PHOTO_BYTES ? 413 : 400);
		let photo: Buffer;
		try {
			const bytes = Buffer.from(await file.arrayBuffer());
			const metadata = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
			const actualType = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[metadata.format as string];
			if (actualType !== file.type || (metadata.pages ?? 1) > 1) throw new Error('Invalid image');
			// Decode fully, apply EXIF orientation, strip metadata and match the agreed 5:4 output size.
			photo = await sharp(bytes, { limitInputPixels: 40_000_000 })
				.rotate()
				.resize(PHOTO_WIDTH, PHOTO_HEIGHT, { fit: 'cover' })
				.png()
				.toBuffer();
		} catch {
			return failure('사진을 읽을 수 없어요. 다른 JPEG, PNG, WebP 사진을 선택해 주세요.', 400);
		}
		const apiKey = process.env.OPENROUTER_API_KEY;
		if (!apiKey) return failure('지금은 사진 합성을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.', 503);
		const reference = await readFile(path.join(process.cwd(), 'public', 'parrots-mbti-charactor', `${type}.png`));
		const { upstream, result } = await Sentry.startSpan(
			{
				name: `generate_content ${MODEL}`,
				op: 'gen_ai.generate_content',
				attributes: { 'gen_ai.operation.name': 'generate_content', 'gen_ai.request.model': MODEL },
			},
			async (span) => {
				const upstream = await fetch('https://openrouter.ai/api/v1/images', {
					method: 'POST',
					headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
					signal,
					body: JSON.stringify({
						model: MODEL,
						prompt: COSTUME_PROMPT,
						input_references: [photo, reference].map((image) => ({
							type: 'image_url',
							image_url: { url: `data:image/png;base64,${image.toString('base64')}` },
						})),
					}),
				});
				if (!upstream.ok) return { upstream, result: null };
				const result = await upstream.json();
				const usage = result?.usage ?? {};
				span.setAttributes({
					'gen_ai.usage.input_tokens': usage.prompt_tokens,
					'gen_ai.usage.output_tokens': usage.completion_tokens,
					'gen_ai.usage.total_tokens': usage.total_tokens,
					'gen_ai.cost.total_tokens': usage.cost,
				});
				const attributes = { model: MODEL };
				Sentry.metrics.count('openrouter.tokens.input', usage.prompt_tokens ?? 0, { attributes });
				Sentry.metrics.count('openrouter.tokens.output', usage.completion_tokens ?? 0, { attributes });
				Sentry.metrics.distribution('openrouter.cost_usd', usage.cost ?? 0, { attributes });
				Sentry.logger.info('OpenRouter image generated', { model: MODEL, ...usage });
				return { upstream, result };
			},
		);
		if (!upstream.ok) {
			Sentry.logger.error('OpenRouter image generation failed', {
				model: MODEL,
				status: upstream.status,
				body: (await upstream.text()).slice(0, 500),
			});
			return failure(
				'사진을 합성하지 못했어요. 잠시 후 다시 시도해 주세요.',
				upstream.status === 429 ? 429 : 502,
			);
		}
		const encoded = result?.data?.[0]?.b64_json;
		if (typeof encoded !== 'string' || !encoded || encoded.length > 40 * 1024 * 1024) {
			return failure('합성 이미지가 도착하지 않았어요. 다시 시도해 주세요.', 502);
		}
		let output: Buffer;
		try {
			// The model may return a different size; always deliver PHOTO_WIDTH×PHOTO_HEIGHT.
			output = await sharp(Buffer.from(encoded, 'base64'), { limitInputPixels: 40_000_000 })
				.resize(PHOTO_WIDTH, PHOTO_HEIGHT, { fit: 'cover' })
				.jpeg({ quality: 90 })
				.toBuffer();
		} catch {
			return failure('합성 이미지를 읽을 수 없어요. 다시 시도해 주세요.', 502);
		}
		return new Response(new Uint8Array(output), { headers: { ...headers, 'Content-Type': 'image/jpeg' } });
	} catch (error) {
		// 사용자가 요청을 취소한 경우는 오류로 보내지 않는다.
		if (!request.signal.aborted) Sentry.captureException(error);
		return failure(
			timeout.aborted
				? '합성 시간이 길어지고 있어요. 다시 시도해 주세요.'
				: '사진을 합성하지 못했어요. 다시 시도해 주세요.',
			timeout.aborted ? 504 : 502,
		);
	}
}
