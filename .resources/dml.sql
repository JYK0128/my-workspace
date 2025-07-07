INSERT INTO app_router(
  name, description, path, template, is_public, created_at, updated_at, metadata
)
VALUES (
  '홈',
  '',
  '/test',
  './test.tsx',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  '{"title": "TEST", "order": 5}'::jsonb 
);