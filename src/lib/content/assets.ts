import type { StaticImageData } from 'next/image';

import type { TypeCode } from '@/types/mbti';

import ENFJ from '@/public/parrots-mbti-charactor/ENFJ.png';
import ENFP from '@/public/parrots-mbti-charactor/ENFP.png';
import ENTJ from '@/public/parrots-mbti-charactor/ENTJ.png';
import ENTP from '@/public/parrots-mbti-charactor/ENTP.png';
import ESFJ from '@/public/parrots-mbti-charactor/ESFJ.png';
import ESFP from '@/public/parrots-mbti-charactor/ESFP.png';
import ESTJ from '@/public/parrots-mbti-charactor/ESTJ.png';
import ESTP from '@/public/parrots-mbti-charactor/ESTP.png';
import INFJ from '@/public/parrots-mbti-charactor/INFJ.png';
import INFP from '@/public/parrots-mbti-charactor/INFP.png';
import INTJ from '@/public/parrots-mbti-charactor/INTJ.png';
import INTP from '@/public/parrots-mbti-charactor/INTP.png';
import ISFJ from '@/public/parrots-mbti-charactor/ISFJ.png';
import ISFP from '@/public/parrots-mbti-charactor/ISFP.png';
import ISTJ from '@/public/parrots-mbti-charactor/ISTJ.png';
import ISTP from '@/public/parrots-mbti-charactor/ISTP.png';

import { TYPES } from './type-infos';

// static import라 URL에 content hash가 붙어 immutable 캐시를 받는다.
const PARROT_IMAGES: Readonly<Record<string, StaticImageData>> = {
	ENFJ,
	ENFP,
	ENTJ,
	ENTP,
	ESFJ,
	ESFP,
	ESTJ,
	ESTP,
	INFJ,
	INFP,
	INTJ,
	INTP,
	ISFJ,
	ISFP,
	ISTJ,
	ISTP,
};

export function parrotImage(type: TypeCode): StaticImageData | undefined {
	return PARROT_IMAGES[type];
}

export function parrotImageSrc(type: TypeCode): string | undefined {
	return PARROT_IMAGES[type]?.src;
}

export const CAROUSEL_TYPES: readonly TypeCode[] = Object.keys(TYPES) as TypeCode[];
