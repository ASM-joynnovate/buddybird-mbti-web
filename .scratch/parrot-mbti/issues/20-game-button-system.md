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

- [ ] primary/secondary/ghost/icon/FAB/disabled 변형이 정의되고 전 페이지 버튼이 새 체계를 사용한다.
- [ ] 모든 의미 있는 버튼에 motion `whileTap` 피드백이 있고 raw CSS keyframe 버튼 모션이 새로 추가되지 않았다.
- [ ] 터치 타깃 44px+(CTA 48–56px), 360/375/390/414/430px에서 가독·콘트라스트 유지.
- [ ] 키보드 포커스 스타일이 보인다.
- [ ] reduced-motion에서 탭 모션이 비활성화되어도 버튼이 완전히 사용 가능하다.
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과.

## Blocked by

- `.scratch/parrot-mbti/issues/19-motion-and-game-ui-tokens.md`
