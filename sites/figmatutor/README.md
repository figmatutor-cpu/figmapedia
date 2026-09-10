# Figmatutor 소개 사이트

`https://figmatutor.info`에 발행하는 독립 Next.js 정적 사이트입니다.

- Vercel 프로젝트: `yiseos-projects-5e4c1781/figmatutor`
- 실무자료실: `https://huddling.ai/`
- 커뮤니티: `https://huddling.club/`
- 문의: `yiseo@figmatutor.info`

## 수정과 검증

공유 화면 원본은 루트 `src/components/home/`, 강의 데이터 원본은 `figmatutor_lectures.csv`입니다. 이 폴더의 `src/`와 `public/`은 아래 준비 스크립트로 갱신합니다.

프로젝트 루트에서:

```sh
python3 scripts/prepare-figmatutor.py
npm ci --prefix sites/figmatutor
npm run build --prefix sites/figmatutor
npm run dev --prefix sites/figmatutor
```

개발 서버는 `http://localhost:3001`에서 실행됩니다. 이 사이트는 Notion, Supabase, 외부 폰트 다운로드나 비공개 환경변수가 필요하지 않습니다.

## 배포

아래 명령은 `sites/figmatutor` 폴더에서 실행합니다. 루트의 `figmapedia` 앱과는 별도 프로젝트입니다.

```sh
vercel link --yes --project figmatutor --scope yiseos-projects-5e4c1781
vercel deploy --prod --skip-domain --yes
vercel inspect <deployment-url>
vercel promote <deployment-url> --yes
```

첫 배포는 도메인을 전환하지 않고 생성합니다. 빌드 결과를 확인한 뒤 promote로 `figmatutor.info`와 `www.figmatutor.info`에 반영합니다. CLI 배포이므로 원격 저장소의 기존 자동 배포 설정은 별도 확인이 필요합니다.
