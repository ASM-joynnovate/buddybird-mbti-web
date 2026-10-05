/* eslint-disable no-relative-import-paths/no-relative-import-paths -- Node scripts do not resolve Next.js aliases. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { AXIS_META } from '../src/lib/content/axes.ts';
import { QUESTIONS } from '../src/lib/content/questions.ts';
import { TYPES } from '../src/lib/content/type-infos.ts';
import { localeFromCountry } from '../src/lib/i18n/locale.ts';
import { SPECIES_LIST } from '../src/lib/mbti/species-weight.ts';

const en = JSON.parse(await readFile(new URL('../src/lib/i18n/en.json', import.meta.url), 'utf8'));
for (const country of ['KR', 'kr', ' KR ', null, '', 'XX', 'invalid']) {
	assert.equal(localeFromCountry(country), 'ko', `Country: ${country}`);
}
for (const country of ['US', 'JP', 'GB', 'DE', 'KP', 'us']) {
	assert.equal(localeFromCountry(country), 'en', `Country: ${country}`);
}
const copy = [
	...SPECIES_LIST,
	...Object.values(TYPES).flatMap(({ name, report, description }) => [name, report, description]),
	...QUESTIONS.flatMap(({ text, choices }) => [
		text,
		...choices.flatMap(({ label, hook, body }) => [label, hook, body]),
	]),
	...Object.values(AXIS_META).flatMap(({ left, right }) => [left.label, right.label]),
];
for (const text of copy) {
	assert.ok(en[text]?.trim(), `Missing translation: ${text}`);
	assert.doesNotMatch(en[text], /[가-힣]/, `Untranslated text: ${text}`);
}

// A few Korean labels equal their body text: their shared key must not repeat the hook.
for (const question of QUESTIONS) {
	for (const choice of question.choices) {
		assert.ok(!en[choice.body].startsWith(en[choice.hook] + ' '), `Repeated hook: ${choice.id}`);
	}
}

// Optional integration check against a running production server.
const base = process.argv[2];
if (base) {
	for (const [country, lang, title] of [
		['KR', 'ko', '앵BTI'],
		['US', 'en', 'Parrot MBTI'],
		['JP', 'en', 'Parrot MBTI'],
	]) {
		for (const path of ['/', '/species', '/test', '/result?t=ENFP']) {
			const response = await fetch(new URL(path, base), { headers: { 'CloudFront-Viewer-Country': country } });
			assert.equal(response.status, 200);
			assert.ok(response.headers.has('x-nextjs-prerender'), `${country} ${path}: prerendered`);
			const html = await response.text();
			assert.ok(html.includes(`<html lang="${lang}"`), `${country} ${path}: language`);
			assert.ok(html.includes(title), `${country} ${path}: title`);
		}
		// Crawlers get Korean on the locale-less URLs; English is indexed under `/en`.
		for (const [path, botLang, canonical] of [
			['/test', 'ko', '/test"'],
			['/en/test', 'en', '/en/test"'],
		]) {
			const html = await (
				await fetch(new URL(path, base), {
					headers: { 'CloudFront-Viewer-Country': country, 'User-Agent': 'Googlebot/2.1' },
				})
			).text();
			assert.ok(html.includes(`<html lang="${botLang}"`), `${country} bot ${path}: language`);
			assert.ok(
				html.includes(`rel="canonical" href="https://mbti.buddybird.xyz${canonical}`),
				`bot ${path}: canonical`,
			);
			assert.ok(html.includes('hrefLang="x-default"'), `bot ${path}: hreflang`);
		}
		const response = await fetch(new URL('/api/generate-image', base), {
			method: 'POST',
			headers: { 'CloudFront-Viewer-Country': country },
			body: new FormData(),
		});
		assert.equal(response.status, 400);
		const { message } = await response.json();
		assert.equal(/[가-힣]/.test(message), lang === 'ko', `${country}: API error language`);
	}
}
console.log(
	`i18n: country selection and ${copy.length} content translations passed${base ? '; prerendered server pages and API errors passed' : ''}`,
);
