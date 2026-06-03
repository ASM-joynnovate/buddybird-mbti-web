# 01 · 걷는 뼈대 + agent-browser E2E 하니스

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

안내(Intro) → 문항(Test) → 결과(Result) 세 surface를 관통하는 **걷는 뼈대**.
실제 디자인·콘텐츠 없이 플레이스홀더로, 전 구간을 끝까지 이동할 수 있는 골격을
만든다. 동시에 이 저장소의 첫 검증 인프라인 **agent-browser E2E 하니스**를 셋업한다.

- 세 라우트와 그 사이 네비게이션을 연결한다(안내의 시작 액션 → 문항, 마지막 답안 → 결과, 결과의 다시하기 → 안내).
- 문항은 플레이스홀더 2~3개로 충분하다. `computeResult`는 답안을 받아 임의/고정 유형을 돌려주는 **스텁**으로 둔다(실제 산출은 02에서).
- 답안 진행 상태는 클라이언트 메모리로 들고, 결과 단계에서 유형을 URL에 인코딩하는 자리를 마련한다(실제 인코딩/복원은 07에서 확정).
- agent-browser로 페이지를 열고 준비 신호(`document.fonts.ready`, 가시 요소)로 대기한 뒤 전 구간을 구동하는 E2E 스크립트를 추가한다. 고정 타임아웃 금지.
- 새 Next.js(이 저장소 버전)의 라우팅/렌더링 규약은 학습 데이터와 다를 수 있다 — 구현 전 `node_modules/next/dist/docs/`의 관련 가이드를 먼저 확인한다.

이 슬라이스는 의도적으로 플레이스홀더 UI다. 실제 UI/UX는 03(디자인 시스템) 이후 진행한다.

## Acceptance criteria

- [ ] 안내 → 문항 → 결과 → (다시하기) 안내로 이어지는 전 구간을 브라우저에서 끊김 없이 이동할 수 있다.
- [ ] 플레이스홀더 문항에 답하면 자동으로 결과 화면에 도달하고, 스텁 유형이 표시된다.
- [ ] agent-browser E2E 스크립트가 전 구간을 자동 완주하며, 대기는 준비 신호 기반이다(고정 타임아웃 없음).
- [ ] `yarn build`와 `yarn type-check`가 통과한다.
- [ ] 단위 테스트 러너/테스트 코드는 추가하지 않는다(검증은 agent-browser만).

## Blocked by

None - can start immediately
