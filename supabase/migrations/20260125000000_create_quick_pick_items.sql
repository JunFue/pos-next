create table if not exists public.quick_pick_items (
  id uuid not null default gen_random_uuid(),
  item_id uuid not null,
  store_id uuid not null,
  label text not null,
  color text not null default 'bg-blue-500',
  image_url text,
  position integer,
  created_at timestamp with time zone default now(),
  constraint quick_pick_items_pkey primary key (id),
  constraint quick_pick_items_item_id_fkey foreign key (item_id) references public.items(id) on delete cascade,
  constraint quick_pick_items_store_id_fkey foreign key (store_id) references public.stores(store_id) on delete cascade
);

-- Add RLS policies if needed, for now assuming public access or handled by middleware/service role
alter table public.quick_pick_items enable row level security;

create policy "Enable read access for all users" on public.quick_pick_items
  for select using (true);

create policy "Enable insert for authenticated users only" on public.quick_pick_items
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.quick_pick_items
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.quick_pick_items
  for delete using (auth.role() = 'authenticated');
