-- CoccolaTag Premium Anti-Furto Schema
-- Tutte le tabelle, viste, RLS e policy base.

create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_e164 text not null,
  email text,
  whatsapp_opt_in boolean default true,
  created_at timestamptz default now()
);

create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete cascade,
  name text not null,
  species text check (species in ('dog','cat','other')) default 'dog',
  sex text check (sex in ('M','F','N/A')) default 'N/A',
  birthdate date,
  photo_url text,
  public_note text,
  created_at timestamptz default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete set null,
  slug text unique not null,
  nfc_uid text,
  vet_pin text,
  is_active boolean default true,
  property_certified boolean default true,
  status text check (status in ('normal','lost','stolen')) default 'normal',
  status_since timestamptz,
  reward_eur numeric,
  created_at timestamptz default now()
);

create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references pets(id) on delete cascade,
  vaccinations jsonb,
  allergies text,
  medications text,
  vet_contact jsonb,
  notes text,
  eu_rabies_valid_until date,
  eu_passport_no text,
  travel_vet jsonb,
  travel_mode boolean default false,
  updated_at timestamptz default now()
);

create table if not exists scan_events (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references tags(id) on delete cascade,
  ip text,
  approx_location jsonb,
  precise_location jsonb,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists owner_codes (
  code text primary key,
  owner_id uuid references owners(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists vet_tokens (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references tags(id) on delete cascade,
  email text not null,
  token text not null unique,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

create table if not exists sightings (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references tags(id) on delete cascade,
  reporter_email text,
  reporter_phone text,
  note text,
  photo_url text,
  approx_location jsonb,
  precise_location jsonb,
  created_at timestamptz default now()
);

create table if not exists community_subs (
  id uuid primary key default gen_random_uuid(),
  email text,
  city text,
  lat double precision,
  lng double precision,
  radius_km numeric default 5,
  created_at timestamptz default now()
);

create table if not exists notifications_log (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references tags(id) on delete cascade,
  channel text check (channel in ('email','whatsapp','push')) default 'email',
  payload jsonb,
  created_at timestamptz default now()
);

create or replace view v_pet_public as
  select p.id, p.name, p.photo_url, p.public_note,
         o.name as owner_name,
         o.phone_e164
  from pets p
  join owners o on o.id = p.owner_id;

create or replace view v_medical_private as
  select m.* from medical_records m;

alter table owners enable row level security;
alter table pets enable row level security;
alter table tags enable row level security;
alter table medical_records enable row level security;
alter table scan_events enable row level security;
alter table owner_codes enable row level security;
alter table vet_tokens enable row level security;
alter table sightings enable row level security;
alter table community_subs enable row level security;
alter table notifications_log enable row level security;

create policy if not exists "read tags" on tags for select using (true);
create policy if not exists "read pets" on pets for select using (true);
create policy if not exists "insert scans" on scan_events for insert with check (true);
create policy if not exists "insert sightings" on sightings for insert with check (true);
create policy if not exists "insert subs" on community_subs for insert with check (true);
