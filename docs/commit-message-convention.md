# Commit Message Convention

이 프로젝트는 [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)을 따른다.
모든 커밋 메시지는 아래 규약을 준수해야 하며, 에이전트(Claude)도 커밋 생성 시 이 문서를 기준으로 한다.

> 참고: 현재 저장소에는 `commitlint`가 설치되어 있지 않아 자동 강제는 없다.
> 따라서 이 규약은 **사람과 에이전트가 수동으로 준수**한다. 추후 강제가 필요하면
> `commitlint` + husky `commit-msg` 훅으로 확장할 수 있다.

## 기본 구조

```
<type>[optional scope][optional !]: <description>

[optional body]

[optional footer(s)]
```

- 헤더(첫 줄)는 필수이며 `type: description` 형태를 반드시 포함한다.
- 본문(body)과 푸터(footer)는 선택이며, 각각 **빈 줄 하나**로 구분한다.
- 커밋 메시지는 영문으로 작성한다(코드베이스 관례).

## 타입 (type)

| Type       | 용도                                               | SemVer |
| ---------- | -------------------------------------------------- | ------ |
| `feat`     | 새로운 기능 추가                                   | MINOR  |
| `fix`      | 버그 수정                                          | PATCH  |
| `docs`     | 문서 변경만                                        | -      |
| `style`    | 포맷/세미콜론 등 동작에 영향 없는 변경             | -      |
| `refactor` | 기능 변화 없는 코드 구조 개선                      | -      |
| `perf`     | 성능 개선                                          | -      |
| `test`     | 테스트 추가/수정                                   | -      |
| `build`    | 빌드 시스템·외부 의존성 변경 (예: yarn, next 버전) | -      |
| `ci`       | CI 설정·스크립트 변경                              | -      |
| `chore`    | 그 외 잡무 (설정, 도구 등 소스/테스트 외)          | -      |
| `revert`   | 이전 커밋 되돌리기                                 | -      |

- `feat`, `fix`는 명세상 **필수 의미**를 가진다(아래 규칙 2·3).
- 나머지 타입은 Angular 관례에서 권장되는 집합이다(규칙 14: `feat`/`fix` 외 타입 사용 가능).

## 스코프 (scope)

- 코드베이스의 특정 영역을 나타내는 명사를 괄호로 감싼다. 예: `feat(auth):`, `fix(parser):`
- 선택 사항이다.

## 설명 (description)

- 콜론과 공백 뒤에 **즉시** 작성하는 짧은 요약.
- 명령형 현재 시제 권장. 예: `add`, `fix`, `remove` (not `added`, `fixes`).

## 본문 (body)

- 설명에서 빈 줄 하나 뒤에 시작한다.
- 자유 형식이며 여러 문단을 가질 수 있다. "무엇을·왜" 변경했는지 맥락을 적는다.

## 푸터 (footer)

- 본문에서 빈 줄 하나 뒤에 온다.
- 형식: `Token: value` 또는 `Token #value` (git trailer 관례).
- 토큰의 공백은 `-`로 대체한다. 예: `Reviewed-by`, `Refs`.
    - 예외: `BREAKING CHANGE`는 토큰으로 그대로 쓸 수 있다.

## 파괴적 변경 (BREAKING CHANGE)

두 가지 방법 중 하나로 표시한다(SemVer MAJOR에 대응).

1. **`!` 표기**: 타입/스코프 뒤 콜론 앞에 `!`. 이때 설명이 곧 파괴적 변경 내용이 된다.
    ```
    feat(api)!: send an email to the customer when a product is shipped
    ```
2. **푸터 표기**: `BREAKING CHANGE:`(대문자 필수) 뒤에 설명.

    ```
    feat: allow provided config object to extend other configs

    BREAKING CHANGE: `extends` key in config file is now used for extending other config files
    ```

- `!`를 쓰면 푸터의 `BREAKING CHANGE:`는 생략 가능하다.
- `BREAKING-CHANGE`는 푸터 토큰으로 쓸 때 `BREAKING CHANGE`와 동의어다.

## 예시

```
docs: correct spelling of CHANGELOG
```

```
feat(lang): add Polish language
```

```
fix: array parsing issue when multiple spaces were contained in string
```

```
feat!: drop support for Node 6
```

```
chore: set up prettier and eslint integration
```

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

## 명세 규칙 (verbatim, RFC 2119)

> 출처: <https://www.conventionalcommits.org/en/v1.0.0/#specification>

1. Commits MUST be prefixed with a type, which consists of a noun, `feat`, `fix`, etc., followed by the OPTIONAL scope, OPTIONAL `!`, and REQUIRED terminal colon and space.
2. The type `feat` MUST be used when a commit adds a new feature to your application or library.
3. The type `fix` MUST be used when a commit represents a bug fix for your application.
4. A scope MAY be provided after a type. A scope MUST consist of a noun describing a section of the codebase surrounded by parenthesis, e.g., `fix(parser):`
5. A description MUST immediately follow the colon and space after the type/scope prefix.
6. A longer commit body MAY be provided after the short description. The body MUST begin one blank line after the description.
7. A commit body is free-form and MAY consist of any number of newline separated paragraphs.
8. One or more footers MAY be provided one blank line after the body. Each footer MUST consist of a word token, followed by either a `:<space>` or `<space>#` separator, followed by a string value.
9. A footer's token MUST use `-` in place of whitespace characters, e.g., `Acked-by`. An exception is made for `BREAKING CHANGE`, which MAY also be used as a token.
10. A footer's value MAY contain spaces and newlines, and parsing MUST terminate when the next valid footer token/separator pair is observed.
11. Breaking changes MUST be indicated in the type/scope prefix of a commit, or as an entry in the footer.
12. If included as a footer, a breaking change MUST consist of the uppercase text BREAKING CHANGE, followed by a colon, space, and description.
13. If included in the type/scope prefix, breaking changes MUST be indicated by a `!` immediately before the `:`. If `!` is used, `BREAKING CHANGE:` MAY be omitted from the footer section, and the commit description SHALL be used to describe the breaking change.
14. Types other than `feat` and `fix` MAY be used in your commit messages, e.g., `docs: update ref docs.`
15. The units of information that make up Conventional Commits MUST NOT be treated as case-sensitive by implementors, with the exception of BREAKING CHANGE which MUST be uppercase.
16. BREAKING-CHANGE MUST be synonymous with BREAKING CHANGE, when used as a token in a footer.

## 에이전트 적용 지침

- 커밋 생성 시 위 구조와 타입 표를 따른다.
- 헤더는 영문, 명령형, 72자 내외로 간결하게.
- 동작 변경이 없으면 `style`/`refactor`/`chore`/`docs` 중 정확한 타입을 고른다.
- API/동작 호환성을 깨면 반드시 `!` 또는 `BREAKING CHANGE:` 푸터로 표시한다.
- 하나의 커밋은 하나의 논리적 변경만 담는다.
