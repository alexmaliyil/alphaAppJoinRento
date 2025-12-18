/*
  # Create Profiles Table
  
  ## Query Description:
  Creates a public profiles table to store user metadata and support the "checkUserExists" flow.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - table: public.profiles
  - columns: id (uuid, pk), email, phone, first_name, last_name, user_type, created_at
  
  ## Security Implications:
  - RLS Enabled
  - Public read access allowed (required for checkUserExists flow)
*/

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  phone text,
  first_name text,
  last_name text,
  user_type text check (user_type in ('landlord', 'tenant')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Allow public read access to check if user exists (Privacy trade-off for the requested UX)
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);
