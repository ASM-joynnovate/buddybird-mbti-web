# 07 · 결과 페이지 (리포트)

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

도출된 유형과 리포트를 보여주는 **결과(Result) 페이지**의 리포트 영역. 사진/카드/공유는
08·09에서 얹는다. 디자인 시스템(03)을 준수한다.

- 산출된 MBTI 유형과 유형에 맞는 **리포트 카피**, **유형별 대표 이미지**를 표시한다.
- **"다시하기"** 버튼: 진행 상태를 초기화하고 안내 페이지로 보낸다.
- 버디버드 **앱 유도(App CTA)**를 명확히 배치한다(실제 링크는 10에서 연동, placeholder 상수).
- **공유 가능한 결과 URL**: 결과 유형(또는 답안)을 URL에 인코딩하고, 그 URL을 직접 열면 동일 유형이 재구성된다. 이 진입에서 "나도 테스트하기"로 안내 페이지로 보낸다. (01에서 마련한 자리를 실제 인코딩/복원으로 확정.)

## Acceptance criteria

- [ ] 결과 페이지에 도출 유형·리포트 카피·유형 이미지가 표시된다.
- [ ] "다시하기"가 상태를 초기화하고 안내 페이지로 이동시킨다.
- [ ] 앱 CTA가 노출된다(placeholder 링크 상수).
- [ ] 결과 URL을 직접 열면 동일 유형이 재구성되고, 재진입용 진입점이 보인다.
- [ ] 디자인 시스템(03) 준수 + agent-browser E2E(결과 URL 재구성 포함)/스크린샷으로 확인.

## Blocked by

- 02 (`02-mbti-engine-content-model.md`)
- 04 (`04-test-question-page.md`)
- 03 (`03-visual-design-direction.md`) — 디자인 게이트

## Comments

- 구현 완료 (branch `feat/parrot-mbti-foundation`). `app/result/result-view.tsx`에 유형 대표 이미지·기질 그룹 뱃지·App CTA·공유 URL 진입(in-memory 결과면 다시하기, 공유 방문자면 나도 테스트하기) 구현. 검증: `yarn type-check && yarn lint && yarn build && yarn e2e:run` 전부 통과.
