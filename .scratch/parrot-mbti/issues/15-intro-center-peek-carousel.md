# 15 · 인트로 중앙 고정 peek 캐러셀 + 활성 동기화

Status: done

## Parent

`.scratch/parrot-mbti/issues/06-intro-page-carousel.md`

## What to build

인트로의 **peek-row를 중앙 고정 자동 슬라이드 캐러셀로** 전환한다. 16유형 전체가
캐러셀에 참여하고, **가운데 카드가 활성화된 것처럼** 강조되며, 14의 활성 유형 카드가
가운데 유형과 **동기화**되어 함께 바뀐다.

프로토타입/검수에서 확정된 동작:

- **3초마다 한 칸씩** 옆으로 슬라이드(자동 진행). 슬라이드는 compositor 친화적
  `transform`만 사용한다.
- 가운데(활성) 카드는 확대 강조(레이아웃 pitch에 영향 없는 scale), 좌우 이웃은 살짝
  디밍되어 peek 된다.
- 마지막 유형 다음 첫 유형으로 **끊김 없는 무한루프**(되감기·점프 비가시). 유형 목록을
  복제해 트랜지션 종료 시 무음 리셋하는 방식으로 구현한다.
- 활성 인덱스를 단일 소스로 두고, 14의 활성 카드와 가운데 peek 카드가 같은 인덱스를
  바라본다.

기존 자동 진행/일시정지/`prefers-reduced-motion` 패턴(06의 캐러셀)을 차용한다.

## Acceptance criteria

- [ ] peek-row가 16유형 중앙 고정 캐러셀로 동작하고 3초마다 한 칸 슬라이드한다.
- [ ] 가운데 카드가 활성으로 강조되고, 좌우 이웃이 peek 된다.
- [ ] 활성 카드(14)가 가운데 유형과 동기화되어 함께 바뀐다.
- [ ] 마지막→처음 전환이 끊김/되감기 없이 매끄럽게 순환한다.
- [ ] `transform`만 애니메이트(레이아웃 속성 애니메이트 없음).
- [ ] agent-browser로 ~50초 순환·동기화 확인, type-check/lint/build 통과.

## Blocked by

- 14 (`.scratch/parrot-mbti/issues/14-intro-active-type-card.md`)

## Comments

- 구현: `components/type-showcase.tsx`를 중앙 고정 무한 캐러셀로 확장. `app/page.tsx`의
  인라인 `PeekRow` 제거, `<TypeShowcase pool={PEEK_POOL} intervalMs={3000} />`로 교체.
  `app/page.css`의 `.peek-row`/`.peek` 규칙 제거(쇼케이스 CSS로 이동).
- 무한루프: 풀 3중 복제(`[...pool,...pool,...pool]`, 48셀), `pos` 초기값 = 중앙 사본
  첫 유형. `transitionend`에서 `pos>=2*len`이면 `transition:none`으로 끄고 `pos-=len`
  점프 후 다음 프레임 `animate=true` 복구(동일 셀이라 비가시). 활성 인덱스 단일 소스 →
  활성 카드와 중앙 peek가 항상 동일 유형.
- 자동전환: `type-carousel.tsx` 패턴 차용 — `setInterval`로 3초마다 `pos+=1`,
  `reduced||paused||len<=1`이면 정지. 컨테이너 hover/focus 시 일시정지.
- 중앙 정렬: 트랙 `position:relative; left:50%`, `translateX(calc(-1*(pos*68px+28px)))`
  (pitch 56+12=68, 반칸 28). 활성 셀 `scale(1.22)`는 레이아웃 pitch 불변 → 중앙 계산 유지.
  이웃은 `opacity:.55`로 디밍 peek.
- **발견·수정한 결함**: peek 타일의 `opacity`/`transform` transition `transitionend`가
  트랙 핸들러로 버블링되어 한 슬라이드에 reset 로직이 여러 번 발화 → stale `pos`로
  가드를 중복 통과해 `pos`가 음수로 오버슈트, 중앙 강조가 ~32% 프레임에서 사라짐.
  핸들러에 `event.target===event.currentTarget && propertyName==='transform'` 가드를
  추가해 트랙 자신의 transform 종료에만 1회 반응하도록 수정.
- 검증: `type-check`/`lint`/`build` 통과. agent-browser 프레임 단위 샘플링 6창(~54s,
  16유형 1사이클·무음 리셋 1회 포함)에서 `is-active` 셀 수 항상 정확히 1
  (`min=max=1, zeroFrames=0`), 활성 카드=중앙 peek 동기, 3초 자동전환, 마지막→처음
  매끄러운 순환 확인.
