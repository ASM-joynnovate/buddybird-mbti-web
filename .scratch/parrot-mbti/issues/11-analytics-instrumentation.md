# 11 · 분석 이벤트 계측

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

바이럴 퍼널을 측정하기 위한 **클라이언트 사이드 이벤트 계측**. 백엔드는 만들지 않는다.

- 퍼널 핵심 이벤트를 발행한다: 테스트 시작, 문항별 응답, 완료(유형 도출), 사진 첨부, 공유 성공/폴백, App CTA 클릭.
- 이벤트는 **주입형 어댑터**를 통해 발행한다. 구체 도구(GA4/Amplitude 등)는 미확정이므로, 기본은 스텁/콘솔 어댑터로 두고 실제 도구 연결은 어댑터 교체로 가능하게 한다(이벤트 스키마를 먼저 확정).
- 이벤트가 사용자 플로우의 올바른 시점에 정확한 페이로드로 발행되어야 한다.

## Acceptance criteria

- [ ] 정의된 퍼널 이벤트가 각 시점에 발행된다(시작·문항별·완료·사진첨부·공유·CTA클릭).
- [ ] 이벤트 스키마가 정의되고, 도구는 어댑터 교체로 주입된다(기본 스텁).
- [ ] 트래킹 백엔드는 만들지 않는다(이벤트 발행까지만).
- [ ] agent-browser E2E에서 어댑터를 가로채 플로우 구동 시 기대 이벤트/페이로드가 발행됨을 확인.

## Blocked by

- 04 (`04-test-question-page.md`)
- 07 (`07-result-report-page.md`)
- 09 (`09-result-card-share.md`)

## Comments

- 구현 완료 (branch `feat/parrot-mbti-foundation`). photo_attached·share_success·share_fallback·app_cta_click 발행 배선(스키마 불변), `e2e/flows/funnel-events.mjs`로 검증. 검증: `yarn type-check && yarn lint && yarn build && yarn e2e:run` 전부 통과.
