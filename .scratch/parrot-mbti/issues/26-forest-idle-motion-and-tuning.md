# 26 · 배경 idle 모션(절제) + 배경 미세조정

Status: in-review

## Parent

`.scratch/parrot-mbti/PRD.md` · 배경 자체: `docs/adr/0004-png-forest-background.md` (이슈 11에서 구현 완료)

## What to build

이미 구현된 PNG 숲 배경(`components/mobile-forest-background.tsx`)에 **절제된**
idle 모션을 더하고, 새 전경 UI(이슈 20–25) 기준으로 장식 배치·veil을 미세조정한다.
화면이 살아 있는 느낌은 UI 반응성이 우선 — 배경은 보조이며 과하면 안 된다.

- 컴포넌트 분리: `MobileForestBackground`는 Server Component 유지, 모션이 필요한
  장식 레이어만 클라이언트 `AnimatedForestDecorations`("use client")로 분리.
- idle 모션(`lib/motion/` variants 재사용, transform/opacity만, 3–7s,
  repeat Infinity + mirror):
    - monstera/palm 잎: 느린 y 부유 + 미세 회전(`floatingLeaf`)
    - vine: 잔잔한 sway(`gentleSway`)
    - light particles: opacity 펄스 + 미세 drift(`particleFloat`)
    - mushroom: 로드 시 1회 pop-in
    - canopy 거의 정적, ground/rock/**base는 정적 유지** — 풀스크린 PNG 연속
      애니메이션 금지. 큰 PNG 다수를 동시에 움직이지 않는다.
- 미세조정: decal 위치/크기/회전과 `--forest-veil-strength`(현재 54%)를 새 전경
  UI와의 겹침·가독 기준으로 재점검. 380px 미만에서 큰 측면 장식을 가장자리로
  이동/축소, 저우선 장식 숨김.
- `useReducedMotion` 시 연속 루프 전부 비활성(정적 렌더), pop-in은 opacity-only.
- 장식의 `alt=""`/`aria-hidden`/`pointer-events:none`/lazy 속성 유지.
- 참고: tree-branch·bush-cluster PNG는 에셋이 존재하지 않아 의도적으로 미사용
  (깨진 경로 금지). 에셋은 단일 해상도 — srcset 미구현, 추후 추가 가능한 구조 유지.
- 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [x] 잎 부유/덩굴 sway/파티클 펄스가 절제된 강도로 동작하고 base/ground/rock은 정적이다.
- [x] Server wrapper는 유지되고 모션 장식만 클라이언트 컴포넌트로 분리됐다.
- [x] reduced-motion에서 배경이 완전히 정적이다.
- [x] 장식이 360–430px 전 폭에서 주요 텍스트·버튼·입력을 가리지 않는다(필요 시 이동/축소/숨김).
- [x] veil 강도 재점검 결과와 변경 여부가 기록됐다.
- [x] 스크롤·인터랙션 성능 저하가 없다(transform/opacity만 애니메이션).
- [x] `yarn build`·`yarn type-check`·`yarn lint` 통과 (e2e 전체 그린은 이슈 18 작업에서 확인 — 아래 Comments 참조).

## Blocked by

- `.scratch/parrot-mbti/issues/19-motion-and-game-ui-tokens.md`

## Comments

**구현 요약 (forest, feat/game-ui-motion):**

- **분리**: `MobileForestBackground`는 Server Component 유지(base/canopy/ground/veil + 정적
  decal: general leaf·rock). 움직이는 장식만 신설 클라이언트 컴포넌트
  `components/animated-forest-decorations.tsx`로 분리 — `AnimatedForestDecals`
  (monstera/palm `floatingLeaf` 부유, vine `gentleSway`, mushroom `popIn` 1회) +
  `AnimatedForestParticles`(`particleFloat` opacity 펄스 + 미세 drift).
- **variants**: 전부 `lib/motion/` 공유 variants 재사용. 잎 두 장이 기계적으로 동기화되지
  않도록 `desync()` 헬퍼로 palm에 delay 1.7s/duration 6.4s, vine에 delay 0.9s를 준
  파생 복사본 사용(공유 변수는 불변, 3–7s 대역 유지). general leaf는 스펙 목록에 없어
  의도적으로 정적 유지(절제 우선).
- **CSS 구조 변경**: `.forest-decal`이 배치 transform(translate/rotate)을 갖는 래퍼가 되고
  Motion은 내부 `.forest-decal__img`만 애니메이션 — 두 transform이 같은 요소에서 충돌하지
  않음. vine은 `transform-origin: top center`(매달린 지점 기준 sway). particles는 ±12px
  overscan으로 drift 시 가장자리 노출 방지.
- **reduced-motion**: 모든 요소를 m.img로 유지한 채 정적 타깃으로 구동 — idle은 `rest` 포즈
  고정, mushroom은 `fadeOnlyEntrance`(scale 1 고정, opacity-only), particles는 정적
  `still`(opacity 0.55) 타깃. 이유: SSR 마크업에는 비-reduced 초기 인라인 스타일(popIn의
  scale(0.4) 등)이 박혀 있고 React는 hydration에서 style 불일치를 패치하지 않으므로, 일반
  `<img>`로 스왑하면 잔류 스타일이 남는다(검증 중 실제 재현: mushroom이 40% 크기로 고정,
  particles 0.35 고정). Motion이 요소를 계속 관리하게 해 SSR 잔류 스타일을 확실히 덮어쓴다.
  agent-browser `set media reduced-motion`으로 완전 정적(스냅샷 2회 동일·mushroom 풀사이즈
  opacity 1·particles 0.55) 확인.
- **MotionProvider 자체 래핑**: `app/layout.tsx`에서 `<MobileForestBackground>`가
  `<MotionProvider>` 바깥에 마운트되어 있어 배경의 m.\* 요소가 LazyMotion 컨텍스트를 못 받아
  조용히 정적으로 렌더되는 문제 발견(검증 중 실제 재현). 파일 경계상 layout.tsx 수정 불가 →
  두 장식 컴포넌트가 자체 `<MotionProvider>`로 감쌈(LazyMotion 중첩 안전, domAnimation은
  동일 정적 import라 번들 증가 없음). 추후 layout에서 MotionProvider를 최상위로 올리면 자체
  래핑은 제거 가능 — team-lead에 보고됨. → **후속 결정·완료**: 리드가 22ab364로
  `<MotionProvider>`를 `<MobileForestBackground>` 바깥(최상위)으로 올렸고, 그에 따라 장식
  컴포넌트의 자체 래핑은 제거됨(레이어링은 이제 layout의 provider 순서에 의존 — 컴포넌트
  주석에 load-bearing으로 명시).
- **veil 강도 재점검 결과: 54% 유지(변경 없음).** 이슈 20·21에서 전경이 불투명
  cream/mint 게임 패널로 바뀌어 본문 가독성이 카드 자체에서 확보되고, veil은 중앙 밴드의
  배경 톤다운 역할로 충분. intro(320/360/390/430)·test(360/390)·dex(390) 스크린샷에서
  헤드라인·문항·선택지·CTA 모두 가독 확인(`e2e/artifacts/issue-26/`). 380px 미만 기존 규칙
  (palm/monstera 축소, general 숨김)도 유지·재확인.
- **성능**: 애니메이션은 transform/opacity만, 풀스크린 PNG(base/canopy/ground)와 rock은
  정적. 동시 루프는 monstera·palm·vine·particles 4개(소형 decal 3 + 저불투명 글린트 시트)로
  절제 유지.
- **e2e**: build/type-check/lint 그린. e2e 전체 그린은 intro-carousel·accessibility 플로우
  노후화(이슈 18)와 묶여 있어, 같은 브랜치의 이슈 18 작업에서 `yarn e2e:run` 전 플로우
  그린으로 마감 확인 예정. → **확인 완료**: 이슈 18 마감에서 `yarn e2e:run` 7개 플로우
  2회 연속 전부 그린(accessibility의 img-alt 단언은 장식 배경의 alt="" + aria-hidden을
  올바르게 통과시키도록 갱신됨).
- **검증 인프라 노트**: 이 저장소는 `output: standalone`이라 `next start`로는 일부 라우트가
  500(client reference manifest invariant) — 검증/서빙은 e2e 하니스처럼
  `node .next/standalone/server.js` + public/static 복사로 해야 함. 또한 공유 워킹트리에서
  다른 에이전트의 `yarn build`가 실행 중 검증 서버의 `.next`를 지워 transient 500이 발생할
  수 있음(team-lead에 운영 규칙 제안됨).
