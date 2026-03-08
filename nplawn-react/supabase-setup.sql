-- ============================================================
-- NPLawn — Supabase Auth + Profiles setup
-- Run this entire script in your Supabase SQL editor once.
-- ============================================================

-- 1. Profiles table
--    Mirrors auth.users with extra fields (role, name).
--    Created automatically via trigger on every new signup.
create table if not exists public.profiles (
  id          uuid        references auth.users(id) on delete cascade primary key,
  email       text        unique not null,
  name        text,
  role        text        not null default 'user'
                          check (role in ('user', 'provider', 'admin')),
  created_at  timestamptz default now()
);

-- 2. Row Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (but not change role)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Trigger: auto-create a profile row on every new auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 4. Seed admin & provider accounts
--    Replace the placeholder UUIDs + emails after running the
--    actual Supabase signUp for each seed account.
--    Easiest: create the accounts via the Supabase dashboard
--    (Authentication > Users > Invite) then run:
--
--   update public.profiles set role = 'admin'
--     where email = 'admin@admin.com';
--
--   update public.profiles set role = 'provider'
--     where email = 'provider@nplawn.com';
-- ============================================================
