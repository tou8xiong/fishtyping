-- Drop ai_prompts and generation_jobs tables (unused).
-- The corresponding TypeScript types and helper functions were also removed
-- from src/lib/supabase/types.ts and src/lib/supabase/db.ts.

drop table if exists "public"."ai_prompts" cascade;
drop table if exists "public"."generation_jobs" cascade;
