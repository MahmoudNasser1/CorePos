# Backend Environment Variables

## Frontend (`.env.local`)
- `BACKEND_API_URL=http://localhost:4000`
- `BACKEND_FLAG_ONBOARDING=0`
- `BACKEND_FLAG_FINANCE=0`
- `BACKEND_FLAG_REPORTS=0`
- `BACKEND_FLAG_ADMIN=0`

## Backend (`apps/backend/.env`)
- `BACKEND_PORT=4000`
- `JWT_SECRET=change-me`
- `DATABASE_URL=postgres://pos:pos@localhost:5433/pos`
- `REDIS_URL=redis://localhost:6379`
- `S3_ENDPOINT=http://localhost:9000`
- `S3_ACCESS_KEY=minio`
- `S3_SECRET_KEY=miniopass`
- `S3_BUCKET=corepos`

## Notes
- Keep all backend feature flags disabled initially.
- Enable one domain at a time after parity tests pass.
- Never expose backend secrets to frontend `NEXT_PUBLIC_*`.
