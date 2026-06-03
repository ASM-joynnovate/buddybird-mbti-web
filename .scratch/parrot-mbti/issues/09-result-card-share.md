# 09 · 결과 카드 생성 + Web Share + 폴백

Status: ready-for-agent

## Parent

`.scratch/parrot-mbti/PRD.md`

## What to build

결과 카드를 합성하고 인스타로 공유하는 기능. 디자인 시스템(03)의 카드 템플릿을 따른다.

- **결과 카드 합성**: 클라이언트 Canvas로 정사각 카드(권장 1080×1080)를 만든다 — 사용자 사진 + 유형 + 카피 + 버디버드 브랜딩/CTA. 카드 룩은 03을 따르고 유형별로 달라질 수 있다.
- **Web Share API 네이티브 공유**: 카드 이미지를 `File`로 만들어 `navigator.share({ files })`로 공유한다. `navigator.canShare({ files })`로 사전 기능 탐지.
- **폴백**: 네이티브 파일 공유 미지원 시 카드 이미지 다운로드 + "인스타에 올려주세요" 안내.
- 웹은 인스타 피드 직접 게시 API가 없으므로 직접 게시는 시도하지 않는다(OS 공유 시트를 통한 사용자 주도 공유).

## Acceptance criteria

- [ ] 사용자 사진 + 유형 + 카피 + 브랜딩이 포함된 정사각 카드가 생성된다.
- [ ] `canShare({files})` 참이면 네이티브 공유 시트가 파일과 함께 호출된다.
- [ ] 미지원 환경에서 다운로드 + 안내 폴백이 동작한다.
- [ ] 사진/카드가 서버로 전송되지 않는다(클라이언트 전용).
- [ ] agent-browser E2E에서 `navigator.share`/`canShare`를 가로채(stub) 두 분기가 올바른 인자로 호출됨을 확인 + 카드 스크린샷.

## Blocked by

- 08 (`08-photo-capture-preview.md`)
- 03 (`03-visual-design-direction.md`) — 디자인 게이트
