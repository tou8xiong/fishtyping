# Supabase Schema Management

All database schema changes live here as migration files. Never edit the Supabase SQL editor directly — write a migration and push it.

## One-time setup

1. Get your project ref from the Supabase dashboard (URL: `https://supabase.com/dashboard/project/<project-ref>`).
2. Link this folder to your remote project:
   ```bash
   npm run db:link -- --project-ref <project-ref>
   ```
   It will prompt for your database password (Dashboard → Settings → Database → Connection string).
3. Import the existing remote schema as a baseline migration:
   ```bash
   npm run db:pull
   ```
   This creates `supabase/migrations/<timestamp>_remote_schema.sql` matching your current production schema.

## Day-to-day workflow

### Create a new migration

```bash
npm run db:new add_user_streak_column
```

This creates `supabase/migrations/<timestamp>_add_user_streak_column.sql`. Write your SQL inside it, e.g.:

```sql
alter table public.users add column streak_days int not null default 0;
```

### Apply pending migrations to remote

```bash
npm run db:push
```

The CLI runs only migrations that haven't been applied yet. Safe to run repeatedly.

### Check what's applied vs pending

```bash
npm run db:list
```

### See what changed on remote (if someone edited via dashboard)

```bash
npm run db:diff
```

## Available scripts

| Command | What it does |
|---------|-------------|
| `npm run db:link` | Link folder to a remote Supabase project |
| `npm run db:pull` | Generate a migration from current remote schema |
| `npm run db:new <name>` | Create a new empty migration file |
| `npm run db:push` | Apply pending migrations to remote |
| `npm run db:diff` | Show schema drift between local and remote |
| `npm run db:list` | List migration status (applied / pending) |

## Notes

- Migration filenames are timestamped — never rename them after pushing.
- If you edited the dashboard directly, run `db:pull` to generate a migration that captures the change, then commit it.
- The `database_setup.sql` at the repo root is historical (Firebase Auth migration) — kept for reference, not used by the CLI.
