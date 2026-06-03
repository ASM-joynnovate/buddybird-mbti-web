# 작업 계획: 트로피컬 정글 UI 프로토타입 (이슈 #03 디자인 리뷰)

## 배경 (Context)

이슈 #03은 `DESIGN.md`에 비주얼 방향을 확정했다(트로피컬 데이라이트 정글, 녹색 베이스,
4 깃털-그룹 액센트, 유기적 잎 모양, Jua + Pretendard, "풀숲을 헤치고 이동하는" 문항 전환
모션, 단일 고정 테마). 이 방향은 문서로는 그럴듯하지만 **픽셀로는 미검증**이며, 이슈의
마지막 수용 기준이 **사람 디자인 리뷰**다. 이건 `/prototype`의 **UI 브랜치** 작업이다 —
디자인 시스템을 한 화면의 **radically different한 3가지 실행안**으로 렌더해 브라우저에서
전환하며 사용자가 이긴 실행안을 고르게 한다. 승자는 이후 실제 `@theme` 토큰 + 프리미티브로
흡수하고(별도 단계), 프로토타입은 삭제한다.

**답하려는 질문:** *이 정글 디자인 시스템의 어떤 픽셀 실행안이 핵심 서페이스에 맞는가?* —
**Test 문항 화면**에서 검증한다(프리미티브 밀도가 가장 높음: 버튼·선택지·카드·진행률·
포일리지·모션·타이포). 사용자와 확정한 범위: **Test 문항 화면만, 3변형.**

## 접근 — 전용 throwaway 라우트 (sub-shape B)

변형을 `/test`가 아니라 **새 `app/prototype/` 라우트**에 둔다.

**`/test`(원래 권장되는 sub-shape A)를 피하는 이유:** `useSearchParams()`는 서버
`<Suspense>`로 감싸지 않으면 **프로덕션 빌드 실패**("Missing Suspense boundary")를 일으킨다.
`yarn e2e`는 `yarn build`를 먼저 돌리므로 그 빌드 실패가 **E2E 게이트 전체를 무너뜨린다**.
게다가 `/test`는 그 자체가 `'use client'`라 자기 Suspense 경계를 만들 수 없다. 전용 라우트는
**구조적으로 E2E 안전**하고(E2E가 방문하지 않고 `/test`를 건드리지 않음) 삭제도 간단하다.
저장소에 이미 검증된 패턴이 있다 — `app/result/page.tsx`(서버 page → `<Suspense>` →
`useSearchParams`를 호출하는 client view).

변형은 **실제** `useTestProgress()`(프로바이더가 루트 레이아웃에 있어 `/prototype`도 감싸짐)와
`@/content`의 실제 `QUESTIONS`를 소비한다. 그래서 리뷰어가 실제 전환 모션과 함께 12문항을
끝까지 클릭해볼 수 있다. 마운트 시 `reset()`을 호출하고, 프로토타입은 `/result`로 이동하지 않는다.

## 파일 (전부 throwaway, `app/prototype/` 하위 콜로케이트)

1. **`app/prototype/page.tsx`** — *서버 컴포넌트*. `if (process.env.NODE_ENV === 'production') notFound()` 후 `return <Suspense fallback={…}><PrototypeView/></Suspense>`. 여기의 Suspense 경계가 빌드 규칙을 만족시킨다. `app/result/page.tsx` 형태를 복사.
2. **`app/prototype/prototype-view.tsx`** — `'use client'`. `useSearchParams()`를 호출하는 유일한 파일(경계 아래에 위치). `variant`(`A|B|C`, 기본 `A`) 읽고 검증; 마운트 시 `reset()`; `VariantA|B|C` 스위칭; `<PrototypeSwitcher current={variant}/>` 렌더. 여기서 `import './prototype.css'`.
3. **`app/prototype/prototype-variants.tsx`** — `'use client'`. `VariantA/B/C` export. 각 변형은 `useTestProgress()`(`currentIndex, answer, goBack, reset`) + `QUESTIONS`/`QUESTION_COUNT`로 현재 문항 렌더. 루트에 `className={\`proto-root \${…fontClass}\`}`. `currentIndex` 키 기반 CSS 클래스 토글로 풀숲 파팅 전환. E2E와 충돌하는 `data-testid` 금지(`test-root`, `choice-*`, `progress`, `result-*`, `start-button`, `restart-button`).
4. **`app/prototype/prototype-fonts.ts`** — 일반 모듈. `Jua({ weight:'400', subsets:['latin'] })` + `Noto_Sans_KR({ weight:['400','500','700'], subsets:['latin'], preload:false })`(Pretendard 파일 부재 → Noto Sans KR 대체). `.className` 문자열 export. **명시적 weight 필수**(비가변 폰트 → 누락 시 빌드 throw).
5. **`app/prototype/prototype.css`** — DESIGN.md 토큰을 **`.proto-root { --proto-… }` 스코프 CSS 변수**로(Tailwind `@theme`는 전역이라 사용 안 함). 잎 `clip-path` 클래스, 포일리지 레이어, 상속된 다크모드·전역 body 스타일을 덮는 불투명 `background`/`color`/`font`, 전환을 무력화하는 `@media (prefers-reduced-motion: reduce)` 블록.
6. **`components/prototype-switcher.tsx`** — `'use client'`, 공용 UI 디렉터리. 플로팅 하단 중앙 pill: `← | "B — Leaf-cut duel" | →`. `['A','B','C']` 순환(wrap), `router.replace(pathname + '?' + createQueryString('variant', next), { scroll:false })`(`next/navigation`의 `useRouter`/`usePathname`/`useSearchParams`). `keydown` ArrowLeft/Right 순환, **`document.activeElement`가 INPUT/TEXTAREA/`isContentEditable`이면 무시**; 언마운트 시 정리. 고대비라 디자인과 명확히 구분. 프로덕션에선 null(방어).
7. **`app/prototype/NOTES.md`** — 질문 + 3변형 설명 + 리뷰 답을 적을 `VERDICT: TBD`.

