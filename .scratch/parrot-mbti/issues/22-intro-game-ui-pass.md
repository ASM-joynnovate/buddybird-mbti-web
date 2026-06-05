# 22 · Intro 페이지 게임 UI 적용 패스

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

이슈 20(버튼)·21(카드) 체계를 인트로(`app/page.tsx`)에 적용하고, 숲 배경 바로 위
텍스트의 가독성을 처리하며, 인트로 진입 애니메이션을 Motion으로 리팩토링한다.

- 텍스트 가독성(장식보다 가독 우선):
    - 히어로 타이틀: 굵은 라운드 한글 친화 폰트 톤 유지, 딥 그린/웜 다크 텍스트 +
      필요 시 크림 스트로크나 소프트 섀도. 모바일 중앙 정렬, 충분한 line-height.
    - 서브타이틀/설명: 배경이 복잡한 지점은 반투명 크림/민트 패널 또는 스크림 위에.
    - 잎·파티클 위 얇은 저대비 텍스트, 다크 그린 위 순흑, 라임 위 흰색 금지.
- 진입 모션 리팩토링: `float-up`/`pop` keyframe + `.anim-float-up`/`.anim-pop`
  클래스 사용처 → `lib/motion/` `fadeUp` + `staggerContainer` variants로 교체.
  미사용 `floaty` keyframe 제거. 교체된 keyframe은 다른 사용처가 없으면 제거
  (남으면 보존하고 기록 — 전수 정리는 이슈 27).
- TypeShowcase: 활성 카드·peek 타일 스킨을 이슈 21 체계로. `showcase-card-fade`
  진입 페이드의 Motion 전환 여부는 구현 시 판단. **캐러셀 트랙 transform·
  silent reset·setInterval 자동 진행은 불변**(사용자 결정 · ADR-0005 유지).
- 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [ ] 인트로의 버튼/카드/칩이 이슈 20·21 체계를 사용한다.
- [ ] 배경 위 모든 텍스트가 360/375/390/414/430px에서 트리트먼트(콘트라스트/패널/스크림) 처리로 읽힌다.
- [ ] 인트로 진입이 Motion variants(stagger)로 동작하고 `float-up`·`floaty` 등 대체된 keyframe이 정리됐다.
- [ ] TypeShowcase 캐러셀의 자동 진행·무한 루프·탭 동작이 기존과 동일하다.
- [ ] reduced-motion에서 진입은 opacity-only, 캐러셀은 기존 비활성 동작 유지.
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과.

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`
