# 영일전기

Quasar·Vue 기반 한국어/영어 용접기 회사 사이트.

## 개발

.nvmrc의 Node 버전과 package.json의 npm 버전을 사용한다.

```sh
npm ci
npm run serve
```

## 검증

```sh
npm run build
npm run lint
npm test
npm run format:check
npx playwright install chromium
npm run test:e2e
npm audit
```

## 배포

GitHub Actions에서 main 변경을 빌드해 S3에 업로드하고 CloudFront 캐시를 무효화한다. 경로 함수와 보안 정책 설정은 infra/cloudfront/README.md를 참고한다.
