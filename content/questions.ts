// Full 13-question set (behaviour-observation themes: 애착 / 활동 / 소통).
// Two choices per question, each weighting one or more axis letters by +1
// (symmetric multi-axis scoring, ADR-0003). A question's two choices cover the SAME
// axes with OPPOSITE letters, so it contributes +1 to each axis it touches no matter
// which side is picked.
//
// Axis-pair allocation (degree EI 7 · SN 7 · TF 7 · JP 5 — all odd ⇒ no ties):
//   EI-SN ×3 (q3,q4,q12)  EI-TF ×2 (q1,q10)  EI-JP ×2 (q6,q13)
//   SN-TF ×3 (q5,q8,q11)  SN-JP ×1 (q7)      TF-JP ×2 (q2,q9)
//
// Invariant: choice 'a' is always the first option, 'b' the second. Across the set,
// the 'a' letters win a majority on every axis (E/S/T/J), so all-'a' -> ESTJ and
// all-'b' -> INFP. A deterministic E2E relies on these anchors.
//
// Choice copy carries a display split alongside the canonical `label`:
// `hook` (the short punch line — 대사/의성어/별명) and `body` (the behavioural
// description). `label` stays the full sentence for aria/analytics. Hooks marked
// "drafted by AI" were not part of the original copy and await copy review.

import type { Question } from '@/lib/mbti/types'

