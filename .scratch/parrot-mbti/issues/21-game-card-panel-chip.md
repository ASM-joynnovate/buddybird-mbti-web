# 21 · 카드·패널·칩·배지 게임 스타일 리디자인

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

카드/패널/칩/배지를 "흰 사각형 웹 카드"가 아닌 **숲 세계 안의 게임 UI 패널**
(퀘스트 카드 / 수집 카드 / 페이퍼컷 패널 느낌)로 리디자인한다.

- 서피스: 크림/민트/페일 그린(이슈 19 토큰), 순백 카드 금지(쓴다면 보더+섀도+
  게임 트리트먼트로 소프트하게). 텍스트 가독성을 위한 충분한 불투명도.
- 시각: 라운드 코너(카드 24px급), 소프트 그린 보더 또는 딥 그린 아웃라인,
  페이퍼컷 레이어드 섀도(검정 하드 섀도 금지), 선택적으로 상단 하이라이트/이너 보더.
- 상태: 기본 / 선택형(보더 하이라이트 + scale 1.01 수준) / 비활성 / 빈 상태.
- 칩·배지: 필형, 솔리드 또는 세미솔리드 서피스(서피스 없는 떠 있는 텍스트 금지).
  기존 `.chip`(궁합 배지) 포함.
- Motion(`lib/motion/` variants 재사용): 진입 fadeUp(opacity 0, y 12 → 1, 0) +
  복수 카드 stagger, 탭 scale 0.98, transition 0.2–0.35s easeOut. 과한 3D/바운스 금지.
- dex 카드(`app/dex/dex.css`의 `.dex-card`) 스킨 포함 — 인터랙션 로직은 불변.
- "use client" 최소 범위. 주의: AGENTS.md — 구현 전 `node_modules/next/dist/docs/` 확인.

## Acceptance criteria

- [ ] 카드/패널/칩/배지가 게임 패널 스타일(크림·민트 서피스 + 소프트 보더 + 페이퍼컷 섀도)을 사용한다.
- [ ] 순백 무처리 카드·서피스 없는 텍스트 배지가 남아 있지 않다.
- [ ] 카드 위 텍스트가 전 지원 폭에서 실용적 콘트라스트를 충족한다.
- [ ] 복수 카드 진입에 stagger, 탭/선택 상태에 절제된 Motion 피드백이 있다.
- [ ] reduced-motion에서 진입이 opacity-only로 강등되고 UI는 완전히 사용 가능하다.
- [ ] dex 카드의 기존 탭/딥링크 동작이 보존된다.
- [ ] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과.

## Blocked by

- `.scratch/parrot-mbti/issues/19-motion-and-game-ui-tokens.md`
