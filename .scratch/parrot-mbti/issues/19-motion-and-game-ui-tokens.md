# 19 · Motion 도입 + 게임 UI 토큰 보강 + CTA 버튼 tracer

Status: done

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

전경 UI를 "코지 숲 모바일 게임" 스타일로 끌어올리는 작업(이슈 20–27)의 기반 슬라이스.
**Motion for React 도입 + 게임 UI 디자인 토큰 보강 + 인트로 메인 CTA 1개 리디자인**을
끝까지(설치→토큰→컴포넌트→빌드→e2e) 관통하는 tracer bullet.

- `yarn add motion` — 패키지는 `motion`, import는 `motion/react`
  (`framer-motion`이 아님. 사용자 결정).
- `lib/motion/` 공유 variants 모듈 신설: `fadeUp`, `staggerContainer`, `popIn`,
  `buttonTap`, `sheetSlideUp`, `floatingLeaf`, `gentleSway`, `particleFloat`.
  기존 토큰 `--ease-leaf`/`--ease-spring`(`app/globals.css`)과 시각적으로 일치하는
  easing/duration으로 정의. 기본 duration 0.2–0.45s, 장식 idle 3–7s.
- 게임 UI 토큰 보강: 아래 참고 팔레트를 기존 `@theme`/`:root` 컨벤션에 통합
  (별도 `--bb-*` 병렬 네임스페이스를 둘지, 기존 `--color-*` 체계에 흡수할지는
  구현 시 판단하되 한 체계로 일관되게).
    - **CTA primary는 기존 벨 오렌지 `#e8772e` 유지** (사용자 결정 — ADR-0001의
      CTA 결정은 그대로). 그린 계열은 보조로만 도입.
    - 추가 토큰: 그린 액센트(#AFF729 계열/#518D00 딥/pressed), 서피스
      (cream #FFF8E3 · mint #EAFBD8 · green #DDF7B8), 텍스트(딥 그린 계열),
      소프트 그린 보더, 시맨틱(reward #FFD966 · warning #FFB84D · error #FF7B72 ·
      info #54C7D8), radius(button pill/card 24/panel 28/chip pill),
      raised-button·card·floating 섀도(검정 하드 섀도 금지, 숲 톤),
      motion duration(fast 160ms/base 260ms/slow 420ms).
- tracer: 인트로 메인 CTA 버튼 1개를 raised 게임 버튼(하단 깊이 섀도, pressed 시
  y+2·섀도 축소) + `whileTap={{ scale: 0.96 }}`으로 리디자인. `motion.button` 사용,
  "use client"는 해당 버튼 컴포넌트 최소 범위에만.
- reduced-motion: motion의 `useReducedMotion` 사용 규약을 variants 모듈에 정립.
  기존 `lib/hooks/use-reduced-motion.ts`와의 관계(교체 또는 공존)를 결정하고 기록.
- ADR-0006 작성: motion 패키지 채택 + 게임 UI 토큰 확장 + "오렌지 CTA 유지,
  그린은 보조 액센트" 결정(ADR-0001 개정이 아닌 보강임을 명시). `DESIGN.md` 갱신.
- 주의: AGENTS.md — 이 Next.js 버전(16.2.6)은 breaking change가 있으므로 구현 전
  `node_modules/next/dist/docs/` 관련 가이드 확인.

## Acceptance criteria

- [x] `motion` 패키지가 yarn으로 설치되고 `motion/react`에서 import한다(framer-motion 미사용).
- [x] `lib/motion/` variants 모듈이 존재하고 후속 이슈가 재사용 가능한 형태다.
- [x] 게임 UI 토큰이 기존 토큰 체계에 일관되게 통합됐고 CTA primary는 벨 오렌지를 유지한다.
- [x] 인트로 메인 CTA가 raised 게임 버튼 + `whileTap` 피드백으로 동작한다(터치 타깃 48px+).
- [x] reduced-motion 환경에서 탭 스케일 모션이 비활성화된다.
- [x] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과(신규 실패 0 — 아래 코멘트), 번들 영향 기록(예산은 사전 초과 — 아래 코멘트).
- [x] ADR-0006 + DESIGN.md 갱신.

## Blocked by

None - can start immediately

## Comments

- **구현 요약 (team-lead):** `motion@12.40.0` 설치, import는 `motion/react`.
  번들 컨벤션은 **LazyMotion + `m`** (사용자 결정): `components/motion-provider.tsx`
  (domAnimation, strict)를 `app/layout.tsx`에 마운트, 이후 전 컴포넌트는
  `m.*` 사용(`motion.*`은 dev에서 throw). 공유 variants는 `lib/motion/`
  (fadeUp/staggerContainer/popIn/fadeOnly/buttonTap/sheetSlideUp/floatingLeaf/
  gentleSway/particleFloat — easeLeaf/easeSpring·160/260/420ms를 CSS 토큰과 미러링).
- **reduced-motion 규약:** m.\* 렌더링 컴포넌트는 `motion/react`의
  `useReducedMotion` 사용(진입은 fadeOnly로 강등, whileTap/idle 루프는 드롭).
  비-Motion 오케스트레이션(캐러셀·테스트 타이밍)은 기존
  `lib/hooks/use-reduced-motion.ts` 유지 — 같은 미디어 쿼리라 불일치 없음 (ADR-0006).
- **토큰:** globals.css `@theme`에 라임 액센트(#AFF729/#518D00), 크림/민트/리프
  서피스, 딥 그린 잉크·소프트 보더, 시맨틱 4종, `--radius-panel` 28px, 숲 톤
  raised/card/floating 섀도, `--duration-fast/base/slow` 추가. CTA는 벨 오렌지 유지.
- **tracer:** 인트로 메인 CTA = `components/game-button.tsx`(m.button +
  buttonTap whileTap) + `.game-btn--primary`(하단 깊이 섀도, :active 섀도 축소,
  min-height 56px).
- **번들 (gzip, 랜딩 first-load JS):** 베이스라인 192.0KiB → LazyMotion 적용
  222.6KiB (**delta +31.3KiB**; full motion이었으면 +39.6KiB). **150kb 예산은
  motion 도입 전부터 프레임워크 청크(~149KiB)만으로 이미 초과** — 사전·구조적
  초과로 기록(사용자 확인), 재기준선 결정은 별도. 이슈 27에서 재측정.
- **e2e:** full-navigation이 Test→Result 전환의 Suspense fallback 구간을
  허용하지 않는 폴링 단언 레이스로 실패 → 플로우에 전환 유예 추가(사용자 승인,
  `e2e/flows/full-navigation.mjs`). intro-carousel·accessibility 2건은 사전
  드리프트(이슈 18 소관)로 이번 팀 작업에 편입(사용자 승인).
