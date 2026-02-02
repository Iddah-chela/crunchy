-- ========================================
-- GROUPS TABLES SETUP FOR SUPABASE
-- ========================================
-- Run this SQL in your Supabase SQL Editor
-- to fix the "Could not find the table 'public.groups'" error

-- 1. Create groups table
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

-- 2. Create group_rules table
create table if not exists group_rules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  rule_number integer,
  rule_text text not null,
  created_at timestamptz not null default now()
);

-- 3. Create group_members table
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid,
  username text,
  role text not null default 'member', -- member, moderator, admin
  joined_at timestamptz not null default now()
);

-- 4. Enable Row Level Security
alter table groups enable row level security;
alter table group_rules enable row level security;
alter table group_members enable row level security;

-- 5. Create RLS Policies (Allow all for now - tighten in production)
-- Groups policies
create policy "groups_readable" on groups
  for select using (status = 'active');

create policy "groups_writable" on groups
  for all using (true) with check (true);

-- Group rules policies
create policy "group_rules_readable" on group_rules
  for select using (true);

create policy "group_rules_writable" on group_rules
  for all using (true) with check (true);

-- Group members policies
create policy "group_members_readable" on group_members
  for select using (true);

create policy "group_members_writable" on group_members
  for all using (true) with check (true);

-- 6. Create Indexes for Performance
create index if not exists idx_groups_creator_id on groups(creator_id);
create index if not exists idx_groups_status on groups(status);
create index if not exists idx_group_members_group_id on group_members(group_id);
create index if not exists idx_group_members_user_id on group_members(user_id);
create index if not exists idx_group_rules_group_id on group_rules(group_id);

-- 7. Auto-update updated_at trigger
create or replace function update_groups_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_groups_updated_at
  before update on groups
  for each row
  execute function update_groups_updated_at();

-- ========================================
-- DONE! Your groups tables are ready.
-- ========================================
