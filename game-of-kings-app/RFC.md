# RFC: Automatic Live Tournament Grounds

## Status

Draft for implementation. No tournament code changes should begin until this document exists in the repository and the intended design is clear.

## Goal

Build the Game of Kings Tournament Grounds as a reusable live tournament module powered by Supabase and rendered in the existing Next.js app. The owner/admin should only need to create a tournament record with title, type, start time, duration, signup window, and prize artifact. The page handles signup, bracket generation, live progression, deterministic match results, cinematic storytelling, champion display, and artifact reward presentation.

The system must not use Firebase. It will use the current Vercel-hosted Next.js project and Supabase client already present in `src/lib/supabase.js`.

## Visual Contract

The `/tournaments` page should match the supplied reference image in mood, layout, and function:

- Dark Westerosi tournament ground, not a bright modern dashboard.
- Palette: black, charcoal, dark grey, faded silver, muted gold, deep blood red.
- Existing top navigation stays visible and consistent with the rest of the site.
- Tournament Grounds banner/artwork spans the top hero area.
- Large `TOURNAMENT GROUNDS` title area.
- Tournament status strip displays type, begins/countdown, duration, and prize.
- Signup callout appears before start and changes to `Entered` after signup.
- No visible admin controls, seed buttons, run buttons, or manual start controls.
- A long red/dark progress bar has its own vertical space and never overlaps the bracket.
- Use icons from `C:\Users\TIM\Desktop\GAME OF KINGS\Tournament Icons` for the timer/progression marker instead of a dagger.
- Bracket occupies most of the main left side.
- `Ravens from the Grounds` story feed sits on the right and scrolls when needed.
- Bottom area includes `Late for the Tournament? Sign Up For Next One!` and dark cinematic feature cards.

## Database Schema

### `tournaments`

Stores each scheduled tournament.

