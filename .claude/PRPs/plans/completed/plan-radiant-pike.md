# Plan: 앵무새 MBTI 문항·선택지 멀티축 가중치 개편

**Source**: 대화형 (사용자 제공 13문항 원문 + grill-with-docs 세션)
**Complexity**: Large (도메인 모델·채점·콘텐츠·결과 인코딩 전반)

## Context — 왜 이 변경을 하는가

현재 테스트는 **12문항 × 2지선다**이고, 각 선택지는 **정확히 한 축에 +1**을 준다.
축당 3문항(홀수)이라 동점이 구조적으로 불가능하다 (`compute-result.ts:62-79`,
`CONTEXT.md`, `PRD.md:102-103`).

사용자는 보호자의 *행동 관찰* 기반 13문항(애착/활동/소통 테마)을 원하고, 각 행동이
MBTI 여러 축에 동시에 신호를 주는 현실을 반영하려 한다. 따라서:
- 문항을 주제 중심 13개로 재구성하고
- 한 선택지가 **여러 축에 가중치**를 갖게 하며
- 카피는 원문 의미를 유지하되 **짧고 귀엽게(MZ)** 압축한다.

이는 문서화된 3개 불변식(문항 수, "한 선택지=한 축", 동점 방지 메커니즘)을 동시에
바꾸는 변경이다. grilling으로 아래 결정이 확정됐다.

## 확정 결정 (grilling 결과)

1. **2지선다 유지** — 문항당 선택지 2개. 단 각 선택지는 멀티축 가중치를 가짐.
2. **문항 13개 전부** — 사용자 원문 13개를 모두 2지선다로 재구성.
3. **대칭형·균등 +1** — 한 문항의 A/B는 *같은 축 집합*을 *반대 글자*로, 각 +1.
   각 선택지는 1~2개 축을 건드림.
4. **동점 = 결정적 타이브레이크(축별 기본 방향)** — 단 #5 설계로 구조적 동점 불가,
   타이브레이크는 방어용(정상 데이터에서 미발동).
5. **검증 = E2E만**(PRD 정책 준수). 단위테스트 미작성. 구현 직후 16유형 전수 조합을
   콘솔에서 1회 검증하는 **임시 스크립트로 채점 수학 확인 후 폐기**.

## 채점 모델 명세

- 대칭형 균등 +1 → 어떤 축을 건드리는 문항 수 K가 고정되면 그 축 합(left+right)=K 고정.
- **각 축을 홀수 개 문항이 건드리도록 배분 → 동점 구조적 불가** (원래 "홀수→동점불가"
  논리의 멀티축 일반화).
- **축-터치 예산**: 각 문항이 2축씩 → 26 축-터치, 목표 degree **EI 7 · SN 7 · TF 7 · JP 5**.
  실현 가능한 축쌍 분해 존재 확인:
  `EI-SN×3, EI-TF×2, EI-JP×2, SN-TF×3, SN-JP×1, TF-JP×2` (= 13문항).
- `computeResult`는 순수함수 유지: 답안 배열 → 축별 left/right 집계 → 다수 글자 결합
  → `{ type, axisScores }`.

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| 도메인 계약 | `lib/mbti/types.ts` | 로직·부수효과 없는 타입 전용 모듈. 여기만 import |
| 순수 채점 | `lib/mbti/compute-result.ts:37` | `@/content` 의존 없는 순수함수 + `IncompleteAnswersError` |
| 콘텐츠 분리 | `content/questions.ts`, `content/types.ts` | 문항/유형 데이터를 코드와 분리, 교체 가능 |
| 결과 인코딩 | `lib/result-url/result-url.ts:27` | type+축강도를 query param에 압축 (정적 export 유지) |
| E2E 앵커 | `content/questions.ts:4` | "all-A → 특정유형" 결정적 앵커로 E2E 고정 |

## Files to Change

| File | Action | Why |
|---|---|---|
| `lib/mbti/types.ts` | UPDATE | `Choice`: `axis`+`letter` 단일 → **`weights: Partial<Record<Letter, number>>`** (멀티축). `Question`: `axis` 필드 제거 |
| `content/questions.ts` | REWRITE | 13문항, 2지선다, 대칭 멀티축 weights, 짧은 MZ 카피. 축 degree=EI7/SN7/TF7/JP5 |
| `lib/mbti/compute-result.ts` | UPDATE | weights 합산 집계 + 축별 기본 방향 타이브레이크(방어용). `isValidChoice`를 weights 기준으로 |
| `lib/result-url/result-url.ts` | UPDATE | 축별 split이 풍부(7-0~4-3 등)해짐 → 1비트/축 → **축별 left 카운트(축당 3비트, 총 3 hex char)** 인코딩으로 확장. bare code 하위호환 유지 |
| `app/result/result-view.tsx` | UPDATE | `scoresFromStrengths` → 인코딩된 left 카운트로 axisScores 재구성 |
| `components/axis-bars*` (AxisBars) | UPDATE | 축마다 총합이 다름(7 또는 5) → `left/(left+right)` 비율로 렌더 |
| `app/test/page.tsx` | UPDATE | 진행바 축-글자 색칠(`139-149`) 제거 → 중립 진행 표시. 마지막 답안 후 `computeResult` 호출부는 그대로 |
| `lib/state/test-progress-context.tsx` | REVIEW/UPDATE | answers를 questionId→Choice로 보관하는 구조 유지 확인 (축 의존 없는지) |
| `CONTEXT.md` | ✅ 완료 | Question(13·멀티축)/Choice(대칭 멀티축 +1) 정의 갱신 완료 |
| `docs/adr/0002-multi-axis-weighted-scoring.md` | CREATE | 채점 모델 전환 ADR (아래) |
| `.scratch/parrot-mbti/PRD.md` | UPDATE | MBTI 산출 로직 섹션(99-112) 멀티축으로 갱신 |
| E2E 저니 (all-a 가정) | UPDATE | 신규 결정적 앵커로 기대 유형 갱신 |

