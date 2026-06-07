# NEXON Lv.2 Gothic (Choice Row hook/body 전용)

원본: <https://github.com/fonts-archive/NEXONLv2Gothic> (제작: NEXON)

**라이선스 제약 — 서브셋 금지.** NEXON 서체 라이선스는 임베딩(서버 내 폰트
탑재)은 허용하지만 "수정·편집 등을 할 수 없으며 배포되는 형태 그대로
사용"을 요구한다. 따라서 이 폴더의 woff2는 **원본 그대로**여야 하며,
pyftsubset 등으로 서브셋한 파일로 교체하면 안 된다 (2026-06-07 확인,
눈누/넥슨 라이선스 본문).

- Regular(400) — Choice body 14px
- Bold(700) — Choice hook 17px
- 로드: `features/quiz/test-view.tsx`의 `next/font/local`, `preload: false`
    - `display: swap` — /test에서만 로드되고 폴백(Pretendard)에서 스왑된다.
