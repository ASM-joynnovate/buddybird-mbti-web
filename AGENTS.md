<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Product

**버디버드(BuddyBird) 앵무새 MBTI** — 앵무새 보호자를 버디버드 앱 설치로 유도하는
바이럴 모바일 웹. 보호자가 자기 앵무새를 관찰한 내용을 2지선다로 답하면 앵무새의
MBTI를 도출하고, 결과 카드를 인스타로 공유하게 해 앱 유입을 일으킨다.

- **플로우**: 안내(Intro) → 문항(Test, 2지선다·자동 진행) → 결과(Result) → 앱 설치(App CTA)
- **MBTI**: 정식 4축 16유형 / 축당 3문항(총 12문항)·동점 불가. 산출은 순수 함수로 분리.
- **사진**: 결과 페이지에서 카메라 촬영 + 갤러리 업로드. 사진은 서버 전송 없이 100% 클라이언트 처리.
- **공유**: 결과 카드를 Canvas로 합성 → Web Share API 네이티브 공유(미지원 시 다운로드 폴백). 인스타 직접 게시 API는 없음. 결과 히어로·공유 카드 모두 폴라로이드(사진 업로드 시 "내 앵무새 → 캐릭터" 두 장) 디자인 — ADR-0012.
- **앱 유도**: 딥링크 서비스(OneLink/Branch) + 스토어 링크. 링크는 단일 설정 상수로 관리.
- **데이터 백엔드 없음**: 사용자 데이터의 서버 저장·DB 없음(사진은 100% 클라이언트 처리). 분석은 클라이언트 이벤트 전송까지만 — 전송 백엔드는 지연 로딩 Firebase GA4(+Performance·Remote Config, ADR-0011). 배포는 Next standalone Node 컨테이너를 기존 Caddy 리버스 프록시 뒤에 두는 방식(ADR-0002).
- **모바일 우선**, reduced-motion·키보드·스크린리더 접근성 준수. 한국어 단일(MVP).

상세는 `.scratch/parrot-mbti/PRD.md` 참조.

## Folder structure — where new code goes (ADR-0010)

Dependency direction `app → features → shared/lib/content`, enforced by
`import/no-restricted-paths` in `eslint.config.mjs`. Capability zones are
generated from the `features/` folder listing, so most additions need no
config change — the one exception is marked below.

| You are adding…                           | Put it here                                                                                                                                                                                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A new screen/route                        | Thin server shell `app/<route>/page.tsx` (owns `metadata`) + `'use client'` view `features/<screen>/<screen>-view.tsx`. **Add the feature folder name to `COMPOSITION_FEATURES` in `eslint.config.mjs`** — screen compositions are the only features allowed to import other features. |
| A new capability (deck/share-like module) | `features/<name>/` — must NOT import other features (new folders are restricted automatically; no config change). Screen compositions compose it.                                                                                                                                      |
| A design-system primitive                 | `shared/ui/` — swappable unit together with the `@theme` tokens in `app/globals.css`.                                                                                                                                                                                                  |
| Background-world pieces                   | `shared/forest/` — swappable unit; mounted once in `app/layout.tsx`.                                                                                                                                                                                                                   |
| Motion vocabulary / analytics             | `shared/motion/` · `shared/analytics/`. `shared/*` must never import `features/` or `app/`.                                                                                                                                                                                            |
| Firebase SDK lifecycle                    | `shared/firebase/` — config, lazy client, bootstrap, Remote Config (ADR-0011). All runtime `firebase/*` imports stay inside this module; elsewhere import types only.                                                                                                                  |
| Pure domain logic                         | `lib/` — no React, no DOM, unit-testable in isolation.                                                                                                                                                                                                                                 |
| Copy, type metadata, asset paths          | `content/`.                                                                                                                                                                                                                                                                            |

A file holding multiple components/hooks splits into a folder with an
`index.ts` public entry (pattern: `features/deck/deck-overlay/`). Rationale
and rejected alternatives: `docs/adr/0010-feature-based-folder-structure.md`.

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
