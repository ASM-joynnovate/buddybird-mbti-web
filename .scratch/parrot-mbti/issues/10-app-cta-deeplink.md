# 10 · 앱 CTA 딥링크 연동

Status: ready-for-human

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

안내·결과 페이지의 앱 유도(App CTA)를 **실제 딥링크 서비스 + 스토어 링크**로 연동한다.
실제 링크 발급·측정 설정 등 사람 결정이 필요하므로 HITL.

- 딥링크 서비스(OneLink/Branch 등)를 통해 단일 링크가 iOS/Android로 자동 분기하고, 설치 후 컨텍스트(예: 유입 유형)를 전달하도록 한다.
- 06·07에 둔 placeholder CTA 상수를 실제 발급 링크로 교체한다(한 곳에서 관리되는 설정 상수).
- 기기/플랫폼 분기가 의도대로 동작하는지 확인한다.
- 어느 유형/단계에서 CTA 클릭·설치가 일어나는지 측정 가능하도록 연동(어트리뷰션).

## Acceptance criteria

- [ ] iOS/Android에서 CTA가 각 스토어로 올바르게 분기된다.
- [ ] 딥링크가 설치 후 컨텍스트를 전달한다(서비스 설정 확인).
- [ ] CTA 링크가 단일 설정 상수로 관리되어 한 곳에서 교체 가능하다.
- [ ] 어트리뷰션/측정이 설정되어 클릭·설치를 추적할 수 있다.
- [ ] 실제 링크·서비스 계정 확정 및 사람 검수 완료.

## Blocked by

- 06 (`06-intro-page-carousel.md`)
- 07 (`07-result-report-page.md`)
