# 16 · 인트로 peek 탭 인터랙션 + 접근성

Status: done

## Parent

`.scratch/parrot-mbti/issues/06-intro-page-carousel.md`

## What to build

중앙 고정 peek 캐러셀(15)에 **탭 인터랙션과 접근성**을 보강한다.

- 각 peek 카드를 **탭하면 해당 유형으로 즉시 활성화**된다(가운데로 슬라이드 + 활성 카드 갱신).
- peek 카드는 버튼 시맨틱으로, 활성 카드에 `aria-pressed`를 부여하고 유형명을 라벨로 제공한다.
- 컨테이너에 hover/focus 시 **자동 진행 일시정지**, 키보드 포커스 이동이 가능하다.
- `prefers-reduced-motion`에서 자동 진행·슬라이드 트랜지션을 멈추고 정적으로 표시한다.
- 활성 유형을 알리는 **라이브 캡션**(sr-only `aria-live="polite"`)을 제공한다.

## Acceptance criteria

- [ ] 임의 peek 카드를 탭하면 해당 유형이 즉시 활성화된다.
- [ ] peek 카드가 버튼 시맨틱·`aria-pressed`·유형명 라벨을 갖는다.
- [ ] hover/focus 시 자동 진행이 일시정지된다.
- [ ] `prefers-reduced-motion`에서 자동 진행·트랜지션이 멈추고 정적 표시된다.
- [ ] 활성 유형 변경이 라이브 캡션으로 안내된다.
- [ ] 키보드 내비게이션 + agent-browser 검증, type-check/lint/build 통과.

## Blocked by

- 15 (`.scratch/parrot-mbti/issues/15-intro-center-peek-carousel.md`)

## Comments

- 구현: peek 타일을 `<span>` → `<button type="button">`로 전환. `onClick={()=>setPos(p)}`
  로 탭 시 해당 유형 즉시 활성화(슬라이드 recenter + 활성 카드/캡션 동기). 범위 밖 pos는
  기존 무음 리셋 경로가 정규화. `aria-pressed={p===pos}`, `aria-label="유형코드 유형명"`.
- 라이브 캡션: `<p className="showcase-caption" aria-live="polite" data-testid="showcase-caption">`
  (sr-only, 활성 `유형코드 유형명`). CSS에 sr-only 유틸이 없어 컴포넌트 스코프로 추가.
- CSS: `.peek` 버튼 리셋(border/padding/appearance), `.peek:focus-visible` 프라이머리
  아웃라인. hover/focus 일시정지(`onMouseEnter/Leave`·`onFocusCapture/onBlurCapture`)와
  reduced-motion 가드는 15에서 이미 배선됨.
- 검증(agent-browser): 버튼 시맨틱(BUTTON×48)·`aria-pressed=true`·라벨·캡션
  `aria-live=polite` 확인. 탭 → INFP에서 우측 이웃 ENFP 클릭 시 카드=peek=캡션 모두
  ENFP 동기(`synced:true`). 네이티브 hover 시 자동전환 정지, 제목으로 이동 시 재개.
  `focusin` 디스패치 시 일시정지(headless의 프로그램적 `.focus()`는 focusin 미발생이라
  실제 이벤트로 검증). `set media light reduced-motion`에서 트랙/peek 트랜지션 `0s`,
  카드 애니메이션 `none`, 자동전환 정지(코드 5초 불변). type-check/lint/build 통과.
