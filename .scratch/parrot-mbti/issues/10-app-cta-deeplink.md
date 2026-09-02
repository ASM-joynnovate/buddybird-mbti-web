# 10 · 앱 CTA 스토어 링크 연동

Status: done

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

결과 페이지의 앱 유도(App CTA)를 **실제 스토어 링크**로 연동한다. 딥링크 서비스
(OneLink/Branch)는 쓰지 않고 — 클라이언트에서 User-Agent로 기기를 판별해 각
스토어로 분기한다(ADR-0016).

- iOS → App Store, Android → Play Store, 데스크톱/미상 → Play Store(폴백).
  분기 로직은 `lib/store-link`의 순수 함수, 링크 상수는 `content/cta.ts` 한 곳.
- 어트리뷰션은 스토어 URL 자체에 실어 최소한만 회수한다:
    - Play: URL의 `referrer=utm_source…&utm_medium…` (앱의 Install Referrer API가 읽음).
    - App Store: App Store Connect 캠페인 링크(`pt`/`ct`) — 발급 후 상수 교체(HITL).
- 클릭 측정은 기존 GA4 `app_cta_click`(placement=result)로 계속.

## Non-goals (ADR-0016에서 명시적으로 뺌)

- 단일 링크가 서버에서 iOS/Android로 분기하는 딥링크 서비스.
- 설치 후 컨텍스트 전달(deferred deep link) — 유입 유형을 앱으로 넘기지 않는다.
- 통합 어트리뷰션 대시보드(스토어별 개별 리포트로 대체).

## Acceptance criteria

- [x] iOS/Android/데스크톱에서 CTA가 올바른 스토어로 분기된다(iPadOS의 Mac UA 위장 포함).
- [x] 링크가 단일 설정 상수(`content/cta.ts`)로 관리되어 한 곳에서 교체 가능하다.
- [x] Play 설치 유입이 referrer로 측정 가능하다(웹 측 결선 완료; 앱 측 Install Referrer 소비는 앱 팀 책임).
- [x] App Store Connect 캠페인 링크(`pt=129074287`, `ct=buddybird-mbti-web`) 발급·반영 완료.

## Blocked by

- 06 (`06-intro-page-carousel.md`)
- 07 (`07-result-report-page.md`)
