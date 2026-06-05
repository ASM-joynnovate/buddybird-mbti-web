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

- [x] 카드/패널/칩/배지가 게임 패널 스타일(크림·민트 서피스 + 소프트 보더 + 페이퍼컷 섀도)을 사용한다.
- [x] 순백 무처리 카드·서피스 없는 텍스트 배지가 남아 있지 않다. (이 이슈 소유 범위 기준 —
      페이지 소유 카드 서피스(q-prompt/.opt/.modal 등)는 이슈 23–25가 본 이슈의
      `.game-panel`/`.game-card`/`.game-chip` 프리미티브로 전환 예정.)
- [x] 카드 위 텍스트가 전 지원 폭에서 실용적 콘트라스트를 충족한다.
- [x] 복수 카드 진입에 stagger, 탭/선택 상태에 절제된 Motion 피드백이 있다.
- [x] reduced-motion에서 진입이 opacity-only로 강등되고 UI는 완전히 사용 가능하다.
- [x] dex 카드의 기존 탭/딥링크 동작이 보존된다.
- [x] `yarn build`·`yarn type-check`·`yarn lint`·e2e 통과. (e2e: 전체 실행은 리드 조율
      게이트라 미실행 — build/type-check/lint 그린. data-testid(dex-grid, dex-card-_,
      match-chip-_) 전부 보존.)

## Blocked by

- `.scratch/parrot-mbti/issues/19-motion-and-game-ui-tokens.md`

## Comments

**구현 요약 (ui-core, 이슈 #21):**

- `app/globals.css`: 게임 패널 프리미티브 추가 — `.game-panel`(28px, 크림 +
  리프 보더 + 페이퍼컷 섀도 + 이너 하이라이트) / `.game-panel--mint` /
  `.game-panel--empty`(대시 보더 빈 상태) / `.game-card`(24px) /
  `.game-card--selectable`(:hover 보더 하이라이트 + 섀도 리프트) / `.is-selected` /
  `.game-card--disabled` / `.game-chip`(민트 세미솔리드 필). 이슈 22–25 페이지
  패스가 자기 카드 서피스에 채택할 공유 어휘.
- `.chip`(궁합 배지) 게임 스킨: 크림 세미솔리드 + 리프 보더 + 미니 깊이바.
  CSS는 transform을 만지지 않음(Motion 소유) — hover는 보더/섀도만.
- `lib/motion/`: `cardTap`(scale 0.98, 0.2s easeLeaf) + `cardHover`(scale 1.01)
  추가 — 카드 계열 공용 인터랙션 어휘(버튼의 buttonTap과 구분).
- `app/dex/dex.css` `.dex-card`: 크림 퀘스트 카드 스킨(리프 보더 + 페이퍼컷 섀도),
  hover는 보더/섀도만, `mine` 보더 하이라이트 유지. 인터랙션 로직 불변.
- `app/dex/dex-view.tsx`: 그리드 진입 staggerContainer + fadeUp(reduced-motion 시
  fadeOnly로 강등), 카드 whileHover 1.01/whileTap 0.98(reduced-motion 시 드롭).
  탭→모달, ?focus/?mine 딥링크, data-testid 전부 보존.
- `components/match-chip.tsx`: `m.create(Link)`로 cardTap 탭 피드백(reduced-motion
  드롭). Link 시맨틱·키보드 접근성 불변.
- `components/photo-input.css` `.photo-preview-frame`: 크림 + 리프 보더 +
  페이퍼컷 섀도로 게임 트리트먼트.
- **스코프 노트**: `.modal`/`.modal-tag`(이슈 25), result 글래스 필 배지(이슈 24),
  test `.q-prompt`/`.opt`(이슈 23)는 해당 페이지 패스 소관으로 미변경 — 위
  프리미티브를 사용하면 됨. `.dex-mine-tag`는 이미 솔리드 필 배지라 유지.
