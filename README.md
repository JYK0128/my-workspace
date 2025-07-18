# my-workspace

## 소개

이 프로젝트는 모노레포 구조로, 여러 앱과 패키지를 포함하고 있습니다.

- Express + tRPC + React 모노레포 구성
- Kysely 기반 Dynamic query 구현
- zod + tRPC 기반 데이터 검증 및 타입 공유
- Tanstack 라이브러리 기반 React 프로젝트 구조화
- Shadcn 기반 UI 체계화

## 폴더 구조

```text
apps/               # 서버와 웹 애플리케이션
  server              - Express + tRPC 서버
  web                 - React 웹 애플리케이션
packages/           # 공통 패키지 및 유틸리티
  eslint-config       - eslint 공통설정 라이브러리(web/server)
  sample              - sample 라이브러리
  trpc                - trpc 라이브러리(web/server)
  typescript-config   - typescript 공통설정 라이브러리(web/server)
```

## 설치 방법

```bash
yarn
```

## 실행 방법(개발)

```bash
yarn workspace @apps/web dev
yarn workspace @apps/server dev
yarn workspace @packages/ui storybook
```

## 실행 방법(빌드)

```bash
# build 후 pm2 restart으로 갱신!
yarn workspace @apps/server build:{env}
# build만으로 갱신!
yarn workspace @apps/web build:{env}
# 빌드 결과물로 운영 시 package.json 수정 필요!
yarn workspace @packages/ui build-storybook
```

## 환경변수 암호화

```bash
# 파일
dotenvx encrypt -f .env*
dotenvx set HELLO "production (encrypted)" -f .env.production
```
