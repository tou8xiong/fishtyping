


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_prompts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "template" "text" NOT NULL,
    "category" character varying(100),
    "difficulty" character varying(50),
    "version" integer DEFAULT 1,
    "is_active" boolean DEFAULT true,
    "success_rate" numeric(5,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_prompts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."generation_jobs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "status" character varying(50) DEFAULT 'pending'::character varying,
    "priority" integer DEFAULT 0,
    "language" "text" DEFAULT 'english'::"text",
    "difficulty" character varying(50),
    "length" character varying(50),
    "theme" character varying(100),
    "challenge_type" character varying(50),
    "attempts" integer DEFAULT 0,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone,
    CONSTRAINT "generation_jobs_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying])::"text"[])))
);


ALTER TABLE "public"."generation_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."passage_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "text",
    "passage_id" "uuid",
    "attempted_at" timestamp with time zone DEFAULT "now"(),
    "wpm" integer,
    "accuracy" numeric(5,2),
    "duration_ms" integer,
    "difficulty" "text",
    "challenge_type" "text",
    "theme" "text"
);


ALTER TABLE "public"."passage_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."passages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "content" "text" NOT NULL,
    "language" "text" DEFAULT 'english'::"text",
    "difficulty" character varying(50) DEFAULT 'intermediate'::character varying,
    "length" character varying(50) DEFAULT 'medium'::character varying,
    "status" character varying(50) DEFAULT 'ready'::character varying,
    "generated_by" "text" DEFAULT 'ai'::"text",
    "ai_model" character varying(50),
    "ai_prompt_id" "uuid",
    "used_count" integer DEFAULT 0,
    "word_count" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "passages_difficulty_check" CHECK ((("difficulty")::"text" = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying, 'expert'::character varying])::"text"[]))),
    CONSTRAINT "passages_generated_by_check" CHECK (("generated_by" = ANY (ARRAY['manual'::"text", 'ai'::"text"]))),
    CONSTRAINT "passages_language_check" CHECK (("language" = ANY (ARRAY['english'::"text", 'lao'::"text"]))),
    CONSTRAINT "passages_length_check" CHECK ((("length")::"text" = ANY ((ARRAY['short'::character varying, 'medium'::character varying, 'long'::character varying])::"text"[]))),
    CONSTRAINT "passages_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['generating'::character varying, 'ready'::character varying, 'in_use'::character varying, 'archived'::character varying])::"text"[])))
);


ALTER TABLE "public"."passages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "original_price" numeric(10,2),
    "image_url" "text" NOT NULL,
    "category" "text" NOT NULL,
    "rating" numeric(3,2) DEFAULT 0.0,
    "review_count" integer DEFAULT 0,
    "in_stock" boolean DEFAULT true,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "text" NOT NULL,
    "username" "text",
    "display_name" "text",
    "avatar_url" "text",
    "preferred_language" "text" DEFAULT 'english'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_prompts"
    ADD CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generation_jobs"
    ADD CONSTRAINT "generation_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."passage_history"
    ADD CONSTRAINT "passage_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."passages"
    ADD CONSTRAINT "passages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_generation_jobs_status" ON "public"."generation_jobs" USING "btree" ("status");



CREATE INDEX "idx_passage_history_user" ON "public"."passage_history" USING "btree" ("user_id");



CREATE INDEX "idx_passages_status_difficulty" ON "public"."passages" USING "btree" ("status", "difficulty");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category");



CREATE INDEX "idx_products_created_at" ON "public"."products" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_products_in_stock" ON "public"."products" USING "btree" ("in_stock");



CREATE INDEX "idx_products_name" ON "public"."products" USING "btree" ("name");



CREATE INDEX "idx_products_price" ON "public"."products" USING "btree" ("price");



CREATE INDEX "users_created_at_idx" ON "public"."users" USING "btree" ("created_at");



CREATE INDEX "users_username_idx" ON "public"."users" USING "btree" ("username");



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."passages"
    ADD CONSTRAINT "passages_ai_prompt_id_fkey" FOREIGN KEY ("ai_prompt_id") REFERENCES "public"."ai_prompts"("id");



CREATE POLICY "Allow authenticated delete" ON "public"."products" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated insert" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated update" ON "public"."products" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Public can read products" ON "public"."products" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Public profiles are viewable by everyone" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can insert passage history" ON "public"."passage_history" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert their own profile" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (true);



CREATE POLICY "Users can view passage history" ON "public"."passage_history" FOR SELECT USING (true);



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (true);



ALTER TABLE "public"."ai_prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."generation_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."passage_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."ai_prompts" TO "anon";
GRANT ALL ON TABLE "public"."ai_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_prompts" TO "service_role";



GRANT ALL ON TABLE "public"."generation_jobs" TO "anon";
GRANT ALL ON TABLE "public"."generation_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."generation_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."passage_history" TO "anon";
GRANT ALL ON TABLE "public"."passage_history" TO "authenticated";
GRANT ALL ON TABLE "public"."passage_history" TO "service_role";



GRANT ALL ON TABLE "public"."passages" TO "anon";
GRANT ALL ON TABLE "public"."passages" TO "authenticated";
GRANT ALL ON TABLE "public"."passages" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































