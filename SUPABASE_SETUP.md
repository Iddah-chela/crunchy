# Supabase Database Setup

Create these tables in your Supabase project:

## 1. Questions & Verses (Offline-First Q&A)

```sql
-- Questions table
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  question_id text not null unique, -- e.g., 'q1', 'q2', etc.
  question_text text not null,
  category text,
  status text not null default 'published', -- published, pending, archived
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Verses table
create table if not exists verses (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references questions(id) on delete cascade,
  reference text not null, -- e.g., 'John 3:16'
  text text not null,
  theme text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table questions enable row level security;
alter table verses enable row level security;

-- Public read access
create policy "questions_readable" on questions
  for select using (status = 'published');
create policy "verses_readable" on verses
  for select using (true);

-- Admin write access (you'll need to add auth check)
create policy "questions_admin_write" on questions
  for all using (true) with check (true);
create policy "verses_admin_write" on verses
  for all using (true) with check (true);

-- Auto-update updated_at on questions
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_questions_updated_at
  before update on questions
  for each row
  execute function update_updated_at_column();

-- Indexes for performance
create index idx_questions_status on questions(status);
create index idx_questions_updated_at on questions(updated_at);
create index idx_verses_question_id on verses(question_id);
```

## 2. Prayer Requests
```sql
create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  username text,
  text text not null,
  prayed_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Make it readable by anyone
alter table prayer_requests enable row level security;
create policy "prayer_requests_readable" on prayer_requests
  for select using (true);
create policy "prayer_requests_insertable" on prayer_requests
  for insert with check (true);
create policy "prayer_requests_updatable" on prayer_requests
  for update using (true) with check (true);
```

## 2. Testimonies
```sql
create table if not exists testimonies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  username text,
  text text not null,
  tags text[] default '{}',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table testimonies enable row level security;
create policy "testimonies_readable" on testimonies
  for select using (status = 'approved' OR user_id = auth.uid());
create policy "testimonies_insertable" on testimonies
  for insert with check (true);
create policy "testimonies_updatable_admin" on testimonies
  for update using (true) with check (true);
```

## 3. User Groups
```sql
create table if not exists user_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  groups text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table user_groups enable row level security;
create policy "user_groups_readable" on user_groups
  for select using (user_id = auth.uid() OR true);

-- Add pastor role to users table (if not already added)
-- Run this to add a pastor column
alter table users add column if not exists is_pastor boolean default false;
create policy "user_groups_updatable" on user_groups
  for update using (user_id = auth.uid() OR true) with check (true);
create policy "user_groups_insertable" on user_groups
  for insert with check (true);
```

## 4. User Questions
```sql
create table if not exists user_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  username text,
  question text not null,
  category text,
  context text,
  status text not null default 'pending',
  verse_pool text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table user_questions enable row level security;
create policy "user_questions_readable" on user_questions
  for select using (status = 'approved' OR user_id = auth.uid());
create policy "user_questions_insertable" on user_questions
  for insert with check (true);
create policy "user_questions_updatable_admin" on user_questions
  for update using (true) with check (true);
```

## 5. Reports
```sql
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  content_id text not null,
  content_type text not null,
  reason text not null,
  reporter_id uuid,
  status text not null default 'open',
  action_taken text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table reports enable row level security;
create policy "reports_readable_admin" on reports
  for select using (true);
create policy "reports_insertable" on reports
  for insert with check (true);
create policy "reports_updatable_admin" on reports
  for update using (true) with check (true);
```

## 6. Community Groups

```sql
-- Groups table
create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  creator_id uuid,
  creator_name text,
  icon text, -- emoji or icon code
  status text not null default 'active', -- active, archived
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Group rules table
create table if not exists group_rules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  rule_number integer,
  rule_text text not null,
  created_at timestamptz not null default now()
);

-- Group members table
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid,
  username text,
  role text not null default 'member', -- member, moderator, admin
  joined_at timestamptz not null default now()
);

-- Enable RLS
alter table groups enable row level security;
alter table group_rules enable row level security;
alter table group_members enable row level security;

-- Public read access for groups
create policy "groups_readable" on groups
  for select using (status = 'active');
create policy "groups_writable" on groups
  for all using (true) with check (true);

create policy "group_rules_readable" on group_rules
  for select using (true);
create policy "group_rules_writable" on group_rules
  for all using (true) with check (true);

create policy "group_members_readable" on group_members
  for select using (true);
create policy "group_members_writable" on group_members
  for all using (true) with check (true);

-- Indexes
create index idx_groups_creator_id on groups(creator_id);
create index idx_groups_status on groups(status);
create index idx_group_members_group_id on group_members(group_id);
create index idx_group_members_user_id on group_members(user_id);
create index idx_group_rules_group_id on group_rules(group_id);
```

## Important Notes

1. **RLS (Row Level Security)**: The policies above allow all reads/writes for demo purposes. For production, implement proper authentication checks.

2. **user_id is nullable**: Users can submit prayers, questions, etc. anonymously. Only include `user_id` if a valid UUID is provided.

3. **Status field**: Questions and testimonies require admin review before appearing in the app.

4. **Indexes** (optional, for performance):
```sql
create index idx_prayer_requests_created on prayer_requests(created_at);
create index idx_testimonies_status on testimonies(status);
create index idx_user_questions_status on user_questions(status);
create index idx_user_questions_category on user_questions(category);
```

5. **Test the connection**: After setup, run this in your backend to verify:
```javascript
const { data, error } = await supabase.from("prayer_requests").select("*").limit(1);
console.log(data, error);
```
