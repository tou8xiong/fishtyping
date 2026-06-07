-- Add admin-controlled enable/disable flag to passages.
-- This is independent of the lifecycle `status` column so admins can hide
-- passages from the typing pool without altering generation/usage state.

ALTER TABLE "public"."passages"
  ADD COLUMN IF NOT EXISTS "enabled" boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "idx_passages_enabled"
  ON "public"."passages" USING btree ("enabled");
