// Jua(디스플레이 폰트)를 소스에서 실제로 쓰는 글자만 담은 woff2 하나로 서브셋한다.
// Google Fonts는 한글을 조각 파일 수십 개로 나눠 내려줘서 첫 방문 때 폰트 요청이 많아진다.
//
//   node scripts/subset-display-font.mjs          서브셋 재생성
//   node scripts/subset-display-font.mjs --check  소스에 서브셋에 없는 글자가 있으면 실패
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import subsetFont from 'subset-font';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE_FONT = path.join(ROOT, 'assets/fonts/jua/Jua-Regular.ttf');
const OUT_FONT = path.join(ROOT, 'src/app/fonts/jua-subset.woff2');
const OUT_CHARS = path.join(ROOT, 'src/app/fonts/jua-subset.chars.txt');
const SCAN_DIR = path.join(ROOT, 'src');
const SCAN_EXT = new Set(['.ts', '.tsx', '.css', '.json', '.md']);

// 영문·숫자·기본 문장부호는 항상 포함한다.
const ASCII = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCodePoint(0x20 + i));

async function collectChars(dir, chars) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			await collectChars(full, chars);
		} else if (SCAN_EXT.has(path.extname(entry.name)) && full !== OUT_CHARS) {
			for (const ch of await readFile(full, 'utf8')) {
				if (ch.codePointAt(0) > 0x7e) chars.add(ch);
			}
		}
	}
	return chars;
}

const required = [...ASCII, ...[...(await collectChars(SCAN_DIR, new Set()))].sort()].join('');

if (process.argv.includes('--check')) {
	const existing = new Set(await readFile(OUT_CHARS, 'utf8'));
	const missing = [...required].filter((ch) => !existing.has(ch));
	if (missing.length > 0) {
		console.error(`jua-subset에 없는 글자 ${missing.length}개: ${missing.join('')}`);
		console.error('node scripts/subset-display-font.mjs 로 서브셋을 다시 생성하세요.');
		process.exit(1);
	}
	console.log('jua-subset: 소스의 모든 글자 포함');
} else {
	const subset = await subsetFont(await readFile(SOURCE_FONT), required, { targetFormat: 'woff2' });
	await writeFile(OUT_FONT, subset);
	await writeFile(OUT_CHARS, required);
	console.log(`jua-subset.woff2 ${(subset.length / 1024).toFixed(1)}KB, 글자 ${[...required].length}개`);
}
