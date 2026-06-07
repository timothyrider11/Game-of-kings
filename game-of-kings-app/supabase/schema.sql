-- Game of Kings account saving schema.
-- Run this in the Supabase SQL editor for your project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  ruler_name text not null default '',
  ruler_title text not null default 'Lord',
  avatar_url text not null default '',
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.player_realms (
  user_id uuid primary key references auth.users(id) on delete cascade,
  realm_data jsonb not null default '{}'::jsonb,
  house_name text not null default '',
  ruler_name text not null default '',
  claimed_castle_id text,
  gold integer not null default 350,
  renown integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.castle_claims (
  castle_id text primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  house_name text not null,
  ruler_name text not null default '',
  reserved_house text not null default '',
  claimed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_ledger (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete cascade,
  gold_delta integer not null default 0,
  renown_delta integer not null default 0,
  reason text not null default '',
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists player_realms_touch_updated_at on public.player_realms;
create trigger player_realms_touch_updated_at
before update on public.player_realms
for each row execute function public.touch_updated_at();

drop trigger if exists castle_claims_touch_updated_at on public.castle_claims;
create trigger castle_claims_touch_updated_at
before update on public.castle_claims
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.grant_currency(
  target uuid,
  gold_amount integer default 0,
  renown_amount integer default 0,
  grant_reason text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can grant currency';
  end if;

  update public.player_realms
  set
    gold = greatest(0, gold + gold_amount),
    renown = greatest(0, renown + renown_amount),
    realm_data = jsonb_set(
      jsonb_set(
        realm_data,
        '{gold}',
        to_jsonb(greatest(0, gold + gold_amount)),
        true
      ),
      '{renown}',
      to_jsonb(greatest(0, renown + renown_amount)),
      true
    )
  where user_id = target;

  insert into public.admin_ledger (
    actor_user_id,
    target_user_id,
    gold_delta,
    renown_delta,
    reason
  )
  values (
    auth.uid(),
    target,
    gold_amount,
    renown_amount,
    grant_reason
  );
end;
$$;

alter table public.profiles enable row level security;
alter table public.player_realms enable row level security;
alter table public.castle_claims enable row level security;
alter table public.admin_ledger enable row level security;

drop policy if exists "Profiles are readable by players" on public.profiles;
create policy "Profiles are readable by players"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Players create their profile" on public.profiles;
create policy "Players create their profile"
on public.profiles for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Players update their profile" on public.profiles;
create policy "Players update their profile"
on public.profiles for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Players read own realm" on public.player_realms;
create policy "Players read own realm"
on public.player_realms for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Players save own realm" on public.player_realms;
create policy "Players save own realm"
on public.player_realms for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Players update own realm" on public.player_realms;
create policy "Players update own realm"
on public.player_realms for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Castle claims are public" on public.castle_claims;
create policy "Castle claims are public"
on public.castle_claims for select
to anon, authenticated
using (true);

drop policy if exists "Players claim one castle" on public.castle_claims;
create policy "Players claim one castle"
on public.castle_claims for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Players update own castle claim" on public.castle_claims;
create policy "Players update own castle claim"
on public.castle_claims for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins read admin ledger" on public.admin_ledger;
create policy "Admins read admin ledger"
on public.admin_ledger for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins write admin ledger" on public.admin_ledger;
create policy "Admins write admin ledger"
on public.admin_ledger for insert
to authenticated
with check (public.is_admin());

-- After your own account exists, run this once with your auth user id:
-- update public.profiles set role = 'admin' where user_id = 'YOUR-AUTH-USER-ID';
--
-- Then reserve King's Landing for yourself:
-- insert into public.castle_claims (castle_id, user_id, house_name, ruler_name, reserved_house)
-- values ('kings-landing', 'YOUR-AUTH-USER-ID', 'House Rider', 'King Rider', 'House Rider')
-- on conflict (castle_id) do update
-- set user_id = excluded.user_id,
--     house_name = excluded.house_name,
--     ruler_name = excluded.ruler_name,
--     reserved_house = excluded.reserved_house;
