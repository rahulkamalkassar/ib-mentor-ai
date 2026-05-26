-- IB Mentor AI — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default now()
);

-- Profiles
create table if not exists public.profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  programme text check (programme in ('MYP Year 4', 'MYP Year 5', 'DP Year 1', 'DP Year 2')),
  exam_session text,
  goal_points integer default 38,
  university_aim text,
  challenge text[],
  study_hours_per_week integer default 10,
  study_times text[],
  exam_proximity text,
  learning_styles text[],
  ai_personality text default 'friendly tutor',
  onboarding_complete boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Subjects
create table if not exists public.subjects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  "group" text,
  level text check (level in ('HL', 'SL')),
  color_accent text default '#7c3aed',
  icon text default '📚',
  created_at timestamp with time zone default now()
);

-- Units
create table if not exists public.units (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  name text not null,
  code text,
  weak_topics text[],
  created_at timestamp with time zone default now()
);

-- Sources
create table if not exists public.sources (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references public.units(id) on delete cascade not null,
  title text not null,
  type text check (type in ('pdf', 'link', 'note')) default 'note',
  url text,
  content text,
  created_at timestamp with time zone default now()
);

-- Calendar Events
create table if not exists public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  type text check (type in ('exam', 'summative', 'formative', 'IA', 'oral', 'study')) default 'study',
  subject_id uuid references public.subjects(id) on delete set null,
  date date not null,
  time time,
  description text,
  created_at timestamp with time zone default now()
);

-- Grades
create table if not exists public.grades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  level text check (level in ('HL', 'SL')),
  goal_grade integer check (goal_grade between 1 and 7),
  likely_grade integer check (likely_grade between 1 and 7),
  ia_score numeric,
  mock_score numeric,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, subject_id)
);

-- TOK & EE
create table if not exists public.tok_ee (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  matrix_bonus integer default 0 check (matrix_bonus between 0 and 3),
  tok_grade text,
  ee_grade text,
  updated_at timestamp with time zone default now()
);

-- Assessment Log
create table if not exists public.assessment_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete set null,
  date date not null,
  what_it_was text not null,
  type text,
  score numeric,
  out_of numeric,
  percentage numeric generated always as (
    case when out_of > 0 then round((score / out_of) * 100, 2) else 0 end
  ) stored,
  notes text,
  created_at timestamp with time zone default now()
);

-- Practice Tests (shared/global table)
create table if not exists public.practice_tests (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subject text not null,
  level text check (level in ('HL', 'SL')),
  paper_type text,
  duration_minutes integer,
  pdf_url text,
  tags text[],
  created_at timestamp with time zone default now()
);

-- Test Attempts (per user)
create table if not exists public.test_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  test_id uuid references public.practice_tests(id) on delete cascade not null,
  started_at timestamp with time zone default now(),
  submitted_at timestamp with time zone,
  score numeric,
  feedback text,
  image_urls text[],
  created_at timestamp with time zone default now()
);

-- Upgrade Plans (global catalog)
create table if not exists public.upgrade_plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  price numeric not null,
  period text not null,
  features text[]
);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.sources enable row level security;
alter table public.calendar_events enable row level security;
alter table public.grades enable row level security;
alter table public.tok_ee enable row level security;
alter table public.assessment_log enable row level security;
alter table public.test_attempts enable row level security;

-- Users
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Subjects
create policy "Users can CRUD own subjects" on public.subjects for all using (auth.uid() = user_id);

-- Units (via subject ownership)
create policy "Users can CRUD own units" on public.units for all using (
  exists (select 1 from public.subjects where subjects.id = units.subject_id and subjects.user_id = auth.uid())
);

-- Sources (via unit → subject ownership)
create policy "Users can CRUD own sources" on public.sources for all using (
  exists (
    select 1 from public.units
    join public.subjects on subjects.id = units.subject_id
    where units.id = sources.unit_id and subjects.user_id = auth.uid()
  )
);

-- Calendar Events
create policy "Users can CRUD own events" on public.calendar_events for all using (auth.uid() = user_id);

-- Grades
create policy "Users can CRUD own grades" on public.grades for all using (auth.uid() = user_id);

-- TOK & EE
create policy "Users can CRUD own tok_ee" on public.tok_ee for all using (auth.uid() = user_id);

-- Assessment Log
create policy "Users can CRUD own log" on public.assessment_log for all using (auth.uid() = user_id);

-- Test Attempts
create policy "Users can CRUD own attempts" on public.test_attempts for all using (auth.uid() = user_id);

-- Practice Tests & Upgrade Plans (public read)
alter table public.practice_tests enable row level security;
alter table public.upgrade_plans enable row level security;
create policy "Anyone can read practice tests" on public.practice_tests for select using (true);
create policy "Anyone can read upgrade plans" on public.upgrade_plans for select using (true);

-- ==========================================
-- SEED DATA — Upgrade Plans
-- ==========================================
insert into public.upgrade_plans (name, price, period, features) values
  ('Free', 0, 'forever', array['2 subjects', '2 practice tests/month', 'Basic AI help', 'Calendar']),
  ('Weekly', 3.99, 'week', array['Unlimited subjects', 'Unlimited tests', 'Full AI tutor', 'Grade tracking', 'Source uploads']),
  ('Monthly', 12.99, 'month', array['Everything in Weekly', 'Study plan generation', 'Essay feedback', 'Predicted grade AI', 'Priority support']),
  ('Yearly', 89.99, 'year', array['Everything in Monthly', 'Save 30%', 'Advanced analytics', 'Personalized revision packs', 'Exam countdown alerts']),
  ('Ultimate', 149, 'one-time', array['Lifetime access', 'Premium AI (GPT-4 + Claude)', 'Custom study plans', '1-on-1 AI coaching sessions', 'University application help'])
on conflict (name) do nothing;

-- ==========================================
-- TRIGGER: Auto-create user profile
-- ==========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