export const QUESTIONS: Question[] = [
    {
        id: 'q1',
        emoji: '🚪',
        text: '집사가 외출하려고 현관에서 신발을 신을 때, 우리 앵무새의 반응은?',
        choices: [
            {
                id: 'q1a',
                label: '"어디 가!! 나도 데려가!!" 새장 창살에 매달려 애절하게 짹짹거리며 분리불안 난리가 난다',
                hook: '"어디 가!! 나도 데려가!!"',
                body: '새장 창살에 매달려 애절하게 짹짹거리며 분리불안 난리가 난다',
                weights: { E: 1, F: 1 },
            },
            {
                id: 'q1b',
                label: '"올 때 해바라기씨나 사 와라." 쳐다도 안 보고 평온하게 제 깃털을 고르거나 밥을 먹는다',
                hook: '"올 때 해바라기씨나 사 와라."',
                body: '쳐다도 안 보고 평온하게 제 깃털을 고르거나 밥을 먹는다',
                weights: { I: 1, T: 1 },
            },
        ],
    },
    {
        id: 'q2',
        emoji: '✋',
        text: "집사가 다가가 조심스럽게 머리 '긁긁(스킨십)'을 시도하면?",
        choices: [
            {
                id: 'q2a',
                label: '기분이 내키면 냅다 고개부터 들이밀며 "더 긁어라 닝겐" 무한 쓰담을 요구하는 애교쟁이',
                hook: '"더 긁어라 닝겐"', // quote pulled to front
                body: '기분이 내키면 냅다 고개부터 들이밀며 무한 쓰담을 요구하는 애교쟁이',
                weights: { F: 1, P: 1 },
            },
            {
                id: 'q2b',
                label: '"어딜 함부로 만져!" 기분이 아니면 가차 없이 부리로 콱! 피의 응징(입질)을 내리는 까칠보스',
                hook: '"어딜 함부로 만져!"',
                body: '기분이 아니면 가차 없이 부리로 콱! 피의 응징(입질)을 내리는 까칠보스',
                weights: { T: 1, J: 1 },
            },
        ],
    },
    {
        id: 'q3',
        emoji: '📱',
        text: '집사가 폰을 들여다보며 자기한테 집중하지 않을 때?',
        choices: [
            {
                id: 'q3a',
                label: '"나랑 놀라고!!!" 화면 앞을 가로막고 손에 찰싹 붙어 온몸으로 방해하는 관종',
                hook: '"나랑 놀라고!!!"',
                body: '화면 앞을 가로막고 손에 찰싹 붙어 온몸으로 방해하는 관종',
                weights: { E: 1, S: 1 },
            },
            {
                id: 'q3b',
                label: '"바쁘냐? 그럼 난 잔다." 멀찍이서 제 장난감 갖고 놀거나 혼자 낮잠을 청한다',
                hook: '"바쁘냐? 그럼 난 잔다."',
                body: '멀찍이서 제 장난감 갖고 놀거나 혼자 낮잠을 청한다',
                weights: { I: 1, N: 1 },
            },
        ],
    },
    {
        id: 'q4',
        emoji: '✈️',
        text: '방 안에서 한 곳에서 다른 곳으로 이동할 때 우리 앵무새의 주특기는?',
        choices: [
            {
                id: 'q4a',
                label: "슝~ 푸드덕! 무조건 날개를 쫙 펴고 방 안을 가로지르는 날렵한 '탑건' 스타일",
                hook: '슝~ 푸드덕!',
                body: "무조건 날개를 쫙 펴고 방 안을 가로지르는 날렵한 '탑건' 스타일",
                weights: { E: 1, N: 1 },
            },
            {
                id: 'q4b',
                label: "뽈뽈뽈… 두 발로 바닥을 열심히 걸어 다니는 야무진 '뚜벅이' 스타일",
                hook: '뽈뽈뽈…',
                body: "두 발로 바닥을 열심히 걸어 다니는 야무진 '뚜벅이' 스타일",
                weights: { I: 1, S: 1 },
            },
        ],
    },
    {
        id: 'q5',
        emoji: '💥',
        text: '집사가 한눈판 사이, 우리 앵무새가 가장 많이 치는 대형 사고는?',
        choices: [
            {
                id: 'q5a',
                label: '벽지 뜯기, 책 갉아먹기, 키보드 자판 쏙쏙 뽑기… 눈에 띄는 건 다 분해하는 거침없는 파괴왕',
                hook: '거침없는 파괴왕', // hook drafted by AI — copy review pending
                body: '벽지 뜯기, 책 갉아먹기, 키보드 자판 쏙쏙 뽑기… 눈에 띄는 건 다 분해한다',
                weights: { S: 1, T: 1 },
            },
            {
                id: 'q5b',
                label: '사고는 무슨~ 얌전히 자기 장난감이랑 놀거나 거울 보며 자기 얼굴을 감상하는 몽상가',
                hook: '사고는 무슨~',
                body: '얌전히 자기 장난감이랑 놀거나 거울 보며 자기 얼굴을 감상하는 몽상가',
                weights: { N: 1, F: 1 },
            },
        ],
    },
    {
        id: 'q6',
        emoji: '🚿',
        text: '싱크대나 화장실에서 콸콸콸~ 물소리가 들릴 때 반응은?',
        choices: [
            {
                id: 'q6a',
                label: '"나도 씻을래!!" 물만 보면 텐션이 올라 냅다 뛰어들어 깃털을 적시는 워터파크 매니아',
                hook: '"나도 씻을래!!"',
                body: '물만 보면 텐션이 올라 냅다 뛰어들어 깃털을 적시는 워터파크 매니아',
                weights: { E: 1, P: 1 },
            },
            {
                id: 'q6b',
                label: '전용 목욕통을 대령하거나 곱게 분무해 줘야만 우아하게 씻고, 아니면 물 튀길라 멀찍이 도망',
                hook: '목욕도 격식 있게', // hook drafted by AI — copy review pending
                body: '전용 목욕통을 대령하거나 곱게 분무해 줘야만 우아하게 씻고, 아니면 물 튀길라 멀찍이 도망',
                weights: { I: 1, J: 1 },
            },
        ],
    },
    {
        id: 'q7',
        emoji: '😌',
        text: '배도 부르고 집도 조용해진 평화로운 시간, 우리 앵이의 모습은?',
        choices: [
            {
                id: 'q7a',
                label: '깃털을 찐빵처럼 빵빵하게 부풀리고 한쪽 발을 몸통에 쏙 숨긴 채 휴식 모드',
                hook: '찐빵 모드 ON',
                body: '깃털을 찐빵처럼 빵빵하게 부풀리고 한쪽 발을 몸통에 쏙 숨긴 채 휴식 모드',
                weights: { S: 1, J: 1 },
            },
            {
                id: 'q7b',
                label: '갑자기 새로운 장난감이나 구석을 탐색하러 가거나, 기분 따라 노래·춤·수다를 시작한다',
                hook: '기분 따라 탐험 시작', // hook drafted by AI — copy review pending
                body: '갑자기 새로운 장난감이나 구석을 탐색하러 가거나, 기분 따라 노래·춤·수다를 시작한다',
                weights: { N: 1, P: 1 },
            },
        ],
    },
    {
        id: 'q8',
        emoji: '😱',
        text: "우리 앵무새가 가끔 보여주는 '어이없는 쫄보' 모먼트는?",
        choices: [
            {
                id: 'q8a',
                label: '색깔 옷·처음 본 과일·안경 같은 "대체 저걸 왜 무서워해?" 싶은 것에 기겁하는 4차원 쫄보',
                hook: '4차원 쫄보', // hook drafted by AI — copy review pending
                body: '색깔 옷·처음 본 과일·안경 같은 "대체 저걸 왜 무서워해?" 싶은 것에 기겁한다',
                weights: { N: 1, F: 1 },
            },
            {
                id: 'q8b',
                label: '쫄보? 그게 뭔데. 제 몸집 100배인 강아지·청소기 앞에서도 깡패처럼 덤비는 노빠꾸 전투기',
                hook: '쫄보? 그게 뭔데.',
                body: '제 몸집 100배인 강아지·청소기 앞에서도 깡패처럼 덤비는 노빠꾸 전투기',
                weights: { S: 1, T: 1 },
            },
        ],
    },
    {
        id: 'q9',
        emoji: '💩',
        text: "빼입은 새 옷 위에 시원하게 '응가'를 발사한 뒤 녀석의 태도는?",
        choices: [
            {
                id: 'q9a',
                label: '"어쩌라고? 치워라 닝겐." 아무 일 없었다는 듯 당당하게 제 깃털을 고르는 강철 멘탈',
                hook: '"어쩌라고? 치워라 닝겐."',
                body: '아무 일 없었다는 듯 당당하게 제 깃털을 고르는 강철 멘탈',
                weights: { T: 1, J: 1 },
            },
            {
                id: 'q9b',
                label: '집사가 소리치니 오히려 재밌다고 위아래로 헤드뱅잉하거나 슬쩍 눈치 보며 푸드덕 도망',
                hook: '오히려 신남', // hook drafted by AI — copy review pending
                body: '집사가 소리치니 재밌다고 위아래로 헤드뱅잉하거나 슬쩍 눈치 보며 푸드덕 도망',
                weights: { F: 1, P: 1 },
            },
        ],
    },
    {
        id: 'q10',
        emoji: '📢',
        text: '마음에 안 드는 상황(안 꺼내준다, 간식 안 준다)이 닥쳤을 때?',
        choices: [
            {
                id: 'q10a',
                label: '"당장 문 열어라악!!!" 동네가 떠나가라 고래고래 샤우팅하며 악성 민원을 폭주시킨다',
                hook: '"당장 문 열어라악!!!"',
                body: '동네가 떠나가라 고래고래 샤우팅하며 악성 민원을 폭주시킨다',
                weights: { E: 1, T: 1 },
            },
            {
                id: 'q10b',
                label: '꿍얼꿍얼… 투덜투덜… 자기만의 외계어로 쉼 없이 혼잣말하며 조용히 삐쳐 불만을 표출',
                hook: '꿍얼꿍얼… 투덜투덜…',
                body: '자기만의 외계어로 쉼 없이 혼잣말하며 조용히 삐쳐 불만을 표출',
                weights: { I: 1, F: 1 },
            },
        ],
    },
    {
        id: 'q11',
        emoji: '🍪',
        text: '집사가 간식 봉지를 부스럭거리는 소리를 냈을 때 텐션은?',
        choices: [
            {
                id: 'q11a',
                label: '눈이 뒤집혀서 봉지 소리만 나도 이미 날아와 대기 중! 식탐 1티어 뚱짹이',
                hook: '식탐 1티어 뚱짹이', // hook drafted by AI — copy review pending
                body: '눈이 뒤집혀서 봉지 소리만 나도 이미 날아와 대기 중!',
                weights: { S: 1, T: 1 },
            },
            {
                id: 'q11b',
                label: '"오, 그거 뭐야?" 한입 먹어보고 아니면 퉤, 먹는 것보다 노는 게 더 좋은 소식좌',
                hook: '"오, 그거 뭐야?"',
                body: '한입 먹어보고 아니면 퉤, 먹는 것보다 노는 게 더 좋은 소식좌',
                weights: { N: 1, F: 1 },
            },
        ],
    },
    {
        id: 'q12',
        emoji: '🎤',
        text: '사람들을 놀라게 하는 우리 앵무새의 필살기(개인기)가 있다면?',
        choices: [
            {
                id: 'q12a',
                label: '"안녕! 밥 줘!" 말을 따라 하거나 빙글 돌기·하이파이브로 관중 앞에서 폼 나게 뽐내는 엔터테이너',
                hook: '"안녕! 밥 줘!"',
                body: '말을 따라 하거나 빙글 돌기·하이파이브로 관중 앞에서 폼 나게 뽐내는 엔터테이너',
                weights: { E: 1, S: 1 },
            },
            {
                id: 'q12b',
                label: '남들 볼 땐 절대 안 하고 혼자 있을 때만 꿍얼꿍얼 연습하거나, 존재 자체가 특기인 숨 쉬는 솜뭉치',
                hook: '숨 쉬는 솜뭉치', // hook drafted by AI — copy review pending
                body: '남들 볼 땐 절대 안 하고 혼자 있을 때만 꿍얼꿍얼 연습하는 수줍은 타입',
                weights: { I: 1, N: 1 },
            },
        ],
    },
    {
        id: 'q13',
        emoji: '☀️',
        text: '우리 앵무새의 아침 기상과 수면 패턴은?',
        choices: [
            {
                id: 'q13a',
                label: '해 뜨자마자 "아침이다!!! 다들 일어나!!!" 알람시계처럼 우렁차게 울어대는 얼리버드',
                hook: '"아침이다!!! 다들 일어나!!!"',
                body: '해 뜨자마자 알람시계처럼 우렁차게 울어대는 얼리버드',
                weights: { E: 1, J: 1 },
            },
            {
                id: 'q13b',
                label: '암막 천을 걷어줘도 "5분만 더…" 꾸벅꾸벅 졸거나, 집사 기척이 나야 그제야 부스럭대는 잠만보',
                hook: '"5분만 더…"',
                body: '암막 천을 걷어줘도 꾸벅꾸벅 졸거나, 집사 기척이 나야 그제야 부스럭대는 잠만보',
                weights: { I: 1, P: 1 },
            },
        ],
    },
]

export const QUESTION_COUNT = QUESTIONS.length
