# 08 · Slack 알림 — 봇 토큰 + 성공/실패 메시지

Status: wontfix

> 자동 배포(GitHub Actions) 제거 결정으로 폐기 — 알림 대상 워크플로 자체가 없음.

## Parent

`.claude/plans/grill-with-docs-to-issues-cheerful-cook.md`

## What to build

배포 워크플로 결과를 Slack으로 통지한다. Slack 앱 생성·봇 토큰 발급·채널 초대는
사람이 해야 하므로 **HITL**. 워크플로 스텝 자체는 자동이다.

- Slack 앱 생성, `chat:write` 스코프 부여, 대상 채널에 봇 초대. 봇 토큰을 repo 시크릿 `SLACK_BOT_TOKEN`으로, 대상 채널 ID를 변수로 등록.
- `deploy.yml`에 `slackapi/slack-github-action@v2`로 success(`if: success()`)/failure(`if: failure()`) 메시지 스텝 추가. 메시지에 커밋·작성자·결과·실행 링크 포함.
- `docs/deploy.md`에 Slack 앱/토큰/채널 설정 체크리스트를 문서화한다.

## Acceptance criteria

- [ ] `SLACK_BOT_TOKEN` 시크릿과 채널 ID 변수가 등록되고, 봇이 채널에 초대돼 있다.
- [ ] 배포 성공 시 Slack에 성공 메시지가 게시된다.
- [ ] 배포 강제 실패 시 Slack에 실패 메시지가 게시된다.
- [ ] 메시지에 커밋/작성자/결과 정보가 포함된다.

## Blocked by

- `.scratch/deploy/issues/07-deploy-workflow-on-main.md`
