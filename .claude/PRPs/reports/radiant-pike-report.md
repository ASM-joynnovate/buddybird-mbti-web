# Implementation Report: 앵무새 MBTI 문항·선택지 멀티축 가중치 개편

## Summary

테스트를 "12문항 × 한 선택지=한 축 +1" 모델에서 **"13문항 × 2지선다 × 대칭 멀티축
가중치"** 모델로 전환했다(ADR-0003). 사용자 원문 13문항(애착/활동/소통)을 2지선다로
정규화하고, 각 선택지가 2개 축에 대칭 +1을 주도록 매핑했다. 축별 커버 문항 수를 홀수
(EI 7·SN 7·TF 7·JP 5)로 배분해 동점을 구조적으로 차단했고, 채점 함수·결과 URL 코덱·
진행바·분석 이벤트를 새 모델에 맞게 갱신했다.

## Assessment vs Reality

| Metric | Predicted (Plan) | Actual |
|---|---|---|
| Complexity | Large | Large (예상과 일치) |
| Files Changed | ~12 | 16 modified + 1 created |
| Anchors | 결정 후 E2E 갱신 | all-A=ESTJ / all-B=INFP (기존과 동일, E2E 그대로) |
| Validation | E2E only | type-check·lint·build·전수검증·E2E |

## Tasks Completed

| # | Task | Status | Notes |
|---|---|---|---|
| 1 | ADR + PRD + 도메인 타입 | ✅ | ADR 번호 **0003**로 변경(0002 충돌 회피) |
| 2 | 13문항 콘텐츠 + 배분표 | ✅ | 사용자 리뷰 3회(설계안 v1→원문→v2 긴 카피) 후 확정 |
| 3 | 채점 함수 멀티축화 | ✅ | 완전성 검증을 "축별 동일 개수"→"축별 비어있지 않음"으로 변경 |
| 4 | 결과 URL 코덱 + 바 | ✅ | left-only(3hex)→**left+right(6hex)** 자기완결 인코딩 |
| 5 | 진행바 + 상태 정리 | ✅ | 진행바 중립화, 옵션색 축비의존화, 상태 컨텍스트는 무변경(축 의존 없음) |
| — | 인트로 "12 질문" 하드코딩 | ✅ | 계획 외 발견 → `QUESTION_COUNT` 바인딩으로 수정 |

## Validation Results

| Level | Status | Notes |
|---|---|---|
| Type Check | ✅ Pass | `yarn type-check` exit 0 |
| Lint | ✅ Pass | `yarn lint` exit 0 |
| Build | ✅ Pass | `yarn build` exit 0 (content 대칭 불변식 모듈 로드 통과) |
| 전수검증(임시) | ✅ Pass | 2¹³=8192 조합: 동점 0건, 16유형 전부 도달, all-A=ESTJ/all-B=INFP. 검증 후 스크립트 폐기 |
| E2E (관련 플로우) | ✅ Pass | known-answer-type(ESTJ/INFP)·analytics-events(13문항)·funnel-events·responsive |
| E2E (사전 실패) | ⚠️ Pre-existing | full-navigation·intro-carousel·accessibility — 베이스라인에서도 동일 실패(아래) |
| 시각 확인 | ✅ Pass | intro "13 질문", test 1/13 긴 카피, 공유 URL 축바 86%/57% 정확 재현 |

### 전수검증 분포 (참고)
min 3.2%(ENTP/ISFJ) ~ max 11.1%(ESTJ/INFP). 미러쌍 카운트 동일(대칭 채점 정확성 신호).
ESTJ/INFP로 약한 쏠림 있으나 16유형 모두 도달, 굶는 유형 없음. 대칭이라 카피 변경 없이
orientation 뒤집기로 추가 균형화 가능(필요 시).

## Files Changed

