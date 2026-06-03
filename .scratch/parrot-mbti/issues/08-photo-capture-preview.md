# 08 · 사진 촬영 + 미리보기

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

결과 페이지에서 사용자의 앵무새 사진을 입력받는 기능. 디자인 시스템(03)을 준수한다.

- **카메라 직접 촬영**과 **갤러리/파일 업로드**를 모두 지원한다.
- 카메라 미지원·권한 거부 시 갤러리 업로드로 자연스럽게 폴백한다.
- 선택/촬영한 사진이 결과 카드에 어떻게 들어갈지 **미리보기**를 제공한다(다시 찍기/다시 선택 가능).
- 사진은 **서버로 전송·저장하지 않고 100% 클라이언트에서 처리**한다(개인정보 보호).

실제 카드 합성과 공유는 09에서 처리한다. 이 슬라이스는 입력과 미리보기까지.

## Acceptance criteria

- [ ] 카메라 촬영과 갤러리 업로드 둘 다로 사진을 넣을 수 있다.
- [ ] 카메라 권한 거부/미지원 시 업로드 경로로 폴백된다.
- [ ] 선택한 사진의 카드 내 배치 미리보기가 보이고, 다시 선택할 수 있다.
- [ ] 사진이 네트워크로 전송되지 않는다(클라이언트 전용).
- [ ] 디자인 시스템(03) 준수 + agent-browser E2E(파일 업로드 경로)로 확인.

## Blocked by

- 07 (`07-result-report-page.md`)

## Comments

- 구현 완료 (branch `feat/parrot-mbti-foundation`). `components/photo-input.tsx` + `lib/photo/use-photo-source.ts` 카메라/갤러리 입력·카드 배치 미리보기, 100% 클라이언트(objectURL 라이프사이클). 검증: `yarn type-check && yarn lint && yarn build && yarn e2e:run` 전부 통과.
