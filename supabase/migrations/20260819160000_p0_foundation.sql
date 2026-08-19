create extension if not exists pgcrypto;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  session_hash text not null,
  status text not null default 'INTAKE' check (status in (
    'INTAKE', 'UPLOADING', 'READY_TO_GENERATE', 'GENERATING_INITIAL',
    'REVIEWING_OPTIONS', 'GENERATING_REFINEMENT', 'REVIEWING_REFINEMENT',
    'CLARIFYING_SCOPE', 'CONFIRMING_SCOPE', 'CALCULATING_ESTIMATES',
    'COMPARING_ESTIMATES', 'PREVIEWING_MARKETPLACE_POST',
    'MARKETPLACE_POSTED_DEMO', 'ERROR'
  )),
  city text not null,
  uf text not null check (char_length(uf) = 2),
  room_type text not null,
  area_m2 numeric not null check (area_m2 > 0),
  finish_tier text not null check (finish_tier in ('economy', 'standard', 'premium')),
  original_instruction text not null,
  original_storage_path text,
  selected_variant_id uuid,
  generation_count integer not null default 0 check (generation_count >= 0),
  confirmed_scope jsonb not null default '[]'::jsonb check (jsonb_typeof(confirmed_scope) = 'array'),
  preferred_estimate_profile text check (preferred_estimate_profile in ('economic', 'ecological', 'both')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_session_hash_idx on public.projects (session_hash);

create table public.marketplace_posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'marketplace_demo_published')),
  post_json jsonb not null check (jsonb_typeof(post_json) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger marketplace_posts_set_updated_at
before update on public.marketplace_posts
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.marketplace_posts enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "service role manages private project media"
on storage.objects
for all
to service_role
using (bucket_id = 'project-media')
with check (bucket_id = 'project-media');
