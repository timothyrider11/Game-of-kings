# Supabase Setup For Game Of Kings

This app now has the first account-save layer for Supabase.

## 1. Run The Schema

Open your Supabase project, go to **SQL Editor**, paste the contents of:

`supabase/schema.sql`

Then run it.

This creates:

- `profiles`: username, ruler name, lord/lady title, admin role
- `player_realms`: the player's saved realm JSON, gold, renown, house, claimed castle
- `castle_claims`: shared castle ownership records
- `admin_ledger`: records admin gifts/adjustments
- `grant_currency(...)`: admin function for giving gold or renown

## 2. Make Your Account Admin

Create your account through `/account` on the website first.

Then in Supabase SQL editor, run:

```sql
update public.profiles
set role = 'admin'
where username = 'YOUR_USERNAME';
```

## 3. Reserve King's Landing For House Rider

After your profile is admin and you know your `user_id`, run:

```sql
insert into public.castle_claims (castle_id, user_id, house_name, ruler_name, reserved_house)
select 'kings-landing', user_id, 'House Rider', 'King Rider', 'House Rider'
from public.profiles
where username = 'YOUR_USERNAME'
on conflict (castle_id) do update
set user_id = excluded.user_id,
    house_name = excluded.house_name,
    ruler_name = excluded.ruler_name,
    reserved_house = excluded.reserved_house;
```

The app already treats King's Landing as reserved for House Rider locally, but this makes the database agree.

## 4. Give Someone Gold Or Renown

Example:

```sql
select public.grant_currency(
  target := (
    select user_id from public.profiles where username = 'MOTHERS_USERNAME'
  ),
  gold_amount := 500,
  renown_amount := 25,
  grant_reason := 'Starter gift from realm admin'
);
```

That updates the player's saved realm and records the action in `admin_ledger`.

## 5. Environment Variables

Vercel needs:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app already uses those names in `src/lib/supabase.js`.
