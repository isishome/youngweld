# S3·CloudFront 설정

앱은 Web History 라우팅을 사용한다. CloudFront 함수는 알려진 앱 경로의 요청 URI를 `/index.html`로 내부 변환하고, 브라우저에는 `/company` 같은 경로를 유지한다. CloudFront의 기본 루트 객체는 하위 경로에 자동 적용되지 않는다.

## GitHub Actions로 적용

기존 `aws_cicd` 환경의 AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, CLOUDFRONT_DISTRIBUTION_ID를 그대로 사용한다. `.github/workflows/cloudfront.yml`은 수동 실행한다. 해시 라우팅에서 처음 전환할 때는 아래 전환 순서를 따른다.

1. `apply=false`로 실행해 조회 결과와 복구 필드를 보관한다. 이 단계는 AWS 리소스를 변경하지 않는다.
2. 다른 viewer-request 함수·Lambda@Edge·응답 정책이 있으면 자동 교체를 거부한다. 기존 동작을 검토하고 통합해야 한다.
3. 계획이 적합하면 `apply=true`로 실행한다. 함수 DEVELOPMENT 작성 → AWS TestFunction 검증 → 배포 전용 응답 정책 생성/갱신 → 함수 게시 → ETag 조건부 배포 설정 갱신 → Deployed 대기 → 무효화 순서로 수행한다.
4. 기본 캐시 동작에만 적용한다. 별도 자산 동작과 기존 캐시 정책은 보존하므로 아래 TTL·추가 동작 확인은 따로 수행한다.

필요한 추가 IAM 작업은 GetDistributionConfig, ListFunctions, DescribeFunction, CreateFunction, UpdateFunction, TestFunction, PublishFunction, ListResponseHeadersPolicies, GetResponseHeadersPolicy, CreateResponseHeadersPolicy, UpdateResponseHeadersPolicy, UpdateDistribution, GetDistribution, CreateInvalidation이다. 기존 S3 배포용 자격증명에 이 권한이 없으면 workflow가 실패하며 자동으로 권한을 확장하지 않는다.

적용 중 일부 단계가 실패하면 새 함수·정책이 미연결 상태로 남을 수 있다. 같은 배포 ID로 다시 실행하면 해당 리소스를 재사용한다. 이미 연결된 자체 함수·정책 갱신은 배포 설정 갱신 전에도 전파될 수 있으므로 이전 Git 버전과 출력한 복구 필드를 보관한다. 오리진의 사용자 정의 요청 헤더는 로그에 출력하지 않는다.

## 적용 순서

1. 현재 배포 설정과 ETag를 `aws cloudfront get-distribution-config --id <배포-ID>`로 보관한다. 기존 Function/Lambda@Edge 연결과 응답 정책을 확인한다. 기존 연결을 덮어쓰지 말고 로직을 합친다.
2. 최초 전환은 CloudFront 함수 변경을 먼저 반영하고 Deployed 상태와 직접 경로의 HTML 응답을 확인한 뒤 Web History 앱을 배포한다. 기존 hash 리디렉션 함수와 새 앱을 함께 운영하면 새로고침 시 리디렉션이 발생하므로 순서를 지킨다. main push는 사이트 자동 배포를 시작하므로 함수 변경과 앱 변경을 단계별로 반영한다.
3. `viewer-request.js`를 CloudFront Function으로 생성한다. 런타임은 `cloudfront-js-2.0`, 이벤트는 기본 캐시 동작의 **viewer-request**다. 개발 단계에서 아래 사례를 Test Function으로 확인한 뒤 Publish하고 연결한다. 알 수 없는 경로·이미지·PDF는 원본 요청을 유지한다.
4. `response-headers-policy.json`을 `aws cloudfront create-response-headers-policy --cli-input-json file://infra/cloudfront/response-headers-policy.json`로 생성한다. 이미 동일한 이름의 정책이 있으면 ID·ETag를 조회해 update API를 사용한다. 반환된 ID를 기본 동작과 별도 자산 동작의 Response headers policy에 연결한다.
5. 기본 루트 객체를 `index.html`, Viewer protocol policy를 `redirect-to-https`, 압축을 활성화한다. HTML의 최소 TTL은 0이어야 한다. `/assets/*`는 긴 TTL, 변경 가능한 `/static/*`는 최대 하루를 사용한다. 기존 캐시 정책의 최소 TTL이 원본 `no-cache`를 무시하지 않는지 확인한다.
6. 알려진 앱 경로 처리가 확인되면 모든 403/404를 HTML 200으로 변환하던 Custom error response가 있는지 확인하고 제거한다. 실제 존재하지 않는 파일은 오류로 남겨야 한다. S3 REST origin의 누락 객체는 권한 설정에 따라 403 또는 404일 수 있다.
7. 배포 상태가 Deployed가 된 후 `/*`를 무효화하고 아래 운영 검증을 수행한다.

