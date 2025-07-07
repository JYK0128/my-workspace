DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;

-- 방명록
CREATE TABLE if NOT EXISTS guestbook (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  nickname            TEXT        NOT NULL,
  comment             TEXT        NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  deleted_at          TIMESTAMP,
  metadata            jsonb,

  PRIMARY KEY(id)
);

-- 유저
CREATE TABLE IF NOT EXISTS app_user (
  id                  UUID        NOT NULL,
  blocked_until       TIMESTAMP,
  last_login_at       TIMESTAMP,
  last_logout_at      TIMESTAMP,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  deleted_at          TIMESTAMP,
  metadata            jsonb,

  PRIMARY KEY(id)
);

-- 라우터
CREATE TABLE if NOT EXISTS app_router (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  path                TEXT        NOT NULL,
  template            TEXT        NOT NULL,
  is_public           BOOLEAN     NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  deleted_at          TIMESTAMP,
  metadata            jsonb,

  PRIMARY KEY(id)
);

-- 기능
CREATE TABLE if NOT EXISTS app_action (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  path                TEXT        NOT NULL,
  router_id           BIGINT      NOT NULL,
  is_public           BOOLEAN     NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  deleted_at          TIMESTAMP,
  metadata            jsonb,

  PRIMARY KEY(id),
  FOREIGN KEY(router_id) REFERENCES app_router(id)
);

-- 유저 로그
CREATE TABLE IF NOT EXISTS user_log (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  level               TEXT        NOT NULL,
  details             TEXT,
  user_id             UUID,
  action              TEXT        NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  user_ip             TEXT        NOT NULL,
  user_agent          TEXT        NOT NULL,
  metadata            jsonb,

  PRIMARY KEY(id),
  FOREIGN KEY(user_id) REFERENCES app_user(id)
);

-- AI 제공자
CREATE TABLE IF NOT EXISTS ai_provider (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  country             TEXT        NOT NULL,
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  metadata            jsonb,

  PRIMARY KEY(id)
);

-- AI 모델
CREATE TABLE IF NOT EXISTS ai_model (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  provider_id         BIGINT      NOT NULL,
  category            TEXT        NOT NULL, 
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  metadata            jsonb,

  PRIMARY KEY(id),
  FOREIGN KEY(provider_id) REFERENCES ai_provider(id)
);

-- 유저 정의 AI모델
CREATE TABLE IF NOT EXISTS user_ai_model (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  user_id             UUID        NOT NULL,
  model_id            BIGINT      NOT NULL,
  api_endpoint        TEXT        NOT NULL,
  api_key_encrypted   TEXT        NOT NULL,
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,

  PRIMARY KEY(id),
  FOREIGN KEY(user_id) REFERENCES app_user(id)
);

-- 채팅방
CREATE TABLE IF NOT EXISTS channel (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  name                TEXT        NOT NULL,
  description         TEXT        NOT NULL,
  password_encrypted  TEXT        NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  deleted_at          TIMESTAMP,

  PRIMARY KEY(id)
);

-- 채팅방 참여자
create table if not EXISTS channel_participant (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  channel_id          BIGINT      NOT NULL,
  user_id             UUID        NOT NULL,
  is_master           BOOLEAN     NOT NULL,
  muted_until         TIMESTAMP,
  banned_until        TIMESTAMP,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  deleted_at          TIMESTAMP,
  metadata            jsonb,

  PRIMARY KEY(id),
  FOREIGN KEY(channel_id) REFERENCES channel(id),
  FOREIGN KEY(user_id) REFERENCES app_user(id)
);

-- 채팅방 히스토리
CREATE TABLE IF NOT EXISTS channel_history (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY,
  channel_id          BIGINT      NOT NULL,
  user_id             UUID        NOT NULL,
  model_id            BIGINT      NOT NULL,
  role                TEXT        NOT NULL,
  message             TEXT        NOT NULL,
  created_at          TIMESTAMP   NOT NULL,
  updated_at          TIMESTAMP   NOT NULL,
  metadata            jsonb,

  PRIMARY KEY(id),
  FOREIGN KEY(channel_id) REFERENCES channel(id),
  FOREIGN KEY(user_id) REFERENCES app_user(id),
  FOREIGN KEY(model_id) REFERENCES ai_model(id)
);

