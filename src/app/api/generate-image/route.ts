import { TYPES } from '@/lib/content/type-infos';
import { MAX_PHOTO_BYTES, photoError } from '@/lib/image-generation/input';
import { COSTUME_PROMPT } from '@/lib/image-generation/prompt';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 120;
const MAX_BODY_BYTES = MAX_PHOTO_BYTES + 64 * 1024;
const headers = { 'Cache-Control': 'no-store' };

function failure(message: string, status: number) {
	return Response.json({ message }, { status, headers });
}

export async function POST(request: Request) {
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
			// Decode fully, apply EXIF orientation and strip metadata without cropping.
			photo = await sharp(bytes, { limitInputPixels: 40_000_000 }).rotate().png().toBuffer();
		} catch {
			return failure('사진을 읽을 수 없어요. 다른 JPEG, PNG, WebP 사진을 선택해 주세요.', 400);
		}
		const apiKey = process.env.OPENROUTER_API_KEY;
		if (!apiKey) return failure('지금은 사진 합성을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.', 503);
		const reference = await readFile(path.join(process.cwd(), 'public', 'parrots-mbti-charactor', `${type}.png`));
		const upstream = await fetch('https://openrouter.ai/api/v1/images', {
			method: 'POST',
			headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
			signal,
			body: JSON.stringify({
				model: 'google/gemini-3.1-flash-lite-image',
				prompt: COSTUME_PROMPT,
				input_references: [photo, reference].map((image) => ({
					type: 'image_url',
					image_url: { url: `data:image/png;base64,${image.toString('base64')}` },
				})),
			}),
		});
		if (!upstream.ok)
			return failure(
				'사진을 합성하지 못했어요. 잠시 후 다시 시도해 주세요.',
				upstream.status === 429 ? 429 : 502,
			);
		const result = await upstream.json();
		const encoded = result?.data?.[0]?.b64_json;
		if (typeof encoded !== 'string' || !encoded || encoded.length > 40 * 1024 * 1024) {
			return failure('합성 이미지가 도착하지 않았어요. 다시 시도해 주세요.', 502);
		}
		const output = Buffer.from(encoded, 'base64');
		const metadata = await sharp(output, { limitInputPixels: 40_000_000 }).metadata();
		const mediaType = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }[metadata.format as string];
		if (!mediaType) return failure('합성 이미지를 읽을 수 없어요. 다시 시도해 주세요.', 502);
		return new Response(new Uint8Array(output), { headers: { ...headers, 'Content-Type': mediaType } });
	} catch {
		return failure(
			timeout.aborted
				? '합성 시간이 길어지고 있어요. 다시 시도해 주세요.'
				: '사진을 합성하지 못했어요. 다시 시도해 주세요.',
			timeout.aborted ? 504 : 502,
		);
	}
}
