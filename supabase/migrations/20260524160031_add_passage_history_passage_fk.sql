-- Add the missing foreign key from passage_history.passage_id -> passages.id
-- so PostgREST can resolve `passages!inner(...)` embeddings in filters.
-- Existing rows whose passage_id no longer matches an existing passage get
-- nulled out instead of blocking the constraint.

update "public"."passage_history" ph
   set "passage_id" = null
 where "passage_id" is not null
   and not exists (
     select 1
       from "public"."passages" p
      where p."id" = ph."passage_id"
   );

alter table "public"."passage_history"
  add constraint "passage_history_passage_id_fkey"
  foreign key ("passage_id") references "public"."passages"("id")
  on delete set null;

create index if not exists "idx_passage_history_passage"
  on "public"."passage_history" ("passage_id");