일반 배포 workflow는 사이트 파일만 배포한다. CloudFront 함수·정책 연결은 위 수동 실행 workflow 또는 운영 설정 검토 후 아래 AWS CLI로 별도 적용한다. 전체 DistributionConfig 예제를 그대로 덮어쓰지 않는다. 수동 생성한 정책 이름과 자동화의 배포 ID별 정책 이름은 다르므로 두 방식을 혼용하지 않는다.

## 검증

- `/` → 200 HTML.
- `/company`, `/company/` → 200 HTML, 주소는 `/company`로 정규화되며 회사 페이지 표시.
- `/product/submerged/YESAWCG-001/` → 제품 상세; 새로고침 후 동일.
- `/support/?tag=a&tag=b` → 반복 쿼리 보존.
- `/#/company` → 진입 시 `/company`로 변환. 내부 링크는 모두 path 주소를 사용.
- 존재하는 PDF·이미지 → 올바른 Content-Type. 없는 JS·이미지 → 403/404, HTML 200 금지.
- HTML·자산의 Cache-Control 확인. HTML은 재검증, 해시 자산은 immutable.
- HTML 응답에 CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy 확인.
- 브라우저 콘솔의 CSP 위반 없음, 언어·테마·제품·PDF·Google 지도 확인.
- PageSpeed, Nu HTML Checker, Observatory를 운영 URL에 다시 실행한다. 로컬 검사 결과가 운영 점수를 보장하지 않는다.

## 정책 판단과 복구

CSP의 `style-src 'unsafe-inline'`은 Quasar의 동적 스타일 때문에 필요하다. 스크립트는 자체 출처만 허용하며 eval은 허용하지 않는다. 글꼴은 자체 제공하고 지도 프레임만 `https://www.google.com`에 허용한다. `v-html` 데이터는 저장소의 검토된 제품·연혁 문구만 허용한다.

HSTS는 해당 호스트에만 1년을 적용하며 확인하지 않은 하위 도메인과 preload는 포함하지 않는다. 이미 수신된 HSTS는 정책 제거만으로 브라우저에서 즉시 취소되지 않는다. HTTPS 장애 복구가 가능해야 한다.

장애 시 이전 함수·헤더 정책 연결을 백업값으로 복원하고 이전 HTML을 다시 업로드한 뒤 무효화한다. 배포는 새 자산을 먼저 업로드하고 HTML을 마지막에 교체하며 이전 해시 자산을 즉시 삭제하지 않는다. 오래된 자산 정리는 별도 보존기간 정책으로 수행한다.

최소 배포 권한은 대상 버킷의 ListBucket·PutObject와 해당 배포의 CreateInvalidation이다. 장기 액세스 키를 OIDC 역할로 전환할 경우 먼저 GitHub environment와 AWS trust policy를 구성한 후 workflow의 인증 단계를 교체한다.
