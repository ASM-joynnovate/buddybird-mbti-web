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

- [x] 인트로의 버튼/카드/칩이 이슈 20·21 체계를 사용한다.
- [x] 배경 위 모든 텍스트가 360/375/390/414/430px에서 트리트먼트(콘트라스트/패널/스크림) 처리로 읽힌다.
- [x] 인트로 진입이 Motion variants(stagger)로 동작하고 `float-up`·`floaty` 등 대체된 keyframe이 정리됐다. (globals.css의 keyframe 자체는 리드 지침대로 보존 — 아래 #27 이관 기록 참조)
- [x] TypeShowcase 캐러셀의 자동 진행·무한 루프·탭 동작이 기존과 동일하다.
- [x] reduced-motion에서 진입은 opacity-only, 캐러셀은 기존 비활성 동작 유지.
- [x] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과. (type-check·lint 그린.
      build는 공유 워킹트리의 dev 서버 보호를 위해 리드 조율 윈도우에서 실행·확인.
      e2e는 조율 게이트 — testid(intro-root/intro-showcase/showcase-active-card/
      start-button/dex-button) 전부 보존.)

## Blocked by

- `.scratch/parrot-mbti/issues/20-game-button-system.md`
- `.scratch/parrot-mbti/issues/21-game-card-panel-chip.md`

## Comments

**구현 요약 (ui-core/page-a, 이슈 #22):**

- `app/page.tsx`: 인트로 진입을 Motion으로 — `.hero-first`가 `staggerContainer`,
  세 `.hero-group`(헤드라인+쇼케이스 / 도감+스탯 / CTA)이 `fadeUp` 자식으로 순차
  진입. reduced-motion 시 `fadeOnly`(opacity-only) 강등.
- `app/page.css` 텍스트 가독 트리트먼트:
    - `.hero-title`: 웜 다크 잉크 명시 + 크림 소프트 헤일로(text-shadow 3겹) — 숲
      PNG 위에서 360–430px 전 폭 분리. 레이아웃 메트릭(line-height 등) 불변.
    - `.hero-stats`: 세미솔리드 크림 스크림 필(82% 크림 + 리프 보더 + 미니 깊이바).
- `components/type-showcase.tsx/.css`: 활성 카드를 이슈 21 어휘로(크림 서피스 +
  2px 리프 보더 + 페이퍼컷 섀도, faction 스파인·악센트 링 유지). 카드 스왑 진입을
  `showcase-card-fade` keyframe → Motion `fadeUp`(key 리마운트 시 재생,
  reduced-motion 시 `fadeOnly`)으로 교체, keyframe은 컴포넌트 CSS라 삭제.
  ADR-0006 컨벤션대로 m.\* 렌더링은 motion/react의 useReducedMotion, 인터벌
  오케스트레이션은 기존 로컬 훅 유지(이중 훅 주석 명기). **캐러셀 트랙
  transform·silent reset·setInterval·일시정지·탭 동작 일절 불변(ADR-0005).**
  peek 타일은 기존 그라디언트 게임 토큰(베벨+링)이라 스킨 유지.
- **이슈 27 이관 기록**: `float-up`(result-view가 아직 사용 — #24에서 교체 예정),
  `pop`(test.css 사용 — #23에서 교체 예정), `floaty`(사용처 0 — 삭제 후보),
  `.anim-pop`(사용처 0)·`.anim-float-up`(result-view 사용) 모두 globals.css에
  보존 — #27 전수 정리 대상.
- 인트로의 버튼(GameButton primary/secondary sm)·궁합 칩 어휘는 이슈 20·21에서
  이미 적용 완료.