| File | Action | Notes |
|---|---|---|
| `lib/mbti/types.ts` | UPDATE | `Choice.weights`, `Question`에서 `axis` 제거 |
| `content/questions.ts` | REWRITE | 13문항·대칭 멀티축·긴 MZ 카피 |
| `content/index.ts` | UPDATE | 불변식: 멀티축 **대칭성** 검증으로 교체 |
| `lib/mbti/compute-result.ts` | UPDATE | weights 합산 + 축별 기본 방향 타이브레이크 |
| `lib/result-url/result-url.ts` | UPDATE | 축별 left+right(6 hex) 인코딩, bare/legacy 폴백 |
| `app/result/result-view.tsx` | UPDATE | 디코드 axisScores 직접 사용 + bare 폴백 |
| `app/test/page.tsx` | UPDATE | 진행바 중립화, 옵션색 축비의존, analytics `axis` 제거 |
| `app/page.tsx` | UPDATE | 인트로 "질문" 통계 `QUESTION_COUNT` 바인딩 |
| `lib/analytics/events.ts` | UPDATE | `question_answered.payload.axis` 제거 |
| `e2e/flows/*.mjs` | UPDATE | 문항 수 12→13, axis 단언 제거, 주석 갱신 |
| `docs/adr/0003-multi-axis-weighted-scoring.md` | CREATE | 채점 모델 전환 ADR |
| `.scratch/parrot-mbti/PRD.md` | UPDATE | 산출 로직 섹션 멀티축화 |
| `CONTEXT.md` | (이전 세션 완료) | 도메인 정의 갱신 |
| `content/axes.ts`, `components/axis-bars.tsx` | (사용자 병행 편집) | 축 라벨 `새`→`앵` — 본 작업과 무관, 유지 |

## Deviations from Plan

1. **ADR 번호 0002→0003**: 코드 3곳(`types.ts`,`result-view.tsx`,`content/gradient.ts`)이
   이미 "ADR-0002"를 색상/그라데이션 결정으로 참조 중이라, 채점 ADR을 0003으로 부여해
   기존 참조 오도를 피함.
2. **결과 URL 인코딩 6 hex(left+right)**: 계획의 "left 카운트만 3 hex"는 디코더가 축별
   total(콘텐츠 degree)을 알아야 해 result-url↔content 결합을 만든다. left+right를 함께
   인코딩해 디코드를 콘텐츠 독립·정확하게 만들고 재구성 함수를 제거(개선적 편차).
3. **완전성 검증 규칙 변경**: 멀티축에서 축별 답안 수가 7/5로 달라 기존 "축별 동일 개수"
   규칙은 성립 불가 → "축별 비어있지 않음 + 잘못된 항목 거부"로 대체. 동점은 throw 대신
   방어용 기본 방향 타이브레이크(정상 13답안에서 미발동).
4. **`axis-bars.tsx` 무변경**: 이미 `left/(left+right)` 비율 렌더라 총합 7/5에 그대로 동작.

## Issues Encountered (Surfaced, Not Worked Around)

- **사용자 원문 13문항 미저장**: 저장소에 없어 사용자에게 직접 요청 → 원문 수령 후 정규화.
- **원문 3~4지선다 vs 계획 2지선다**: 충돌을 표면화하고 폴딩 매핑을 제시해 사용자 승인.
- **인트로 "12 질문" 하드코딩**: 스크린샷 검증 중 발견 → `QUESTION_COUNT` 바인딩.
- **E2E 사전 실패 3건**: `git stash`로 베이스라인 비교 → full-navigation(진행바 단언
  race), intro-carousel, accessibility(carousel role) 모두 **본 변경 이전부터 실패**.
  본 작업 범위 밖이라 수정하지 않고 보고만 함(테스트 삭제·우회 없음).

## Next Steps

- [ ] (선택) 사전 실패 E2E 3건 별도 처리: full-navigation 진행바 단언의 네비게이션
      전환 race 완화 + 인트로 캐러셀 role/aria-label·present 단언 정합성.
- [ ] (선택) 16유형 분포 추가 균형화(orientation 미세조정).
- [ ] `LETTER_COLOR`(content/axes.ts) 미사용화 — refactor-cleaner 후속 정리 후보.
- [ ] Code review (`/code-review`) → commit → PR.
