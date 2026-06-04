// Full 12-question set (issue #02). Three questions per axis in fixed order:
// EI (q1-q3), SN (q4-q6), TF (q7-q9), JP (q10-q12). Copy is finalized in issue #12.
//
// Invariant: choice 'a' = axis LEFT letter, choice 'b' = axis RIGHT letter. All-'a' -> ESTJ, all-'b' -> INFP. A deterministic E2E relies on this.

import type { Question } from '@/lib/mbti/types'

export const QUESTIONS: Question[] = [
    {
        id: 'q1',
        axis: 'EI',
        emoji: '👋',
        text: '낯선 사람이 다가오면 우리 새는?',
        choices: [
            { id: 'q1a', label: '먼저 다가가 관심을 보인다', axis: 'EI', letter: 'E' },
            { id: 'q1b', label: '경계하며 거리를 둔다', axis: 'EI', letter: 'I' },
        ],
    },
    {
        id: 'q2',
        axis: 'EI',
        emoji: '🔋',
        text: '하루 종일 혼자 두면 우리 새는?',
        choices: [
            { id: 'q2a', label: '시끄럽게 울며 관심을 요구한다', axis: 'EI', letter: 'E' },
            { id: 'q2b', label: '조용히 자기 놀이에 집중한다', axis: 'EI', letter: 'I' },
        ],
    },
    {
        id: 'q3',
        axis: 'EI',
        emoji: '🎉',
        text: '여러 마리가 함께 있을 때 우리 새는?',
        choices: [
            { id: 'q3a', label: '무리 한가운데서 어울려 논다', axis: 'EI', letter: 'E' },
            { id: 'q3b', label: '한쪽 구석에서 혼자 쉰다', axis: 'EI', letter: 'I' },
        ],
    },
    {
        id: 'q4',
        axis: 'SN',
        emoji: '🧸',
        text: '새 장난감을 주면 우리 새는?',
        choices: [
            { id: 'q4a', label: '직접 물고 만지며 확인한다', axis: 'SN', letter: 'S' },
            { id: 'q4b', label: '멀리서 한참 살피며 상상한다', axis: 'SN', letter: 'N' },
        ],
    },
    {
        id: 'q5',
        axis: 'SN',
        emoji: '🪑',
        text: '가구 배치가 바뀌면 우리 새는?',
        choices: [
            { id: 'q5a', label: '익숙한 자리부터 꼼꼼히 다시 확인한다', axis: 'SN', letter: 'S' },
            { id: 'q5b', label: '낯선 변화에 호기심부터 발동한다', axis: 'SN', letter: 'N' },
        ],
    },
    {
        id: 'q6',
        axis: 'SN',
        emoji: '🍪',
        text: '간식을 찾을 때 우리 새는?',
        choices: [
            { id: 'q6a', label: '늘 두던 자리를 정확히 기억한다', axis: 'SN', letter: 'S' },
            { id: 'q6b', label: '여기저기 새로운 곳을 뒤진다', axis: 'SN', letter: 'N' },
        ],
    },
    {
        id: 'q7',
        axis: 'TF',
        emoji: '⚖️',
        text: '간식을 못 받았을 때 우리 새는?',
        choices: [
            { id: 'q7a', label: '규칙을 따지듯 끈질기게 요구한다', axis: 'TF', letter: 'T' },
            { id: 'q7b', label: '서운한 듯 보호자에게 부빈다', axis: 'TF', letter: 'F' },
        ],
    },
    {
        id: 'q8',
        axis: 'TF',
        emoji: '💕',
        text: '보호자가 다른 새를 예뻐하면 우리 새는?',
        choices: [
            { id: 'q8a', label: '아랑곳없이 제 할 일을 한다', axis: 'TF', letter: 'T' },
            { id: 'q8b', label: '질투하며 보호자에게 다가온다', axis: 'TF', letter: 'F' },
        ],
    },
    {
        id: 'q9',
        axis: 'TF',
        emoji: '🎓',
        text: '훈련을 시킬 때 우리 새는?',
        choices: [
            { id: 'q9a', label: '보상 규칙을 파악해 또박또박 따른다', axis: 'TF', letter: 'T' },
            { id: 'q9b', label: '보호자 기분을 살피며 반응한다', axis: 'TF', letter: 'F' },
        ],
    },
    {
        id: 'q10',
        axis: 'JP',
        emoji: '🗓️',
        text: '하루 일과를 보면 우리 새는?',
        choices: [
            { id: 'q10a', label: '정해진 시간표대로 규칙적이다', axis: 'JP', letter: 'J' },
            { id: 'q10b', label: '그날 기분 따라 제멋대로다', axis: 'JP', letter: 'P' },
        ],
    },
    {
        id: 'q11',
        axis: 'JP',
        emoji: '🛏️',
        text: '둥지나 잠자리를 두고 우리 새는?',
        choices: [
            { id: 'q11a', label: '늘 같은 자리를 깔끔히 정돈한다', axis: 'JP', letter: 'J' },
            { id: 'q11b', label: '그때그때 마음에 드는 곳에 자리잡는다', axis: 'JP', letter: 'P' },
        ],
    },
    {
        id: 'q12',
        axis: 'JP',
        emoji: '🍽️',
        text: '먹이를 먹을 때 우리 새는?',
        choices: [
            { id: 'q12a', label: '정해진 양을 차례대로 먹는다', axis: 'JP', letter: 'J' },
            { id: 'q12b', label: '내키는 대로 골라 먹는다', axis: 'JP', letter: 'P' },
        ],
    },
]

export const QUESTION_COUNT = QUESTIONS.length
