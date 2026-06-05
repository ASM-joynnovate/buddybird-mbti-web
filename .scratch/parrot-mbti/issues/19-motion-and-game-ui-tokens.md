# 19 · Motion 도입 + 게임 UI 토큰 보강 + CTA 버튼 tracer

Status: ready-for-agent

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

- [ ] `motion` 패키지가 yarn으로 설치되고 `motion/react`에서 import한다(framer-motion 미사용).
- [ ] `lib/motion/` variants 모듈이 존재하고 후속 이슈가 재사용 가능한 형태다.
- [ ] 게임 UI 토큰이 기존 토큰 체계에 일관되게 통합됐고 CTA primary는 벨 오렌지를 유지한다.
- [ ] 인트로 메인 CTA가 raised 게임 버튼 + `whileTap` 피드백으로 동작한다(터치 타깃 48px+).
- [ ] reduced-motion 환경에서 탭 스케일 모션이 비활성화된다.
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과, 번들 영향 기록(랜딩 JS < 150kb gzip 예산 내).
- [ ] ADR-0006 + DESIGN.md 갱신.

## Blocked by

None - can start immediately
