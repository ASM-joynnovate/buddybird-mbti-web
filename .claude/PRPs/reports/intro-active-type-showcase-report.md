# Implementation Report: 인트로 활성 유형 쇼케이스

## Summary

홈 인트로의 정적 `peek-row`를 **활성 유형 카드 + 중앙 고정 무한 자동전환 peek 캐러셀**로
교체했다. 둘은 단일 클라이언트 컴포넌트(`components/type-showcase.tsx`)가 하나의 활성
인덱스를 소유해 항상 같은 유형을 가리킨다. 이슈 14 → 15 → 16을 각각 수직 슬라이스 =
하나의 커밋으로 직렬 구현하고, 17(문서)은 별도 커밋으로 마무리했다.

브랜치: `feat/intro-active-type-showcase` (base: `feat/png-forest-background`)

## Tasks Completed

| # | 이슈 | 커밋 | 상태 |
|---|---|---|---|
| 14 | 활성 유형 카드 | `b99b62b` | done |
| 15 | 중앙 고정 무한 peek 캐러셀 + 동기화 | `01df5fc` | done |
| 16 | peek 탭 + 접근성 | `579c554` | done |
| 17 | 도메인 문서(CONTEXT + ADR-0005) | `a660e3a` | done |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| type-check (`tsc --noEmit`) | Pass | 0 errors |
| lint (`eslint`) | Pass | 0 errors/warnings |
| build (`next build`) | Pass | 7/7 static pages |
| 시각/동작 (agent-browser) | Pass | 320/375/768 오버플로 없음 |

### agent-browser 검증 요점
- 동기화: 활성 카드 코드 = 중앙 peek 유형(INFJ=INFJ 등).
- 자동전환: 3초마다 +1.
- 무한루프: 프레임 단위 샘플 6창(~54s, 16유형 1사이클 + 무음 리셋 1회 포함)에서
  `is-active` 셀 수 항상 정확히 1(`min=max=1, zeroFrames=0`), W3에서 `silentJump` 발생.
- 탭: 우측 이웃 클릭 → 카드·peek·캡션 모두 해당 유형 동기(`synced:true`).
- 접근성: 네이티브 hover 시 정지·이탈 시 재개, `focusin` 시 정지, reduced-motion에서
  트랙/peek 트랜지션 `0s`·자동전환 정지(코드 5초 불변), 버튼·`aria-pressed`·라벨·
  `aria-live=polite` 캡션 확인.

## Deviations from Plan

1. **카드 외곽 3:2 폐기 (사용자 지시)**: 프로토타입의 3:2 고정이 폰에서 세로로 너무 길어,
   `aspect-ratio:3/2`를 제거하고 카드 높이를 콘텐츠(1:1 타일 vs 우측 텍스트 중 큰 쪽)에
   맞춘 콤팩트 밴드로 변경. 1:1 타일은 `max-width:104px`로 캡. 5:9 컬럼·구성은 유지.
   ADR-0005 Consequences·CONTEXT.md에 반영.

2. **peek 이미지 eager 범위**: 계획의 `loading={p<len?'eager':'lazy'}` 대신 초기 가시
   윈도(`Math.abs(p-len)<=3`)만 eager로 조정(초기 중앙 사본이 화면에 보이므로 더 정확).

## Issues Encountered & Resolved

- **무한루프 중앙 강조 소실(중대 결함, 수정)**: peek 타일의 `opacity`/`transform`
  transition의 `transitionend`가 트랙 핸들러로 버블링되어 한 슬라이드에 reset이 여러 번
  발화 → stale `pos`로 가드를 중복 통과해 `pos`가 음수로 오버슈트, 중앙 강조가 ~32%
  프레임에서 사라짐. 핸들러에 `event.target===event.currentTarget &&
  propertyName==='transform'` 가드를 추가해 해소(프레임 샘플 zeroFrames 77 → 0).

- **agent-browser 세션 행(hang)**: 스크린샷 명령이 한 번 멈춰 데몬을 재시작(`pkill` +
  소켓/PID 정리 후 재오픈)해 복구. 스크린샷 경로 인자는 `./name.png` 형식으로 전달해야
  저장됨(단일 인자가 selector로 해석되는 케이스 회피).

## Pre-existing Finding (out of scope)

- `e2e/flows/intro-carousel.mjs`는 현재 인트로에 없는 `intro-carousel`/`carousel-prev|next`/
  `app-cta-intro` testid를 참조한다(이번 변경 이전부터 stale; 현재 페이지는 `TypeCarousel`을
  렌더하지 않음). 이번 작업이 새로 깨뜨린 것이 아니며, 검증은 계획대로 agent-browser로 수행.
  별도 정리 권장.

## Files Changed

| File | Action |
|---|---|
| `components/type-showcase.tsx` | CREATED |
| `components/type-showcase.css` | CREATED |
| `app/page.tsx` | UPDATED (인라인 PeekRow 제거, TypeShowcase 배치, import 정리) |
| `app/page.css` | UPDATED (.peek-row/.peek 제거, hero-title 여백 재조정) |
| `CONTEXT.md` | UPDATED (인트로 용어) |
| `docs/adr/0005-intro-active-type-showcase.md` | CREATED |
| `.scratch/parrot-mbti/issues/14..17` | UPDATED (Status: done + Comments) |

## Next Steps

- [ ] `/code-review`로 변경 리뷰
- [ ] PR 생성(`/prp-pr`) — base `feat/png-forest-background` 또는 `main`
- [ ] 권장: stale한 `e2e/flows/intro-carousel.mjs` 정리(별도 이슈)
