// Placeholder presentation data for all 16 MBTI result types.
// Codes are assembled in axis order EI, SN, TF, JP. Names and reports are Korean
// placeholders; imageKey slugs are stable so real images can attach in issue #12.
// Entries are written as plain literal data, not computed at runtime.

import type { TypeCode, TypeInfo } from '@/lib/mbti/types'

export const TYPES: Record<TypeCode, TypeInfo> = {
    ESTJ: {
        code: 'ESTJ',
        name: '믿음직한 우두머리',
        report: '무리를 챙기며 규칙을 지키는 든든한 앵무새예요.',
        imageKey: 'parrot-estj',
    },
    ESTP: {
        code: 'ESTP',
        name: '겁 없는 모험가',
        report: '새로운 자극에 가장 먼저 뛰어드는 활동가예요.',
        imageKey: 'parrot-estp',
    },
    ESFJ: {
        code: 'ESFJ',
        name: '다정한 살림꾼',
        report: '가족의 기분을 살피며 곁을 지키는 앵무새예요.',
        imageKey: 'parrot-esfj',
    },
    ESFP: {
        code: 'ESFP',
        name: '흥 많은 무대체질',
        report: '관심을 즐기며 분위기를 띄우는 재롱둥이예요.',
        imageKey: 'parrot-esfp',
    },
    ENTJ: {
        code: 'ENTJ',
        name: '당당한 지휘자',
        report: '목표를 정하면 거침없이 밀어붙이는 앵무새예요.',
        imageKey: 'parrot-entj',
    },
    ENTP: {
        code: 'ENTP',
        name: '엉뚱한 발명가',
        report: '늘 새로운 장난을 궁리하는 호기심쟁이예요.',
        imageKey: 'parrot-entp',
    },
    ENFJ: {
        code: 'ENFJ',
        name: '따뜻한 리더',
        report: '주변을 다독이며 함께하길 좋아하는 앵무새예요.',
        imageKey: 'parrot-enfj',
    },
    ENFP: {
        code: 'ENFP',
        name: '활발한 모험가',
        report: '호기심 가득한 눈으로 세상을 탐험하는 앵무새예요.',
        imageKey: 'parrot-enfp',
    },
    ISTJ: {
        code: 'ISTJ',
        name: '한결같은 지킴이',
        report: '익숙한 일과를 묵묵히 지키는 차분한 앵무새예요.',
        imageKey: 'parrot-istj',
    },
    ISTP: {
        code: 'ISTP',
        name: '조용한 해결사',
        report: '혼자서 문제를 파고들어 풀어내는 앵무새예요.',
        imageKey: 'parrot-istp',
    },
    ISFJ: {
        code: 'ISFJ',
        name: '포근한 보호자',
        report: '조용히 곁을 지키며 마음을 나누는 앵무새예요.',
        imageKey: 'parrot-isfj',
    },
    ISFP: {
        code: 'ISFP',
        name: '느긋한 예술가',
        report: '자기만의 속도로 평화롭게 노니는 앵무새예요.',
        imageKey: 'parrot-isfp',
    },
    INTJ: {
        code: 'INTJ',
        name: '신중한 전략가',
        report: '한 발 물러나 곰곰이 계획을 세우는 앵무새예요.',
        imageKey: 'parrot-intj',
    },
    INTP: {
        code: 'INTP',
        name: '몽상가 탐구자',
        report: '혼자만의 생각에 깊이 잠기는 사색가 앵무새예요.',
        imageKey: 'parrot-intp',
    },
    INFJ: {
        code: 'INFJ',
        name: '섬세한 상담가',
        report: '조용히 마음을 헤아리는 깊이 있는 앵무새예요.',
        imageKey: 'parrot-infj',
    },
    INFP: {
        code: 'INFP',
        name: '순수한 몽상가',
        report: '여린 마음으로 자기 세계를 가꾸는 앵무새예요.',
        imageKey: 'parrot-infp',
    },
}

// Look up presentation data for a result code, returning null when unknown.
export function getTypeInfo(code: TypeCode): TypeInfo | null {
    return TYPES[code] ?? null
}