```sql
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('Melee', 'Jousting', 'Archery', 'Horse Racing')),
  start_time timestamptz not null,
  signup_open_time timestamptz,
  signup_close_time timestamptz,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'complete', 'cancelled')),
  prize_artifact_id uuid references public.artifacts(id),
  champion_user_id uuid references auth.users(id),
  champion_entry_id uuid,
  bracket_size integer not null default 16 check (bracket_size in (8, 16, 32)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Notes:

- `status` is helpful for reporting, but page progression must still be calculated from `start_time` and `duration_minutes`.
- `bracket_size` can be inferred from entries later, but storing it gives predictable layout and admin control.

### `tournament_entries`

Stores one user entry per tournament.

```sql
create table if not exists public.tournament_entries (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  house_name text,
  sigil_url text,
  knight_image_url text,
  created_at timestamptz not null default now(),
  unique (tournament_id, user_id)
);
```

Notes:

- The unique constraint enforces one entry per signed-in account.
- `display_name`, `house_name`, `sigil_url`, and `knight_image_url` are copied at signup time so old tournaments remain readable even if a user later edits their house.

### `tournament_matches`

Stores generated bracket matches, reveal timing, winners, and story text.

```sql
create table if not exists public.tournament_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  round_number integer not null,
  match_number integer not null,
  player_a_entry_id uuid references public.tournament_entries(id),
  player_b_entry_id uuid references public.tournament_entries(id),
  winner_entry_id uuid references public.tournament_entries(id),
  story_text text,
  reveal_time timestamptz not null,
  created_at timestamptz not null default now(),
  unique (tournament_id, round_number, match_number)
);
```

Notes:

- Empty slots are stored as `null` and displayed blank.
- `winner_entry_id` may be filled ahead of time once the bracket is generated, but the UI only reveals it when `now >= reveal_time`.

### `artifacts`

The current app has a static artifact catalog in `src/lib/artifacts.js`. The tournament module should eventually mirror or migrate those artifacts into Supabase.

```sql
create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  rarity text,
  description text,
  created_at timestamptz not null default now()
);
```

### `artifact_possessions`

Recommended so prize ownership is truly global and only one user can possess a unique artifact.

```sql
create table if not exists public.artifact_possessions (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.artifacts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'tournament',
  source_tournament_id uuid references public.tournaments(id),
  created_at timestamptz not null default now(),
  unique (artifact_id)
);
```

### RLS Policy Direction

- Anyone can read tournaments, entries, matches, artifacts, and public artifact possessions.
- Signed-in users can insert their own `tournament_entries` while signup is open.
- Users cannot update or delete entries after signup unless a future admin moderation flow allows it.
- Only a trusted server route/service role should insert/update `tournament_matches`, set champions, and grant artifact possessions.
- If implementation is client-only at first, deterministic generation can be displayed in the browser, but final persistence should be moved to a Next.js route using Supabase service role credentials.

## Signup Flow

1. Page loads the next active tournament:
   - Prefer a `live` tournament.
   - Otherwise show the next `scheduled` tournament by `start_time`.
   - If no future tournament exists, show the most recently completed tournament.
2. Determine signup state:
   - Signup open when `now >= signup_open_time` or `signup_open_time` is null.
   - Signup closed when `now >= signup_close_time` if present, otherwise `now >= start_time`.
3. If user is not signed in:
   - Show the tournament page and bracket/feed.
   - Signup button should prompt sign-in rather than creating a guest entry.
4. If signed in and not entered:
   - Button says `Sign Up To Enter`.
   - On click, insert into `tournament_entries`.
   - Store `display_name`, `house_name`, `sigil_url`, and `knight_image_url` from the user realm/profile.
5. If signed in and already entered:
   - Button says `Entered`.
   - Button is disabled or visually settled.
6. If signup is closed:
   - Show `Tournament in Progress` or `Tournament Complete` depending on time.
   - Do not show a signup button.

## Tournament Flow

1. Admin creates a row in `tournaments`.
2. Players sign up before `start_time`.
3. At or after `start_time`, bracket generation becomes valid.
4. The bracket is generated deterministically using tournament id and entries.
5. Matches reveal across the 30-minute duration.
6. The page calculates live state from actual time, so late visitors see the same bracket progress and story feed.
7. When `now >= start_time + duration_minutes`, the full bracket, final story, champion, and prize artifact are visible.
8. A server persistence step records generated matches, champion, and artifact possession if they are not already saved.

## Live Progression Logic

The tournament duration is 30 minutes by default. Progress is calculated as:

```js
elapsedMs = Date.now() - new Date(tournament.start_time).getTime();
durationMs = tournament.duration_minutes * 60 * 1000;
progress = clamp(elapsedMs / durationMs, 0, 1);
remainingMs = Math.max(durationMs - elapsedMs, 0);
```

UI states:

- `scheduled`: `now < start_time`
- `live`: `start_time <= now < end_time`
- `complete`: `now >= end_time`

Match reveal times:

- Collect all matches in reveal order: round 1, round 2, semifinal, final.
- Spread reveal times evenly across the tournament duration.
- Leave a short opening window before the first reveal and a closing window for champion ceremony.

Example:

```js
openingPadding = durationMs * 0.08;
closingPadding = durationMs * 0.08;
usableMs = durationMs - openingPadding - closingPadding;
reveal_time = start_time + openingPadding + (matchIndex / totalMatches) * usableMs;
```

The progress bar marker should use a tournament icon:

- Jousting: `Jousting.png`
- Melee: `melee.png`
- Archery: `Archery.png`
- Horse Racing: `HorseRacing.png`

These should be copied into `public/tournament-icons/` during implementation so the deployed Vercel app can serve them.

## Bracket Generation Logic

### Entrant Randomization

Entrants must not appear in obvious signup order. Use a deterministic seeded shuffle:

```js
seed = `${tournament.id}:entries`;
shuffledEntries = seededShuffle(entries, seed);
```

This preserves fairness and makes every browser see the same ordering.

### Bracket Size

- Use `tournament.bracket_size` when present.
- Valid sizes: 8, 16, 32.
- If fewer entrants exist than the bracket size, fill remaining slots with blanks.
- Blank slots display as empty boxes, not `Hidden Entrant`.
- If one player faces a blank slot, that player advances automatically.
- If both slots are blank, the next-round slot remains blank.

### Rounds

For a 16-person bracket:

- Round of 16
- Quarterfinals
- Semifinals
- Finals
- Champion

For 8:

- Quarterfinals
- Semifinals
- Finals
- Champion

For 32:

- Round of 32
- Round of 16
- Quarterfinals
- Semifinals
- Finals
- Champion

### Winner Selection

Per request, odds are always 50/50 per match. The result must be deterministic.

```js
seed = `${tournament.id}:${roundNumber}:${matchNumber}`;
winner = seededNumber(seed) % 2 === 0 ? playerA : playerB;
```

Rules:

- If only one player exists, they advance.
- If neither player exists, no winner.
- If both exist, choose with deterministic 50/50 seed.
- Do not use `Math.random()` for saved tournament outcomes.

## Story Generation Logic

Every match should receive a cinematic story based on tournament type, winner, loser, round, and whether it is an early round, semifinal, final, or champion ceremony.

Story must be deterministic so every visitor sees the same line.

### Story Inputs

- `tournament.id`
- `tournament.type`
- `round_number`
- `match_number`
- `winner.display_name`
- `winner.house_name`
- `loser.display_name`
- `loser.house_name`
- `reveal_time`
- Optional: weather, crowd mood, injury/upset/rivalry flavor

### Story Banks

Each tournament type needs its own banks:

- Jousting: lances, horses, shields, unhorsing, splintered wood, saddle twist, herald banners.
- Melee: swords, shields, armor, mud, press of bodies, hard close combat.
- Archery: arrows, wind, precision, final shot, silent crowd, target rings.
- Horse Racing: thundering hooves, final turns, banners, dust, narrow rails, roaring stands.

### Story Assembly

Use seeded selections from type-specific arrays:

```js
tone = seededPick(toneBank, seed);
opening = seededPick(openingBank[type], seed);
turn = seededPick(turnBank[type], seed);
finish = seededPick(finishBank[type], seed);
story = `${opening} ${turn} ${finish}`;
```

A jousting result should read more like:

> The crowd roars as Ser Alaric lowers his lance. His opponent meets him at full gallop, but the strike lands clean against the breastplate. Wood shatters, the saddle twists, and the judges raise Ser Alaric's banner.

Avoid short lines like `A defeated B`.

### Final Champion Story

The final reveal should add a champion ceremony:

- Herald names the champion.
- Crowd reaction.
- Prize artifact named and displayed.
- Artifact possession recorded in Supabase.

## Persistence Logic

Recommended implementation:

1. Client loads tournament, entries, matches, and artifact.
2. If tournament has started and matches do not exist, client calls a Next.js API route:
   - `POST /api/tournaments/[id]/generate`
3. API route:
   - Loads tournament and entries.
   - Builds deterministic bracket.
   - Writes `tournament_matches`.
   - Sets `champion_entry_id` and `champion_user_id` when final winner exists.
   - On complete, writes `artifact_possessions` if absent.
4. Client subscribes or polls:
   - Initial implementation can poll every 10-20 seconds.
   - Later implementation can use Supabase realtime for `tournament_matches`.

This keeps final results stable even if many users load the page at once. The API route should use idempotent upserts and unique constraints so duplicate requests do not duplicate matches.

## Page Module Structure

Suggested files:

- `src/app/tournaments/page.js`
  - Page composition and visual layout.
- `src/components/tournaments/TournamentGrounds.jsx`
  - Main reusable module.
- `src/components/tournaments/TournamentBracket.jsx`
  - Knockout tree renderer.
- `src/components/tournaments/TournamentProgress.jsx`
  - Countdown/live progress bar and icon marker.
- `src/components/tournaments/TournamentSignup.jsx`
  - Signup button and status display.
- `src/components/tournaments/RavenFeed.jsx`
  - Story feed panel.
- `src/lib/tournaments.js`
  - Deterministic shuffle, seeded winner, bracket building, reveal timing, story generation.
- `src/app/api/tournaments/[id]/generate/route.js`
  - Server persistence endpoint.

## Asset Plan

Use existing assets already in the project where possible:

- Banner: `public/banners/TournamentGrounds.png` or closest existing Tournament Grounds asset.
- Tournament icons from local desktop folder:
  - `C:\Users\TIM\Desktop\GAME OF KINGS\Tournament Icons\Archery.png`
  - `C:\Users\TIM\Desktop\GAME OF KINGS\Tournament Icons\HorseRacing.png`
  - `C:\Users\TIM\Desktop\GAME OF KINGS\Tournament Icons\Jousting.png`
  - `C:\Users\TIM\Desktop\GAME OF KINGS\Tournament Icons\melee.png`
- Copy those into `public/tournament-icons/` for deployment.
- Artifact images should come from `artifacts.image_url` when Supabase has them, otherwise fallback to current static artifact data.
- Sigils and knight portraits should use the saved URLs already captured in player realm/profile data.

## Open Questions

- Should bracket size be admin-selected or automatically chosen from entrant count?
- Should users pay a gold entry fee on the Tournament Grounds page, or should tournaments be free until the economy is fully centralized in Supabase?
- Should tournament completion be triggered by a Vercel Cron route, by the first visitor after completion, or both?
- Which Supabase table should be considered the source of truth for player display names: `profiles`, `player_realms`, or copied entry fields only?

## Acceptance Criteria

- `RFC.md` exists before implementation begins.
- `/tournaments` has no manual seed/run/start controls.
- Signed-in users can enter once per tournament.
- Bracket slots randomize deterministically and blank slots stay blank.
- Match winners are 50/50 and deterministic from tournament/match seed.
- Late visitors see the same current or final state based on real time.
- Story feed reveals cinematic match stories over time.
- Completed tournament shows champion and prize artifact.
- Final match records and champion are saved to Supabase.
- Page matches the uploaded Tournament Grounds reference in mood and page structure.
