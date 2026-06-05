# 01 · 문서·ADR: standalone 배포 전환 결정 기록

Status: ready-for-agent

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

이 앱을 "정적 export(클라이언트 전용 정적 호스팅)"에서 "Next standalone Node 서버
컨테이너 + 기존 Caddy 리버스 프록시"로 배포하기로 한 결정을 문서에 선반영한다.
이후 모든 구현 슬라이스의 전제가 되므로 **가장 먼저** 진행한다.

- 새 ADR을 추가한다(예: `docs/adr/0002-standalone-node-deployment.md`). 배경(왜 정적→standalone), 결정, 영향(런타임 변화, E2E 갱신 필요, 헬스 엔드포인트 신설), 대안(기존 Caddy file_server / 앱측 Caddy)과 기각 사유를 기술한다.
- `AGENTS.md`, `.scratch/parrot-mbti/PRD.md`, `CONTEXT.md`에서 "백엔드 없음 · 정적 배포" 류의 서술을 standalone 컨테이너 배포로 갱신한다.
- **불변 사항을 명시**한다: 사진 100% 클라이언트 처리, 분석 백엔드 없음 등 데이터 프라이버시 약속은 그대로이며, 바뀌는 것은 "서빙 방식"뿐이다. `/api/healthz`는 200만 반환하는 무상태 엔드포인트로 사용자 데이터를 다루지 않는다.

코드 변경은 없다. 문서만 갱신한다.

## Acceptance criteria

- [ ] `docs/adr/0002-*.md`가 생성되고 배경/결정/영향/대안이 기술된다.
- [ ] `AGENTS.md`·`PRD.md`·`CONTEXT.md`의 정적 배포 서술이 standalone 컨테이너 배포로 갱신된다.
- [ ] 데이터 프라이버시(사진 클라이언트 처리, 분석 백엔드 없음)가 불변임이 문서에 명시된다.
- [ ] 다른 슬라이스가 참조할 수 있도록 런타임 전환의 영향(E2E·헬스·Dockerfile)이 정리된다.

## Blocked by

None - can start immediately
