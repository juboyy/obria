create table if not exists public.obria_demo_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.obria_demo_state enable row level security;
revoke all on table public.obria_demo_state from anon, authenticated;
grant select, insert, update, delete on table public.obria_demo_state to service_role;

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', false)
on conflict (id) do update set public = false;

drop policy if exists "Service role reads project media" on storage.objects;
create policy "Service role reads project media"
on storage.objects for select
to service_role
using (bucket_id = 'project-media');

drop policy if exists "Service role writes project media" on storage.objects;
create policy "Service role writes project media"
on storage.objects for insert
to service_role
with check (bucket_id = 'project-media');

drop policy if exists "Service role updates project media" on storage.objects;
create policy "Service role updates project media"
on storage.objects for update
to service_role
using (bucket_id = 'project-media')
with check (bucket_id = 'project-media');

drop policy if exists "Service role deletes project media" on storage.objects;
create policy "Service role deletes project media"
on storage.objects for delete
to service_role
using (bucket_id = 'project-media');
