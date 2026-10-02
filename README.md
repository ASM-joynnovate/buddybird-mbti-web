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

운영 ECS task에는 Secrets Manager 또는 SSM secret 참조로 `OPENROUTER_API_KEY`를 런타임 주입해야 합니다.
키를 Docker build args나 NEXT_PUBLIC 변수에 넣지 않습니다. upstream 요청 제한 시간은 120초이므로
운영 프록시의 응답 대기 시간도 확인해야 합니다. 키가 없으면 합성 API는 503을 반환합니다.
별도 앵무새 판별이나 자동 재시도는 없으며, 모델이 이미지를 반환하지 않으면 재시도를 안내합니다.
