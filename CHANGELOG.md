# Changelog

## [2.0.0](https://github.com/ASM-joynnovate/buddybird-mbti-web/compare/v1.0.0...v2.0.0) (2026-09-03)


### ⚠ BREAKING CHANGES

* **dex:** /dex is gone (404). The 16-type collection now lives in the deck overlay on the landing and result screens (ADR-0007), and the type detail modal is the DetailPopup trading card. No redirect is kept — the app is unreleased, so there are no inbound /dex links to honor.

### Features

* add 16 MBTI parrot character images ([0a52b71](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/0a52b71687073923e564bb9c56ec857fd81398f4))
* **analytics:** add Microsoft Clarity session recording fan-out (ADR-0015) ([b65014f](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/b65014f5c7e788c663ec778765b9c0554622f1c3))
* **analytics:** instrument site-wide interaction events ([30bd8e4](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/30bd8e4ae9bd213629860bbac74fe5607f533f8e))
* **analytics:** integrate Firebase GA4, Performance, and Remote Config ([43034b2](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/43034b2a71ad2c9a46a180d7bb0c9bde7a32d53e))
* **app-cta:** route to store by device, no deep-link service ([84cadea](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/84cadea2636c1d4e12d809e123b235a25632a91d))
* **brand:** rename service to 앵BTI in metadata and share copy ([668e21e](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/668e21e121c90ce09afcde820f65465d7a199afa))
* client analytics instrumentation ([#11](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/11)) ([133ce0c](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/133ce0c3082939cc60c63dee0b5f1c1249e60ef7))
* complete the result surface ([#07](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/07)) ([2827566](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/2827566545b315c6f4bc29be07ff43f74ccac8de))
* **content:** add per-type colors/match, axis colors, and question emojis ([4c9c913](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/4c9c9136c1fedef7d35ecb00ac73f86a702eb282))
* **decor:** replace blob backdrop with low-poly SVG leaf field ([a560aa9](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/a560aa97faa1eeaf364a8dca6d79438f9dc5fa6a))
* **decor:** replace SVG leaf backdrop with PNG forest background (ADR-0004) ([30783ea](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/30783eaa58573f34e1fded93790ee57033e513e3))
* **deploy:** add Docker image and Compose stack behind Caddy ([92fac84](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/92fac84e247199a4ae806455c2bd678f914dd443))
* **deploy:** switch to Next standalone output with healthz endpoint ([159873f](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/159873fdcef9c835b65be2be41aa2ddcf519d600))
* **design:** pivot to "동화숲 월드" design system ([d099918](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/d09991820aeaab62807ea146c6e49b399908768f))
* editorial-trail Test surface ([#03](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/03)) ([0a8db36](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/0a8db360cfecee447a406fa2e2e96a8a78dc34bc))
* **git:** add `.idea` in .gitignore ([ab95d54](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/ab95d5468e15f80380dbc1ef0921e01becd89c84))
* grass-parting question transition ([#05](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/05)) ([8fd5001](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/8fd50018f2a1dc1cb18edacc64e3ba67ada0c7e8))
* intro type carousel with app CTA ([#06](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/06)) ([12f81d7](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/12f81d7d52654030ed76f54070454dc72026bac9))
* **intro:** add active type card above peek row ([b99b62b](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/b99b62b6e42f674e1786eb98425bdbce66091644))
* **intro:** apply game UI pass with staggered Motion entrance ([362a6b7](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/362a6b75a9d7ce2c8a64205f37bd119d89a0605d))
* **intro:** center-fixed infinite peek carousel synced to active card ([01df5fc](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/01df5fc58da7cc13cefda36681485e3c8fc45bce))
* **intro:** peek tap-to-activate and carousel a11y ([579c554](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/579c5545e27fa3ecc629d802ad423a852e205158))
* **intro:** rebuild the landing as the BackStack hero with the deck overlay ([51d1060](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/51d10605d72aaae89128067fd59b76fa5beb8cb6))
* **intro:** route to /species before quiz start ([f558326](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/f558326b9d604aa214aa5e4c6289ec85845faac1))
* **intro:** split hero into three distributed groups ([f47a45d](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/f47a45d4887b064a317c2c06159296517a9cfb6c))
* MBTI compute engine and content data model ([#02](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/02)) ([6a913c4](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/6a913c4fbd3b31eed0c473ecf48e2553cddf063c))
* **mbti:** add species bias table and speciesOffsetChoice pure function ([3559c07](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/3559c0720a3b216d82243c8de9c860f910f549c9))
* **mbti:** switch to 13-question multi-axis weighted scoring ([ecc673f](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/ecc673f1c4bfb18a84ec79781ce1e0a6bdcc45c1))
* **modal:** animate TypeModal via AnimatePresence with game panel skin ([7f8e94e](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/7f8e94e39f943c3db3038ce7bc7b3a7743a78719))
* **motion:** add restrained idle motion to forest background ([1097812](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/1097812abd940881ee34e351f95c6195d43a0ab3))
* **motion:** adopt Motion via LazyMotion, add game UI tokens and CTA tracer ([2e91464](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/2e9146416f098c70193b0046d01e9d09b549b4bc))
* progressbar semantics and analytics finalization ([#11](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/11), [#13](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/13)) ([e4162ce](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/e4162ce10cd8aeb85aeeaffab7bdd57ef9c9b2ec))
* **quiz:** add species/speciesName fields to TestProgressState ([d3cc473](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/d3cc473378a2fdf4ad484d8cd9a94ab5b5236836))
* **quiz:** apply species offset and fix back-nav to /species ([8e9ad61](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/8e9ad61b6338360a5f33567b17ae62e674bd0663))
* **quiz:** present questions as a pinned quest sheet ([624df2c](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/624df2c9df9159fa611a9daffc79ec1541cc4583))
* **quiz:** split choice copy into hook/body and add stamp-slam tap feedback ([eec7c4c](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/eec7c4c7a432b33f454d08d3ab704774ec7ebe0f))
* **quiz:** update Q7 question text and choice copy ([fa5c3a5](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/fa5c3a532c957739f50cee32c3c4a8dbf000e48d))
* result photo capture and preview ([#08](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/08)) ([0f2632d](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/0f2632d4d63d1a5700b52bdf212b79f74e869936))
* result share card via Canvas and Web Share ([#09](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/09)) ([f28cb9f](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/f28cb9fe55649851f4331d754f1a86d3db47d1b8))
* **result:** adaptive polaroid hero + marker emphasis (ADR-0012/0013) ([6b1b4a0](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/6b1b4a0d25bd2dac13fe9927e24b1c4165bb5d00))
* **result:** apply game UI pass with Motion reveal, axis bars, confetti ([04a6b3f](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/04a6b3f48eb21c1bd5349916e419deede5acb2c3))
* **result:** drop "내 앵무새"/"캐릭터" tags from polaroid ([3c96b31](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/3c96b314f873428ce7f00054bf34c9d2e99b4386))
* **result:** rebuild the result as the kraft-paper report page ([4062269](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/4062269ee798acdd0929ca7cb7cf1f48af30fd56))
* **screens:** recreate intro, test, result, and dex from the design ([e55f06b](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/e55f06bc6a02b328cc096a70e3411b670a22e4ac))
* **seo:** add per-route metadata for intro and result pages ([0bbbf11](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/0bbbf1102dcd471c706b5591fa0f3baceb3e644d))
* shared foundations for result and share surfaces ([1192583](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/11925833cb9f5c36c45aca02b1d907009cf2c98a))
* **share:** download card directly on desktop ([2346cab](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/2346cab0e9bf84d598d8eec2bd4029c5416d8203))
* **share:** replace inline hint with transient toast ([16e12a6](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/16e12a6884f845e61e66086feed503877cd6b9f4))
* **species:** add species selection screen and analytics event ([735fe8c](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/735fe8ccfb9fad647b7a9631810c4451c273fc7a))
* **species:** search-cloud picker with guidance chip and locked CTA ([747c0a3](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/747c0a33309225c4ad653596c0db73075d36e3f7))
* **test:** apply game UI pass with Motion-driven quiz transitions ([ed90cc8](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/ed90cc85f5b92b816d7ea3eb44d50c809b634277))
* **test:** reskin the quiz with the v2 raised-block presentation ([edeefa1](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/edeefa1281da4f773b5914d7dec7e12dce1f45a9))
* theme intro and result surfaces with design system ([#03](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/03)) ([afb4e73](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/afb4e734ecf488594b6120b69d0971e71ec80222))
* **tokens:** adopt DESIGN.md v2 token values and faction palette ([5999736](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/5999736c9dfb2633798b756636d9bf9e6333f018))
* tropical jungle design system tokens and fonts ([#03](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/03)) ([cea3f8d](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/cea3f8daa00a309784b2846a81fe761359c92e2b))
* **ui:** add axis bars, confetti, match chip, and type modal ([db44fee](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/db44feee79dc0819d20aae1c236a29174b634b6d))
* **ui:** add the shared primitive layer under components/ui ([1a3de70](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/1a3de706acaa3383a15ebd073414e04a4b2281f5))
* **ui:** replace candy buttons with game button system ([399d6b2](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/399d6b29c327448767fdf385c8545a13731fd29f))
* **ui:** reskin cards, panels, and chips as forest game surfaces ([21b674d](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/21b674dc23fba86ca37db5bc5ba3f24e6d162d20))
* **ui:** unify foreground chrome on the orange action family ([32c7739](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/32c773921f27d853b57ffa9d90935f83cdacfa52))
* walking skeleton and agent-browser E2E harness ([#01](https://github.com/ASM-joynnovate/buddybird-mbti-web/issues/01)) ([79d40e0](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/79d40e0f4385575b8a81503306c4e2bdd7ccc9aa))


### Bug Fixes

* **a11y:** label the hidden camera/gallery file inputs ([464878f](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/464878f75695cbce992c9a6592ab60372614876f))
* **dex:** add cream scrim behind dex header for canopy readability ([1409207](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/14092071394747b1568ece6fc54aa2101207e570))
* **intro:** restore page scroll on short viewports ([b49a529](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/b49a529d766b202f591555ddcebea3ea1ff388de))
* **motion:** mount MotionProvider above the forest background ([22ab364](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/22ab3641d933d0f1e64102d73c976832af93246e))
* **test:** restore q-emoji clearance and make back button readable ([cdf9735](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/cdf9735be37aa110dcc0b3665b8dedbfc151c7bd))
* **ui:** apply design review feedback on green remnants, deck centering, hero sizing ([fc46c21](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/fc46c21ab45d88a1c5d5236027eabc76092f1d26))
* **ui:** cap the detail popup card at max-w-md ([4c6abe4](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/4c6abe45fab1da533917eab7b20c8830624a364c))
* **ui:** stop detail popup setup re-running on parent re-renders ([1be84d7](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/1be84d7ded5225e2a8a5c837ab1f49d38b66a1b9))


### Performance Improvements

* **images:** serve forest and parrot art through next/image ([9d4a604](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/9d4a604cb7426766b39891207a160468adc984cd))
* lift Lighthouse mobile performance from 62 to 93+ (h2) ([024b15a](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/024b15aa12c74af1fa6a29841bec20fb5df00d3c))
* **motion:** holo sweep on transform; memoize deck controller ([54c77d4](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/54c77d47e335d31f3f9649ff826ea259aa4ae7e3))


### Code Refactoring

* **dex:** remove the /dex route, TypeModal, and MatchChip ([e96142d](https://github.com/ASM-joynnovate/buddybird-mbti-web/commit/e96142de222fe0188c0695d659cc0a585da6f88a))
