# Analytics 이벤트 사전

버디버드 앵무새 MBTI 웹이 전송하는 모든 GA4 이벤트의 사전이다. 코드상 단일 진실
원천은 `shared/analytics/events.ts`(타입 계약)이며, 이 문서는 GA4 대시보드를 보는
사람을 위한 풀이판이다. 전송 백엔드는 지연 로딩 Firebase GA4(ADR-0011); payload 키는
GA4에서 snake_case로, `type`(앵무새 유형 코드)은 `parrot_type` 파라미터로 나타난다.

## 핵심 퍼널

| 이벤트              | GA4 파라미터                                | 발화 조건                                                           | 퍼널 단계             |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------- | --------------------- |
| `test_start`        | —                                           | 인트로 "테스트 시작하기" 탭                                         | 유입 → 시작           |
| `question_answered` | `question_id`, `choice_id`, `index`         | 각 문항 선택지 탭 (13문항, index 0..12)                             | 진행                  |
| `test_completed`    | `parrot_type`                               | 마지막 답변 후 결과 도출                                            | 완료                  |
| `result_view`       | `parrot_type`, `visitor` (`owner`/`shared`) | 결과 화면 진입 (마운트당 1회). `shared` = 공유 링크로 들어온 방문자 | 결과 도달 / 공유 유입 |
| `photo_attached`    | `source` (`camera`/`gallery`)               | 결과에서 사진 촬영/업로드 성공                                      | 공유 준비             |
| `share_success`     | `parrot_type`                               | Web Share 네이티브 공유 완료                                        | **공유 (바이럴)**     |
| `share_fallback`    | `parrot_type`, `reason`                     | 공유 미지원 → 카드 다운로드 폴백                                    | 공유 (폴백)           |
| `app_cta_click`     | `placement` (`intro`/`result`)              | 버디버드 앱 CTA 탭                                                  | **앱 전환**           |

## 탐색 (덱 / 상세 팝업)

| 이벤트             | GA4 파라미터                                              | 발화 조건                                                                                 |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `deck_open`        | `source` (`intro`/`result`), `trigger` (`button`/`scrub`) | 16유형 덱 오버레이가 열림으로 커밋. 스크럽 제스처는 결과만 1회 집계 (틱 단위 미수집)      |
| `deck_close`       | `source`, `trigger` (`button`/`gesture`)                  | 사용자가 덱을 닫음. 프로그램적 닫힘(팝업 CTA 경유)은 미집계                               |
| `detail_open`      | `parrot_type`, `source` (`stack`/`deck`/`match`/`chip`)   | 유형 상세 팝업 열림 — 인트로 카드 스택 / 덱 그리드 / 결과 궁합 카드 / 팝업 내 찰떡궁합 칩 |
| `detail_close`     | `method` (`button`/`scrim`/`escape`)                      | 상세 팝업 닫힘 (칩으로 다른 유형 전환은 close 아님)                                       |
| `detail_cta_click` | `parrot_type`                                             | 팝업 CTA "이 친구 홈에서 보기" (인트로 전용)                                              |

## 이탈·재시도·에러

| 이벤트          | GA4 파라미터                        | 발화 조건                                                                          |
| --------------- | ----------------------------------- | ---------------------------------------------------------------------------------- |
| `test_back`     | `index`                             | 퀴즈 ← 버튼. `index=0`이면 퀴즈를 떠나 인트로로 이탈                               |
| `restart_click` | `source` (`owner`/`shared`/`error`) | 다시하기. `shared` = 공유 방문자의 "나도 테스트하기" — **바이럴 루프 재진입 지표** |
| `share_cancel`  | `parrot_type`                       | 공유 시트를 사용자가 닫음 (공유 퍼널 누수 지점)                                    |
| `share_error`   | `parrot_type`                       | 공유 카드 합성(canvas) 실패                                                        |
| `result_error`  | `reason` (`missing`/`invalid`)      | 결과 화면이 유형을 못 구함 — 토큰 부재 vs 해석 실패                                |
| `photo_removed` | —                                   | 첨부한 사진 제거                                                                   |
| `image_error`   | `parrot_type`                       | 앵무새 일러스트 로드 실패 (페이지 로드당 유형별 1회만)                             |

## 의도적으로 수집하지 않는 것

- 덱 스크럽의 휠/터치 **틱 단위** 진행도 (결과인 `deck_open`만 집계)
- 인트로 카드 스택 호버·자동 진행, 퀴즈 자동 진행 (자동 발화 노이즈)
- 사진 "다시 찍기/다시 선택" 버튼 (결과인 `photo_attached` 재발화가 커버)

## 보는 법 (대표 질의)

- **공유 퍼널**: `test_completed` → `share_success + share_fallback` vs `share_cancel + share_error`
- **바이럴 루프**: `result_view{visitor=shared}` → `restart_click{source=shared}` → `test_start`
- **중도 이탈**: `test_back{index=0}` / 문항별 `question_answered` index 드롭오프
- **탐색 인게이지먼트**: `deck_open` 비율, `detail_open`의 source 분포
