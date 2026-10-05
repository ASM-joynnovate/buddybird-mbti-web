This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## BB-177 사진 합성

`.env.local`에 서버 전용 `OPENROUTER_API_KEY`를 설정하고 `yarn dev`로 실행합니다.
결과 페이지에서 JPEG·PNG·WebP 사진(최대 10MB)을 선택하면 별도 확인 단계 없이 합성을 시작합니다.
OpenRouter의 `google/gemini-3.1-flash-lite-image`에 사용자 사진과 결과 캐릭터를 순서대로 전달합니다.
합성 중에는 기존 MBTI 캐릭터를 표시하고 완료되면 합성 이미지로 교체합니다. 완료 화면에는 사진 변경·재촬영·제거 메뉴 없이 카드 공유를 제공합니다.
생성 이미지는 화면과 공유 카드에 사용하며 서버 저장소에 보관하지 않습니다. 새로고침하면 사라집니다.

운영 키는 GitHub `prod` environment secret `OPENROUTER_API_KEY`에 둡니다. 배포 워크플로가 ECS task definition 환경변수로 주입합니다.
키를 Docker build args나 NEXT_PUBLIC 변수에 넣지 않습니다. upstream 요청 제한 시간은 120초이므로
운영 프록시의 응답 대기 시간도 확인해야 합니다. 키가 없으면 합성 API는 503을 반환합니다.
별도 앵무새 판별이나 자동 재시도는 없으며, 모델이 이미지를 반환하지 않으면 재시도를 안내합니다.

## BB-421 국가별 언어

CloudFront의 `CloudFront-Viewer-Country`가 `KR`이면 한국어, 다른 국가이면 영어로 표시합니다.
국가 헤더가 없거나 잘못된 값/`XX`이면 기존 한국어로 표시합니다. 브라우저 언어는 판단에 사용하지 않습니다.
서버 HTML, 메타데이터, 질문·결과, 이미지 공유 카드에 같은 언어를 적용합니다.
페이지는 `src/app/[locale]` 아래에 언어별로 정적 생성하고, `src/proxy.ts`가 국가에 맞는 쪽으로 내부 rewrite합니다.
요청마다 렌더링하지 않으며, 언어 없는 주소는 접속 국가의 언어로 보입니다(`/test` → 내부 `/en/test`).
기존 URL과 결과 점수는 유지합니다.

검색 색인을 위해 영어판은 `/en`, `/en/test`, `/en/species`, `/en/result`로도 공개합니다.
언어 없는 주소는 한국어 URL이며, 크롤러(`userAgent().isBot`)에는 접속 국가와 무관하게 한국어를 응답합니다.
canonical은 언어별 URL을 가리키고, 페이지와 `sitemap.xml`에 `ko`/`en`/`x-default` hreflang을 넣습니다.
`/en`으로 들어온 사용자는 이동할 때도 `/en` 주소를 유지합니다(`src/lib/i18n/path.ts`).
링크 미리보기도 크롤러가 가져가므로 영어 화면의 링크 복사는 `/en/result?t=…`를 복사합니다.
한국어 화면에서 복사한 `/result?t=…`는 받은 사람의 접속 국가 언어로 보입니다.
번역은 `src/lib/i18n/en.json`, 한국어 원문은 기존 소스에 있습니다. Jua와 NEXON 폰트를 그대로 사용합니다.

**배포 선행 조건:** 현재 인프라 코드의 `Managed-AllViewer`는 CloudFront가 생성하는 국가 헤더를 전달하지 않습니다.
`docs/bb-421-cloudfront.patch`를 `aws-infra` 저장소에 적용하고 MBTI CDN의 origin request policy를
`Managed-AllViewerAndCloudFrontHeaders-2022-06`으로 배포해야 합니다.
MBTI DNS가 CDN을 경유하는지도 확인해야 합니다. 이 변경을 적용하지 않으면 모든 접속에 한국어가 표시됩니다.
HTML/RSC/API의 `CachingDisabled` 정책과 정적 파일/이미지 캐시 정책은 유지합니다.
같은 주소가 국가별로 다른 언어를 응답하고 정적 페이지는 `s-maxage`를 내려보내므로, 기본 behavior에 캐시를 켜면 언어가 섞입니다.
([AWS origin request policy 문서](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html))

검증: `node scripts/check-i18n.mjs`로 국가 선택과 콘텐츠 번역을 검사합니다.
프로덕션 서버 실행 후 `node scripts/check-i18n.mjs http://localhost:3000`을 실행하면
KR/US/JP별 페이지 언어·정적 렌더링·API 오류 문구도 검사합니다. 브라우저 테스트에서는 해당 국가 헤더를 지정합니다.
