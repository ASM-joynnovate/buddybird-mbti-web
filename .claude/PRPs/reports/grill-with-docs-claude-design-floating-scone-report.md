# Implementation Report: 동화숲 월드 디자인 시스템 전환 (P1–P6, 비주얼 코어)

## Summary

버디버드 앵무새 MBTI 웹의 디자인 시스템을 "Tropical Jungle"(녹색) →
"동화숲 월드"(크림 양피지 + 잎새그린/로열퍼플/골드 악센트 + 벨오렌지 CTA)로 전환.
사용자 결정에 따라 **revert 없이 현재 브랜치(`feat/parrot-mbti-foundation`)에서
기존 synchronous-sphinx 모션/축 레이어 위에** 구현. 범위는 **P1–P6(비주얼 코어)**.
P7(9:16 공유카드 재작성)·P8(DESIGN.md/ADR)·전체 P9는 후속.

## Tasks Completed

| # | Phase | Status | Notes |
|---|---|---|---|
| P1 | 토큰/테마 | ✅ | `@theme` 값 동화숲 교체(키 유지) + `:root` 번들 토큰 별칭 + 양피지 body radial-gradient + word-break |
| P2 | 공용 컴포넌트 | ✅ | `.chip`/`.modal*` 번들 포팅 → globals.css, AxisBars는 토큰 리컬러로 자동 반영 |
| P4 | 데이터 모델 | ✅ | `TypeInfo`에 `colors`/`match` 추가, 16종 전사(data.jsx), `content/gradient.ts` 신규 |
| P3 | 화면 리스킨 | ✅ | 랜딩(배지·Jua 헤드라인·통계·도감버튼·forest 밴드 placeholder), Test 양피지화, Result 유형 그라데이션 히어로 |
| P5 | 궁합 칩 | ✅ | `match-chip.tsx`(→/dex?focus) + Result match 섹션 |
| P6 | 도감 라우트 | ✅ | `/dex`(Suspense)·`dex-view`(2/4열·?mine·?focus 자동오픈)·`type-modal`(dialog/aria-modal/Esc/포커스트랩)·`dex.css` |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Type Check | ✅ Pass | `yarn type-check` 0 errors |
| Lint | ✅ Pass | `yarn lint` 0 errors (set-state-in-effect → 렌더타임 상태조정 패턴으로 해결) |
| Build | ✅ Pass | `yarn build` 정적 export, `out/dex/index.html` 생성 확인 |
| Visual (agent-browser) | ✅ Pass | 320/390/768 — Intro·Test·Result(유형 그라데이션+궁합칩)·Dex 그리드(4열)·Dex 모달 |
| Overflow | ✅ Pass | 320px 4개 라우트 모두 horizontal overflow 없음 |
| A11y | ✅ Pass | 모달 role=dialog·aria-modal·aria-label·Esc·포커스 트랩/복원, 카드/칩/버튼 focus-visible |
| Reduced-motion | ✅ (코드) | 전 신규 표면에 `@media (prefers-reduced-motion: reduce)` 가드 |

## Files Changed

| File | Action |
|---|---|
| `app/globals.css` | UPDATE — @theme 값 + :root 별칭 + 양피지 body + .chip/.modal* |
| `app/page.tsx` + `app/page.css` | UPDATE — 랜딩 리스킨·통계·도감 버튼·forest 밴드 |
| `app/test/test.css` | UPDATE — 양피지 표면 톤 |
| `app/result/result-view.tsx` + `result.css` | UPDATE — 유형 그라데이션 히어로·궁합 칩·도감 버튼 |
| `components/axis-bars.css` | UPDATE — 따뜻한 그림자 틴트 (색은 토큰 자동) |
| `lib/mbti/types.ts` | UPDATE — TypeInfo += colors/match |
| `content/types.ts` | UPDATE — 16종 colors/match |
| `content/gradient.ts` | CREATE — typeGradient/typeColors |
| `content/index.ts` | UPDATE — gradient 재노출 |
| `components/match-chip.tsx` | CREATE |
| `components/type-modal.tsx` | CREATE |
| `app/dex/page.tsx` · `dex-view.tsx` · `dex.css` | CREATE |

## 홈 화면 재작업 (사용자 피드백 후속)

초기 랜딩이 디자인과 어긋난다는 피드백("claude design 그대로") → **번들 Landing을 충실 재현**:
번들에 없던 배지/리드문 제거, 가짜 그라데이션 밴드 → **실제 forest 일러스트**(2.7MB PNG를
`forest.webp` 1080w·167KB로 최적화), TypeCarousel → 번들 **PeekRow**(폭 적응 타일행),
번들 `.btn` 캔디 버튼 시스템 globals 이식, `.hero/.hero-art/.hero-stats/.bg-decor` 토큰 그대로
포팅. 단, 번들의 iOS 프레임·상단바·한/영 토글은 프로젝트 범위(웹네이티브·한국어)대로 제외.
320/390 오버플로우 없음, 빌드에 `forest.webp` 반영 확인.

## Deviations from Plan

- **forest 자산**: 번들 `forest.png`(2.7MB)를 `public/forest.webp`(1080w·167KB, <400KB 목표 충족)로
  최적화해 사용(원본 PNG는 1.5MB로 압축 안 돼 미사용). CSS `background-image`라 WebP 단독 사용.
- **AxisBars/Confetti/axes/URL인코딩 신규 포팅 안 함**: 사용자가 revert 취소·현재 브랜치
  유지를 택해, 기존 synchronous-sphinx 레이어를 토대로 재사용(계획대로 색만 리컬러).
- **dex 포커스 상태**: 계획의 로컬 setState 대신 렌더타임 상태조정(URL ?focus 동기화)으로
  구현 — lint 규칙(set-state-in-effect) 준수 + ?mine 하이라이트 보존.
- **carousel 유형 그라데이션**: 크림 토큰은 자동 반영. 카드별 유형 그라데이션은 후속 미세조정.

## Next Steps (후속 범위)

- [ ] P7 — 9:16 스토리 공유 카드 재작성 (card-layout/compose-card/share-button) + forest.png 최적화
- [ ] P8 — DESIGN.md v2 재작성(크림 규칙 반전) + ADR-0002(디자인 피벗)
- [ ] P9 — 펀넬 풀 주행·공유 카드 1080×1920 검증·키워드 칩 카피 사용자 확인
- [ ] 키워드(`keywords`) 3종 데이터 추가 — P7 공유카드와 함께
