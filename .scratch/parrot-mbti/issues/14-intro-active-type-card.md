# 14 · 인트로 활성 유형 카드

Status: done

## Parent

`.scratch/parrot-mbti/issues/06-intro-page-carousel.md`

## What to build

인트로(Intro) 화면의 **hero-title과 peek-row 사이**에, 현재 활성 유형을 보여주는
**활성 유형 카드**를 추가한다. 디자인 시스템(03)과 PNG 숲 배경(ADR-0004)을 준수한다.

이 슬라이스에서는 활성 유형을 **첫 유형으로 고정**해 카드의 형태·비율·반응형을 먼저
확정한다(캐러셀 연동은 15에서). 카드를 소유하는 쇼케이스 컴포넌트는 활성 인덱스 상태를
갖되 여기서는 0으로 둔다 — 15가 이 인덱스를 구동하므로 구조를 그대로 재사용한다.

프로토타입에서 확정된 형태(검수 완료):

- 카드 전체 비율 **가로:세로 = 3:2**.
- 내부를 **좌:우 ≈ 5:9 컬럼**으로 분할(우측이 더 넓음).
- **좌측**: 활성 유형 앵무새 이미지를 **padding을 준 1:1 그라데이션 타일**로 — 카드를
  꽉 채우지 않고 여백 안에 정사각, 세로 중앙 정렬. 배경은 유형 그라데이션.
- **우측**: 1줄 = `유형코드 | 이름`, 2줄째 = 한줄설명(짧은 태그라인). 설명은 2줄 클램프.

유형 데이터(이름·한줄설명·그라데이션·이미지)는 기존 콘텐츠 모델(02)과 이미지 컴포넌트를
재사용한다. 신규 데이터/유틸을 만들지 않는다.

## Acceptance criteria

- [ ] hero-title 아래·peek-row 위에 활성 유형 카드가 렌더된다.
- [ ] 카드 3:2, 내부 좌:우 ≈ 5:9, 좌측은 padding 준 1:1 그라데이션 타일(꽉 채우지 않음).
- [ ] 우측에 `유형코드 | 이름`(1줄) + 한줄설명(2줄째)이 표시된다.
- [ ] 320/375/768에서 오버플로 없이 레이아웃이 유지된다(저높이 기기 포함).
- [ ] 기존 콘텐츠 모델·이미지 컴포넌트 재사용(신규 중복 없음).
- [ ] agent-browser 스크린샷으로 확인, type-check/lint/build 통과.

## Blocked by

None - can start immediately

## Comments

- 구현: `components/type-showcase.tsx` + `components/type-showcase.css` 신규 생성.
  `TypeShowcase`가 활성 인덱스(`pos`, 이 슬라이스에선 0 고정)를 단일 소스로 보유 →
  15가 이 인덱스를 구동하도록 구조 재사용. `app/page.tsx`에서 hero-title 아래·
  peek-row 위에 `<TypeShowcase pool={PEEK_POOL} />` 배치.
- 재사용(신규 중복 없음): `getTypeInfo`·`typeGradient`(`@/content`), `<ParrotImage>`,
  토큰(`--radius-lg`/`--shadow-leaf-card`/`--sh-sm`/`--color-*`/`--font-display`).
- 카드 형태: 좌:우 5:9 컬럼, 좌측은 padding 준 1:1 그라데이션 타일(정사각, 세로 중앙,
  `max-width:104px`로 캡), 우측은 `유형코드 | 이름`(1줄, 좁은 폭에선 자연 줄바꿈) +
  한줄설명(report) 2줄 클램프.
- **사양 변경(사용자 지시)**: 프로토타입의 카드 외곽 3:2 고정을 폐기. 세로가 너무 길어
  `aspect-ratio:3/2`를 제거하고 카드 높이를 콘텐츠(이미지 타일 vs 텍스트 중 큰 쪽)에
  맞춘 콤팩트 밴드로 변경. 후속 ADR-0005(17)에 반영 예정.
- `app/page.css`: `.hero-title` 상단 여백 `120px` → `clamp(24px,7vh,72px)`로 축소,
  `.peek-row` `margin-top:auto` → `16px`(카드 바로 아래 배치, stats가 하단 고정 담당).
- 검증: `yarn type-check`/`lint`/`build` 통과. agent-browser 320/375/768 스크린샷에서
  오버플로 없음, 콤팩트 카드 확인.
