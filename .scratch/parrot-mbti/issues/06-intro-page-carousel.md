# 06 · 안내 페이지

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

서비스 소개와 진입을 담당하는 **안내(Intro) 페이지**. 디자인 시스템(03)을 준수한다.

- 화면 가운데에 16유형 앵무새 이미지를 **자동 진행 캐러셀**로 노출한다.
- 좌우로 직접 넘길 수 있는 **수동 컨트롤**을 제공한다.
- `prefers-reduced-motion` 시 자동 진행을 멈추고 수동 조작만 허용한다.
- **"테스트 시작하기" CTA를 중앙 하단**에 배치하고, 누르면 문항 페이지로 이동한다.
- 버디버드 **앱 유도(App CTA) 진입점**을 함께 노출한다(실제 링크는 10에서 연동, 여기서는 placeholder 상수).
- 모바일 세로 화면에서 레이아웃이 깨지지 않아야 한다.

## Acceptance criteria

- [ ] 16유형 이미지가 자동 슬라이드로 순환하고, 수동 좌우 이동도 된다.
- [ ] `prefers-reduced-motion`에서 자동 진행이 멈춘다.
- [ ] 중앙 하단 "테스트 시작하기"가 문항 페이지로 이동시킨다.
- [ ] 앱 CTA 진입점이 노출된다(placeholder 링크 상수).
- [ ] 모바일 우선 레이아웃이 깨지지 않는다.
- [ ] 디자인 시스템(03) 준수 + agent-browser E2E/스크린샷으로 확인.

## Blocked by

- 03 (`03-visual-design-direction.md`) — 디자인 게이트
