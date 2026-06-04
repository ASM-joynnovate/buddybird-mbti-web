# Implementation Report: PNG 레이어드 Forest 배경 (전역 교체)

**Plan**: `~/.claude/plans/plan-keen-micali.md`
**Branch**: `feat/png-forest-background` (off `feat/parrot-mbti-foundation`)

## Summary

기존 전역 배경(`globals.css` body radial-gradient 워시 + `<LeafField>` SVG 잎 레이어)을
`assets/mbti`의 PNG로 만든 레이어드 모바일 forest 배경으로 전역 교체했다. 모든 화면이
한 배경 세계를 공유하고, `position:fixed`로 뷰포트에 고정되어 스크롤해도 유지된다.
인트로의 `.hero-art` forest 밴드와 `forest.webp`는 제거했다. 가독성은 크림 veil 레이어로
확보했고 방향 전환은 ADR-0004 + DESIGN.md에 기록했다.

## Assessment vs Reality

| Metric | Predicted | Actual |
|---|---|---|
| Complexity | Medium | Medium |
| Files Changed | ~13 | 13 (5 M, 4 D, 4 new + assets) |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | 브랜치 분기 | ✅ | `feat/png-forest-background` |
| 2 | 에셋 복사 (10 PNG) | ✅ | `public/assets/mbti/` |
| 3 | `MobileForestBackground` + CSS | ✅ | 서버 컴포넌트, fixed 레이어 + veil |
| 4 | layout 배선 | ✅ | LeafField 제거 → wrapper로 children 래핑 |
| 5 | old 배경 제거 | ✅ | body 워시·leaf-field 3파일·hero-art·forest.webp |
| 6 | ADR-0004 + DESIGN.md | ✅ | CONTEXT.md는 의도적 미변경(아래 Deviations) |
| 7 | 이슈 11 | ✅ | `.scratch/parrot-mbti/issues/11-*.md` |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Type Check | ✅ Pass | `yarn type-check` 클린 |
| Lint | ✅ Pass | `yarn lint` 클린 (img는 기존 컨벤션대로 eslint-disable) |
| Build | ✅ Pass | `yarn build` 정적 export 7 routes |
| E2E (regression) | ⚠️ 사전 존재 실패 외 회귀 0 | 아래 |
| Visual (agent-browser eval) | ✅ Pass | cover/fixed-on-scroll/오버플로0 전 라우트·폭 |

### E2E — baseline 대조로 회귀 0 확인

stash 후 baseline 빌드/E2E와 1:1 비교. 제 버전 == baseline (동일 실패 4건):

| Flow | baseline | 내 버전 | 판정 |
|---|---|---|---|
| full-navigation | FAIL (q14 progress) | FAIL (동일) | 사전 존재 (13문항 완료 감지) |
| known-answer-type | PASS | PASS | — |
| analytics-events | PASS | PASS | — |
| intro-carousel | FAIL (carousel 없음) | FAIL (동일) | 사전 존재 (인트로 재구성) |
| funnel-events | PASS | PASS | — |
| accessibility | FAIL (carousel group) | FAIL (동일) | 사전 존재 (인트로 재구성) |
| responsive | FAIL (test 320px +40px) | FAIL (동일) | 사전 존재 (test 콘텐츠) |

→ 4개 실패 모두 **이 작업 전부터 존재**하며 배경 변경과 무관(캐러셀/`app-cta-intro`
부재, 13문항 완료 감지, test 페이지 콘텐츠 오버플로). 별도 이슈로 처리 권장.

### Visual (agent-browser eval, port 4321 정적 서버)

| Route | Width | cover | fixed-on-scroll | content overflow | layers |
|---|---|---|---|---|---|
| Intro | 360 | ✓ | ✓ | 0 | 10 |
| Intro | 430 | ✓ | ✓ | 0 | 10 |
| Test | 390 | ✓ | ✓ | 40px(기존 콘텐츠, 배경 무관) | 10 |
| Result | 390 | ✓ | ✓ | 0 | 10 |
| Dex | 390 | ✓ | ✓ (실제 1090px 스크롤 중 고정) | 0 | 10 |

Test의 40px는 `q-card`/`opt`(`inForestBg:false`)에서 발생, forest 장식은 `overflow:hidden`
으로 클리핑되어 문서 스크롤폭 기여 0(overflowX가 40으로 장식 우측 443 미반영 확인).

## Files Changed

| File | Action |
|---|---|
| `components/mobile-forest-background.tsx` | CREATED |
| `components/mobile-forest-background.css` | CREATED |
| `docs/adr/0004-png-forest-background.md` | CREATED |
| `.scratch/parrot-mbti/issues/11-png-forest-background.md` | CREATED |
| `public/assets/mbti/*.png` (10) | CREATED |
| `app/layout.tsx` | UPDATED (LeafField → MobileForestBackground) |
| `app/globals.css` | UPDATED (body 워시 제거, 주석 갱신) |
| `app/page.tsx` | UPDATED (hero-art 제거) |
| `app/page.css` | UPDATED (.hero-art 제거, peek-row margin-top:auto) |
| `DESIGN.md` | UPDATED (Backdrop 항목) |
| `components/leaf-field.tsx`, `leaf-field.css`, `leaf-shapes.ts` | DELETED |
| `public/forest.webp` | DELETED |

## Deviations from Plan

- **CONTEXT.md 미변경**: 계획엔 갱신 대상으로 적었으나, CONTEXT.md는 도메인
  유비쿼터스 언어 전용 문서이고 배경은 프레젠테이션이라 추가 시 문서 패턴을 깨뜨린다.
  ADR-0004 + DESIGN.md가 충분히 커버 → 의도적으로 제외.
- **시각 스크린샷 산출 실패**: 이 환경의 agent-browser screenshot가 파일을 기록하지
  못해(데몬 제약), 시각 검증을 `eval` 기반 기하/스크롤/오버플로 측정으로 대체.
  기능 기준은 전부 충족. veil 강도(`--forest-veil-strength` 기본 54%) 미세조정은
  `yarn dev` 육안 후속 권장.

## Issues Encountered

- E2E 3~4개 실패 발견 → baseline 대조로 사전 존재(회귀 아님) 확정 후 진행.
- agent-browser screenshot 파일 미기록 → eval 측정으로 검증 경로 전환.

## Next Steps
- [ ] `yarn dev`로 veil 강도/장식 배치 육안 미세조정
- [ ] 사전 존재 E2E 실패(캐러셀·13문항 완료감지·test 오버플로)용 별도 이슈
- [ ] `/code-review` 후 `/prp-pr` 또는 커밋
- [ ] (선택) base PNG WebP 변형으로 LCP 최적화
