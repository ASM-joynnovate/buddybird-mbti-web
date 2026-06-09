---
status: accepted
---

# Service name: "앵BTI" (앵무새 + MBTI), 버디버드 모앱 브랜드와 2층 구조

이 웹은 그동안 작업 문서마다 "앵무새 MBTI", "Parrot MBTI", "BuddyBird MBTI"로
제각각 불려, 메타데이터·공유 카피·문서 사이에서 서비스명이 표류했다. 바이럴 유입이
목적인 제품에서 서비스명은 각인·검색·공유의 단위라 하나로 굳혀야 한다.

## Decision

- **서비스명을 `앵BTI`로 확정한다** — `앵무새 + MBTI` 말장난. 짧고 각인되며, "앵"이
  앵무새를 그대로 환기해 도메인을 잃지 않는다.
- **2층 브랜드 구조를 유지한다.** `버디버드(BuddyBird)`는 유입 대상 **모앱 브랜드**,
  `앵BTI`는 이 **웹 서비스(테스트)** 의 이름. 둘은 대체 관계가 아니다. 브라우저
  타이틀은 `앵BTI · 버디버드` 형태로 서비스명 + 모앱 퍼블리셔를 함께 노출한다.
- **`버디버드`/`BuddyBird`는 어디서도 바꾸지 않는다.** 공유 카드 브랜드 도장
  `버디버드 / MBTI`(`features/share/card/card-parts.ts`의 `drawStamp`)와 앱 설치 CTA
  `버디버드 앱에서 더 알아보기`(`content/cta.ts`)도 그대로 둔다.
- **치환 단위는 "서비스 이름 한 덩어리"뿐.** `앵무새 MBTI`·`Parrot MBTI`·
  `BuddyBird MBTI`가 테스트의 이름으로 쓰인 자리만 `앵BTI`로 바꾼다. 실제 새를
  가리키는 묘사용 `앵무새`(`우리 앵무새`, `…앵무새예요`, `parrot tiles/types`)와
  일반 용어 `MBTI`(`4축`, `16유형`)는 그대로 둔다.
- **구조 식별자/인프라는 미변경.** repo·컨테이너·배포 경로(`buddybird-mbti-web`,
  `/opt/buddybird-mbti`), 이슈 폴더 `.scratch/parrot-mbti/`, 분석 파라미터
  `parrot_type`, 캐릭터 에셋 폴더 `parrots-mbti-charactor`, `package.json` name은
  배포·코드 의존이라 그대로 둔다. 표시 이름과 식별자를 분리한다.

## Considered Options

- **`앵BTI` + 버디버드 전면 유지 (chosen)** — 서비스명에 도메인(앵무새)이 남고
  바이럴 각인이 강하며, 모앱 브랜드를 흔들지 않아 변경 범위가 텍스트 카피로 한정된다.
- **버디버드 단독 브랜딩** — 모앱 인지도에 업을 수 있으나, 테스트 자체의 정체성과
  공유 후킹("나 앵BTI 했어")이 약해진다. 기각.
- **공유 도장까지 `앵BTI`로 교체** — 서비스 정체성은 강해지나 모앱 유입 동선에서
  버디버드 노출이 줄어 전환 목적과 어긋난다. 기각(버디버드 전면 유지).

## Consequences

- 사용자 노출 변경은 좁다 — 라우트 메타데이터 3종(`app/page.tsx`, `app/test/page.tsx`,
  `app/result/page.tsx`)과 `app/layout.tsx` 기본 타이틀/설명, Web Share 타이틀
  (`features/share/share-card.ts`), `app/globals.css` 디자인 시스템 주석.
- 문서는 일괄 통일 — `AGENTS.md`, `CONTEXT.md`, `DESIGN.md`, `docs/analytics-events.md`,
  `docs/deploy.md`, ADR 0001~0004의 컨텍스트 문장, `.scratch/parrot-mbti/`의 PRD·이슈.
  ADR 결정 내용·날짜는 손대지 않고 서비스명 표기만 갱신했다.
- **미해결**: 인트로 화면에 보이는 `앵BTI` 워드마크/로고가 아직 없다(서비스명은
  현재 브라우저 탭·공유 타이틀에만 노출). 인트로 워드마크 노출은 별도 디자인 작업.
- 새 카피/문서는 위 치환 규칙을 따른다 — 서비스명은 `앵BTI`, 모앱은 `버디버드`,
  실제 새는 `앵무새`.
