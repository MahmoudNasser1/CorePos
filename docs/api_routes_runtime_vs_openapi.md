# Runtime routes vs OpenAPI

- **Runtime log**: `/home/eldrwal/.cursor/projects/home-eldrwal-Desktop-Pos-Sahl/terminals/672199.txt`
- **OpenAPI**: `apps/backend/openapi.json`

- **Runtime routes**: 54
- **OpenAPI routes**: 54
- **Only in OpenAPI**: 11
- **Only in Runtime**: 11

## Notes

- Swagger/OpenAPI يستخدم صيغة `{id}` للـ path params.
- Nest runtime logs غالبًا تظهر `:id`. ده **مش اختلاف حقيقي** في المسارات، مجرد فرق تمثيل.

## Only in OpenAPI (missing at runtime)

- (هذه القائمة ناتجة فقط من اختلاف `{id}` vs `:id` — لا تعتبر missing فعليًا)

## Only in Runtime (missing in OpenAPI)

- (هذه القائمة ناتجة فقط من اختلاف `{id}` vs `:id` — لا تعتبر missing فعليًا)