**프로덕션 해피패스 무수정:** `app/test/*`, `app/layout.tsx`, `app/globals.css`, `content/*`, `lib/*`, 기존 `components/*`. `app/prototype/` 밖 추가는 throwaway `components/prototype-switcher.tsx` 하나뿐.

## 3가지 변형 (구조적으로 구분 — anti-wallpaper)

- **A — 몰입 포일리지 터널:** 세로, 풀블리드 레이어드/패럴랙스 포일리지; 문항은 반투명 잎 카드 위에; 선택지 **세로 스택** 풀폭, 깃털 엣지; 진행률 vine 위→아래; 전환 = 잎이 세로로 갈라지며 전진.
- **B — 잎-컷 듀얼:** 진짜 **가로/대각 분할 화면** — 큰 유기적 잎 `clip-path` 패널 둘이 seam에서 만남, 각 패널이 곧 선택지(그룹 틴트); 문항은 seam 틈에; dot 진행률; 전환 = 두 잎이 양옆으로 갈라짐. (가로 분할이 A와의 혼동을 막는 핵심.)
- **C — 에디토리얼 트레일:** 차분·최고 가독성; 가로 진행률 **트레일 밴드**(스텝 마커); 큰 Jua 헤더 + 코너 포일리지 액센트 하나; 선택지는 **풀폭 플랫 리스트 행** + 깃털 액센트 바 + chevron, 하단 고정; 전환 = 부드러운 슬라이드, 포일리지 최소.

세 변형은 주 레이아웃 축(세로-몰입 / 가로-분할 / 리스트-에디토리얼), 인터랙션 모델, 장식 밀도에서 갈린다.

## 검증 (Verification)

- **비주얼:** `yarn dev`; `/prototype?variant=A|B|C` 열어 각각 다른 정글 문항 화면 확인; 전환과 함께 12문항 클릭.
- **스위처/URL:** `←/→` 클릭 + ArrowLeft/Right로 변형 순환, URL 갱신, **스크롤 점프 없음**, 새로고침 시 변형 유지; 텍스트 필드 포커스 중엔 화살표 무시.
- **reduced-motion:** `prefers-reduced-motion: reduce` 에뮬레이트 → 전환이 즉시로 약화.
- **프로덕션 숨김 + 빌드 점검:** `NODE_ENV=production yarn build && yarn start` → `/prototype`은 404; 빌드 통과는 Suspense 경계·폰트 weight 컴파일도 증명.
- **E2E 그린:** `yarn e2e` 무변경 통과(`/prototype` 미방문, `/test` 무수정).
- **스크린샷:** agent-browser 375px로 A/B/C 캡처해 리뷰 산출물로(`set viewport 375 812` → `open` → `screenshot`).
- **위생:** `yarn type-check` + `yarn lint` 클린(커밋 시 husky/lint-staged + no-`console.log` 실행됨).

## 정리 (승자 확정 시)

승자 + 근거를 `app/prototype/NOTES.md`에 기록(선택적으로 ADR 한 줄 보강). 이긴 실행안을 실제
`@theme` 토큰 + 프리미티브로 흡수한 뒤 `rm -rf app/prototype` + `components/prototype-switcher.tsx`
삭제. 그게 전체 영향 범위.

## 리스크 (Risks)

1. **`useSearchParams` 빌드 실패** — 전용 라우트 + 서버 Suspense 경계(파일 #1)로 완화. dev에선 안 드러나니 실제 `yarn build`로 확인.
2. **폰트 weight 누락** — Jua/Noto Sans KR는 명시적 `weight` 없으면 빌드 throw; body 폰트 `preload:false`로 한글 서브셋 preload 경고 회피.
3. **전역 스타일 침투** — `globals.css` 다크모드·body 폰트를 불투명 `.proto-root` 스타일로 덮어야 함.
4. **`@theme`는 전역** — 프로토타입 토큰은 절대 `@theme` 말고 스코프 CSS 변수로.
5. **A↔B 수렴** — B의 가로/대각 분할을 강제하지 않으면 3개가 스킨처럼 보임.
6. **공유 `useTestProgress` 싱글톤** — 마운트 시 `reset()`; `/result`로 push 안 함.
