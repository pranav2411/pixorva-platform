-- Enable UUID generation extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  trial_started_at timestamp with time zone,
  trial_ends_at timestamp with time zone,
  trial_agent_id uuid,
  has_used_trial boolean default false not null,
  plan text default 'free' not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger (drop if exists to be safe)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create Agents Table
create table if not exists public.agents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  goal text,
  instructions text,
  icon text,
  schedule text default 'Manual' not null,
  steps jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Agents
alter table public.agents enable row level security;

-- Agents Policies
create policy "Users can view their own agents" on public.agents
  for select using (auth.uid() = user_id);

create policy "Users can create their own agents" on public.agents
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own agents" on public.agents
  for update using (auth.uid() = user_id);

create policy "Users can delete their own agents" on public.agents
  for delete using (auth.uid() = user_id);


-- 3. Create Tasks Table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  agent_id uuid references public.agents on delete cascade not null,
  input text not null,
  result text not null,
  type text default 'text' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Tasks
alter table public.tasks enable row level security;

-- Tasks Policies
create policy "Users can view their own tasks" on public.tasks
  for select using (auth.uid() = user_id);

create policy "Users can create their own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks" on public.tasks
  for delete using (auth.uid() = user_id);
