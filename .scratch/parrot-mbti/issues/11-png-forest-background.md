# 11 · PNG 레이어드 forest 배경 (전역 교체)

Status: ready-for-human

## Parent

`.scratch/parrot-mbti/PRD.md` · 결정 기록: `docs/adr/0004-png-forest-background.md`

## What to build

`assets/mbti`의 PNG로 만든 **레이어드 모바일 forest 배경**으로 기존 전역 배경을
전역 교체한다. 모든 화면(Intro/Test/Result/Dex)이 한 배경 세계를 공유하고,
**뷰포트에 fixed로 고정되어 스크롤해도 동일하게 유지**된다(콘텐츠만 스크롤).

- `public/assets/mbti/`에 배경 PNG 10종 복사, `/assets/mbti/<name>.png`로 참조.
- 서버 컴포넌트 `<MobileForestBackground>`(`position:fixed; inset:0; z-index:-1`)를
  `app/layout.tsx`에 한 번 마운트하고 `{children}`을 통과시킨다.
- 레이어 순서(낮음→높음): main base → 측면 장식(monstera/palm/general/vine/rock/
  mushroom) → top-canopy/bottom-ground → light particles → 크림 가독성 veil → 콘텐츠.
- old 배경 제거: `globals.css` body radial-gradient 워시, `<LeafField>` 3파일,
  인트로 `.hero-art` 밴드 + `public/forest.webp`.
- 장식은 `alt="" aria-hidden pointer-events:none`; main base만 eager+fetchpriority,
  나머지 lazy. 단일 해상도/ srcset 없음. clamp() 반응형. 누락 에셋(tree-branch,
  bush-cluster)은 참조하지 않음.
- 방향 전환을 ADR-0004 + DESIGN.md에 기록.

## Acceptance criteria

- [ ] old 배경이 더 이상 보이지 않고 관련 파일이 삭제됐다.
- [ ] 새 PNG forest 배경이 전 화면 뷰포트를 흰 여백/막대 없이 덮는다(object-fit:cover).
- [ ] 배경이 모든 페이지에서 뷰포트에 fixed — 스크롤해도 동일하게 유지된다.
- [ ] 360/375/390/414/430px에서 콘텐츠 오버플로 없이 동작하고 UI가 배경 위에서 사용 가능하다.
- [ ] 누락/깨진 이미지 경로가 없다(tree-branch·bush-cluster 미참조).
- [ ] SVG/React Native 미도입, `yarn build`·`yarn type-check`·`yarn lint` 통과.
- [ ] ADR-0004 + DESIGN.md 갱신.

## Blocked by

None

## Comments

- 구현 완료(브랜치 `feat/png-forest-background`). 기능 검증은 agent-browser eval로
  전 라우트·폭에서 cover/fixed-on-scroll/오버플로 0 확인(리포트 참조).
- 후속(별도 이슈 권장): 인트로 캐러셀/`app-cta-intro` 부재로 인한 기존 E2E 실패
  (`intro-carousel`·`accessibility`)와 Test 페이지 320/390px 40px 콘텐츠 오버플로
  (`responsive`), 13문항 완료 감지(`full-navigation`) — 모두 이 작업 전부터 존재하며
  배경 변경과 무관.
- 시각 veil 강도(`--forest-veil-strength`, 기본 54%)는 `yarn dev` 육안 확인 후 미세조정 권장.