## Tasks

### Task 1: ADR + PRD + 도메인 타입
- **Action**: `docs/adr/0002` 작성(아래 ADR), PRD 99-112 갱신, `types.ts`의 `Choice`/`Question` 변경
- **Mirror**: `types.ts` 타입 전용 규약
- **Validate**: `pnpm tsc --noEmit` (타입 깨짐 지점이 후속 작업 목록이 됨)

### Task 2: 13문항 콘텐츠 + 축 배분표
- **Action**: 13문항을 2지선다·대칭 멀티축 weights·짧은 MZ 카피로 작성. degree=EI7/SN7/TF7/JP5
- **선행 리뷰**: 구현 전 **문항→축쌍 매핑 + 압축 카피 표**를 사용자에게 제시해 일괄 검토
- **Validate**: 임시 콘솔 스크립트로 (a) 축별 문항 수 홀수 확인 (b) all-A/all-B 앵커 유형 확정

### Task 3: 채점 함수 멀티축화
- **Action**: `computeResult`를 weights 합산으로. 축별 기본 방향 타이브레이크(방어용) 추가
- **Mirror**: 기존 `IncompleteAnswersError`/완전성 검증 유지
- **Validate**: 임시 전수검증(2^13 일부 + 대표 조합) → 동점 0건, 16유형 분포 점검 후 스크립트 폐기

### Task 4: 결과 URL 코덱 + 바
- **Action**: `result-url.ts` 인코딩을 축별 left 카운트(3 hex char)로 확장, bare code 폴백 유지.
  `result-view.tsx` 재구성, `AxisBars` 비율 렌더
- **Validate**: `/result/?t=<code>` 직접 열어 공유 방문자 바 재현 확인

### Task 5: 진행바 + 상태 정리
- **Action**: `app/test/page.tsx` 진행바 중립화. 상태 컨텍스트 축 의존 제거 확인
- **Validate**: agent-browser로 13문항 자동진행 흐름

## ADR-0002 (작성 예정 요지)

- **Decision**: 채점을 "한 선택지=한 축 +1, 축당 홀수라 동점불가" →
  "대칭 멀티축 +1, 축별 홀수 커버로 동점 구조적 불가, 축별 기본 방향 타이브레이크 안전망".
- **Why**: 행동 관찰형 문항은 한 축에 깔끔히 매핑되지 않음. 멀티축이 콘텐츠 표현력↑.
- **Trade-off**: 가중치 설계 복잡도↑, 16유형 분포 쏠림 위험 → 전수검증으로 완화.

## Verification (E2E only, PRD 준수)

```bash
# 1) 타입
pnpm tsc --noEmit

# 2) 임시 전수검증(작업 후 폐기) — 채점 수학
#    - 축별 문항 수 전부 홀수인가
#    - 동점 0건인가 (전 조합)
#    - all-A / all-B 앵커 유형 = E2E 기대값과 일치하는가
#    - 16유형이 합리적으로 분포하는가

# 3) agent-browser E2E + 스크린샷
npx -y agent-browser open http://localhost:3000/
#   Intro → Test(13문항 자동진행) → Result 흐름, 320/375/768 스크린샷
npx -y agent-browser open "http://localhost:3000/result/?t=<encoded>"
#   공유 방문자 축 바 재현 확인

# 4) 빌드
pnpm build
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| 멀티축 배분이 특정 유형으로 쏠림 | 중 | 전수검증으로 16유형 분포 점검 후 가중치 재배분 |
| 공유 URL 구포맷(`ENFPe`) 해석 충돌 | 중 | 신포맷 길이 분기 + bare code 폴백. (pre-launch feat 브랜치라 구링크 영향 낮음) |
| 압축 카피가 원문 의미 훼손 | 중 | Task 2 배분표 리뷰에서 교정 |
| 단위테스트 부재로 채점 회귀 미검출 | 중 | Task 3 전수검증으로 1회 강하게 확인 (PRD 정책상 상시 단위테스트는 미도입) |

## Acceptance

- [ ] 13문항 2지선다, 각 선택지 대칭 멀티축 +1, 짧은 MZ 카피
- [ ] 축별 문항 수 전부 홀수 → 동점 0건(전수검증)
- [ ] all-A/all-B 앵커 유형 확정 및 E2E 기대값 갱신
- [ ] 공유 URL이 축 바를 정확히 재현
- [ ] CONTEXT.md/ADR-0002/PRD 동기화
- [ ] `pnpm build` 통과, E2E 흐름·스크린샷 정상
