begin;

create extension if not exists "pgcrypto";

-- -----------------
-- SHARED UTILITIES
-- -----------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- --------------
-- LOOKUP TABLES
-- --------------

create table if not exists public.goal (
  id          bigserial primary key,
  name        text not null unique,
  description text
);

create table if not exists public.intensity (
  id          bigserial primary key,
  description text not null unique
);

create table if not exists public.achievement (
  id          bigserial primary key,
  name        text not null unique,
  description text
);

create table if not exists public.muscle_group (
  id   bigserial primary key,
  name text not null unique
);

create table if not exists public."type" (
  type_id bigserial primary key,
  name    text not null unique
);

-- -------------------------
-- USER PROFILE & PROGRESS
-- -------------------------

create table if not exists public."user" (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  birthday    date,
  gender      text,
  weight      numeric,
  weight_unit text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'user_set_updated_at') then
    create trigger user_set_updated_at
    before update on public."user"
    for each row execute function public.set_updated_at();
  end if;
end$$;

create table if not exists public.user_settings (
  user_id      uuid primary key references public."user" (id) on delete cascade,
  goal_id      bigint references public.goal (id),
  intensity_id bigint references public.intensity (id),
  updated_at   timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'user_settings_set_updated_at') then
    create trigger user_settings_set_updated_at
    before update on public.user_settings
    for each row execute function public.set_updated_at();
  end if;
end$$;

create table if not exists public.user_progress (
  user_id        uuid primary key references public."user" (id) on delete cascade,
  level          integer not null default 1,
  level_progress integer not null default 0,
  streak         integer not null default 0,
  highest_streak integer not null default 0,
  reached_goals  integer not null default 0,
  highest_score  integer not null default 0,
  updated_at     timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'user_progress_set_updated_at') then
    create trigger user_progress_set_updated_at
    before update on public.user_progress
    for each row execute function public.set_updated_at();
  end if;
end$$;

create table if not exists public.user_workout_schedule (
  user_id  uuid not null references public."user" (id) on delete cascade,
  week_day text not null,
  active   boolean not null default true,
  primary key (user_id, week_day)
);

create table if not exists public.user_achievement (
  user_id        uuid not null references public."user" (id) on delete cascade,
  achievement_id bigint not null references public.achievement (id),
  earned_on      date not null default current_date,
  primary key (user_id, achievement_id)
);

create table if not exists public.user_accumulated_stats (
  user_id  uuid not null references public."user" (id) on delete cascade,
  date     date not null,
  minutes  integer not null default 0,
  calories integer not null default 0,
  primary key (user_id, date)
);

create table if not exists public.notification (
  id         bigserial primary key,
  user_id    uuid not null references public."user" (id) on delete cascade,
  title      text not null,
  message    text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now(),
  icon_url   text
);

-- ---------------
-- PROGRAM / PLAN
-- ---------------

create table if not exists public.program (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public."user" (id) on delete cascade,
  goal_id       bigint references public.goal (id),
  duration      integer not null,
  creation_date timestamptz not null default now(),
  name          text not null,
  description   text,
  completed_at  timestamptz
);

create table if not exists public.routine (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  description        text,
  duration           integer not null,
  preset             boolean not null default false,
  estimated_calories integer
);

create table if not exists public.program_routine (
  program_id     uuid not null references public.program (id) on delete cascade,
  routine_id     uuid not null references public.routine (id) on delete cascade,
  scheduled_date date not null,
  completed      boolean not null default false,
  primary key (program_id, scheduled_date)
);

-- -----------------
-- EXERCISE CATALOG
-- -----------------

create table if not exists public.exercise (
  id               uuid primary key default gen_random_uuid(),
  name             text not null unique,
  description      text,
  demo_video_url   text,
  score_factor     numeric,
  calories_per_rep numeric
);

create table if not exists public.exercise_goal (
  goal_id     bigint not null references public.goal (id),
  exercise_id uuid not null references public.exercise (id) on delete cascade,
  primary key (goal_id, exercise_id)
);

create table if not exists public.exercise_muscle_group (
  muscle_group_id bigint not null references public.muscle_group (id),
  exercise_id     uuid not null references public.exercise (id) on delete cascade,
  primary key (muscle_group_id, exercise_id)
);

create table if not exists public.exercise_type (
  exercise_id uuid not null references public.exercise (id) on delete cascade,
  type_id     bigint not null references public."type" (type_id),
  primary key (exercise_id, type_id)
);

create table if not exists public.routine_exercise (
  routine_id  uuid not null references public.routine (id) on delete cascade,
  exercise_id uuid not null references public.exercise (id) on delete cascade,
  "order"     integer not null,
  sets        integer not null default 1,
  reps        integer,
  duration    integer,
  rest_period integer,
  primary key (routine_id, "order")
);

create index if not exists idx_routine_exercise_routine on public.routine_exercise (routine_id);

create table if not exists public.routine_goal (
  routine_id uuid not null references public.routine (id) on delete cascade,
  goal_id    bigint not null references public.goal (id),
  primary key (routine_id, goal_id)
);

create table if not exists public.routine_history (
  user_id       uuid not null references public."user" (id) on delete cascade,
  routine_id    uuid not null references public.routine (id) on delete cascade,
  description   text,
  completed_at  timestamptz not null default now(),
  recording_url text,
  url           text,
  score         integer,
  calories      integer,
  primary key (user_id, routine_id, completed_at)
);

commit;