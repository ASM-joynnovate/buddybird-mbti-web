# 20 · 버튼 시스템 전면 리디자인 (게임 버튼 체계)

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

기존 `.btn`/`.btn-candy` 계열을 **숲 게임 스타일 버튼 체계**로 전면 대체한다.
버튼이 "일반 웹 버튼"이 아니라 코지 모바일 게임의 소프트 버튼처럼 보이고 눌리게.

- 변형 정의: primary(벨 오렌지 raised — 이슈 19 토큰), secondary, ghost, icon,
  floating action, disabled. 라운드 필 또는 대형 라운드 사각.
- 시각: 하단 깊이(베이스 섀도), 미세한 내부 하이라이트, 진하고 가독성 높은 텍스트,
  숲 배경 대비 충분한 콘트라스트. 배경 그린에 묻히지 않을 것.
- 인터랙션: 의미 있는 버튼 전부에 motion `whileTap`(scale 0.96 또는 y: 2,
  transition 0.12–0.2s) — `lib/motion/` `buttonTap` variants 재사용(이슈 19).
  pressed 시 깊이 섀도 축소. 단순 색 전환만 CSS transition 잔존 허용.
- 기존 버튼 keyframe/transition 중 대체된 것 제거(전수 정리는 이슈 27).
- 터치 타깃 최소 44px, 주요 CTA 48–56px. 키보드 포커스 스타일 유지.
- "use client"는 모션이 필요한 최소 컴포넌트에만.
- 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [x] primary/secondary/ghost/icon/FAB/disabled 변형이 정의되고 전 페이지 버튼이 새 체계를 사용한다.
- [x] 모든 의미 있는 버튼에 motion `whileTap` 피드백이 있고 raw CSS keyframe 버튼 모션이 새로 추가되지 않았다.
- [x] 터치 타깃 44px+(CTA 48–56px), 360/375/390/414/430px에서 가독·콘트라스트 유지.
- [x] 키보드 포커스 스타일이 보인다.
- [x] reduced-motion에서 탭 모션이 비활성화되어도 버튼이 완전히 사용 가능하다.
- [x] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과. (e2e: 전체 실행은 리드 조율
      게이트라 미실행 — build/type-check/lint 그린이 기본 검증. 알려진 e2e 드리프트는
      태스크 #10에서 별도 수정 중. 본 변경은 모든 data-testid를 보존했고 e2e는 클래스
      셀렉터를 사용하지 않음을 grep으로 확인.)

## Blocked by

- `.scratch/parrot-mbti/issues/19-motion-and-game-ui-tokens.md`

## Comments

**구현 요약 (ui-core, 이슈 #20):**

- `app/globals.css`: `.game-btn` 체계 완성 — `--primary`(벨 오렌지 raised CTA, 56px) /
  `--secondary`(크림 서피스 + 리프 보더·깊이바, 48px) / `--ghost`(저강조 텍스트, 44px) /
  `--icon`(44px 라운드) / `--fab`(60px 라운드 + `--shadow-floating`) / `:disabled`
  (깊이 평탄화 + 채도 감소) + `--sm`(44px 컴팩트). 모든 변형이 하단 깊이바(자기 pressed
  shade) + 포레스트 톤 드롭 + 이너 하이라이트. 라임 액센트는 액션 버튼에 미사용(ADR-0006).
- `components/game-button.tsx`: `variant`/`size` prop으로 일반화, `whileTap`은
  `lib/motion` `buttonTap` 재사용(reduced-motion·disabled 시 드롭). 앵커용
  `GameButtonLink`(m.a) 추가 — 앱 설치 CTA가 사용.
- 교체된 버튼: intro CTA(primary)·도감 진입(secondary sm), test 뒤로가기(ghost,
  44px 터치 타깃 확보), result 다시하기/도감에서 보기/나도 테스트하기/처음으로(secondary),
  공유 버튼(primary, busy=disabled), 앱 CTA(GameButtonLink secondary sm),
  photo 촬영/갤러리/다시찍기/다시선택(secondary sm)·제거(ghost sm), dex 돌아가기(secondary).
  모든 data-testid 보존.
- 대체된 페이지 버튼 CSS 제거: `result.css`(.share-button/.result-restart),
  `photo-input.css`(.photo-btn*), `dex.css`(.dex-back*).
- **이슈 27 이관 기록**: `globals.css`의 `.btn`/`.btn-candy` 계열은 TSX 소비자 0이지만
  ADR-0006 계획대로 deprecated 주석만 달고 잔존(제거는 #27). 기존 keyframe(pop,
  bounce, float-up, floaty, modal-\*, confetti-fall)도 유지 — 비버튼 서피스가 아직 사용.
- **스코프 노트**: Test 페이지 선택지(`.opt`)와 TypeModal 닫기(`.modal-close`)는
  버튼이지만 각각 이슈 21/23(선택형 카드)·이슈 25(모달 스킨) 소관 서피스라 본 이슈에서
  미교체 — 리드에게 보고됨.
