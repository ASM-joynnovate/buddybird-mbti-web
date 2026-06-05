# 26 · 배경 idle 모션(절제) + 배경 미세조정

Status: ready-for-agent

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

- [ ] 잎 부유/덩굴 sway/파티클 펄스가 절제된 강도로 동작하고 base/ground/rock은 정적이다.
- [ ] Server wrapper는 유지되고 모션 장식만 클라이언트 컴포넌트로 분리됐다.
- [ ] reduced-motion에서 배경이 완전히 정적이다.
- [ ] 장식이 360–430px 전 폭에서 주요 텍스트·버튼·입력을 가리지 않는다(필요 시 이동/축소/숨김).
- [ ] veil 강도 재점검 결과와 변경 여부가 기록됐다.
- [ ] 스크롤·인터랙션 성능 저하가 없다(transform/opacity만 애니메이션).
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과.

## Blocked by

- `.scratch/parrot-mbti/issues/19-motion-and-game-ui-tokens.md`
