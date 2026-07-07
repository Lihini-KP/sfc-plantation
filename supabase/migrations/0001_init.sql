-- SFC Plantation Management Platform - initial schema
-- Mirrors the data model built out in lib/mock-data during the prototype
-- phase. Run via `supabase db push` (see README-DEPLOY.md).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- Reference / config
-- ─────────────────────────────────────────────────────────────────────────

create table app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  role text not null check (role in (
    'Super Admin','Plantation Manager','Farm Supervisor','Field Officer',
    'Livestock Supervisor','Store Keeper','Worker','Finance','Management'
  )),
  avatar_initials text,
  created_at timestamptz not null default now()
);

create table estate_location (
  id int primary key default 1 check (id = 1),
  label text not null,
  latitude double precision not null,
  longitude double precision not null,
  confirmed boolean not null default false
);

create table chicken_farm_status (
  id int primary key default 1 check (id = 1),
  operational boolean not null default false,
  planned_start_month text,
  planned_start_date date,
  note text
);

-- ─────────────────────────────────────────────────────────────────────────
-- Plantation: crops, zones, facilities
-- ─────────────────────────────────────────────────────────────────────────

create table crops (
  id text primary key,
  name text not null,
  variety text,
  plant_count int not null default 0,
  planting_date date,
  expected_harvest_date date,
  harvest_cycle_days int,
  growth_stage text,
  water_requirement text,
  fertilizer_schedule text,
  pesticide_schedule text,
  expected_yield_kg numeric not null default 0,
  actual_yield_kg numeric not null default 0,
  cost_of_cultivation numeric not null default 0,
  revenue numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table plantation_areas (
  id text primary key,
  name text not null,
  size_acres numeric,
  gps_location text,
  crop_id text references crops(id) on delete set null,
  variety text,
  plant_count int not null default 0,
  planting_date date,
  expected_harvest_date date,
  growth_stage text,
  health_status text check (health_status in ('healthy','attention','moderate','critical')),
  ai_health_score int,
  last_inspection date,
  assigned_staff text[] not null default '{}',
  irrigation_method text,
  fertilizer_schedule text,
  disease_status text,
  pest_status text,
  map_x numeric, map_y numeric, map_width numeric, map_height numeric,
  updated_at timestamptz not null default now()
);

create table facilities (
  id text primary key,
  name text not null,
  category text check (category in ('facility','structure')),
  description text,
  map_x numeric, map_y numeric, map_width numeric, map_height numeric
);

create table greenhouses (
  id text primary key,
  tunnel text not null,
  crop_name text not null,
  sqft numeric,
  planting_date date,
  first_harvest_date date,
  harvested_qty_range text,
  revenue numeric not null default 0,
  expenses jsonb not null default '[]',
  total_expenses numeric not null default 0,
  date_of_crop_removal date,
  next_crop_planting_date date
);

create table crop_plan (
  id text primary key,
  crop_name text not null,
  sqft numeric,
  planting_date date,
  extended_date date,
  harvested_qty text,
  revenue numeric,
  date_of_crop_removal date,
  next_crop_planting_date date,
  note text
);

-- ─────────────────────────────────────────────────────────────────────────
-- Operations: daily updates, tasks, harvest logs
-- ─────────────────────────────────────────────────────────────────────────

create table daily_updates (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  area_id text references plantation_areas(id) on delete set null,
  crop_id text references crops(id) on delete set null,
  activity text,
  staff text[] not null default '{}',
  weather text,
  watering_details text,
  fertilizer_applied text,
  pesticide_applied text,
  diseases_found text,
  pest_issues text,
  notes text,
  photo_count int not null default 0,
  created_at timestamptz not null default now()
);

create table plantation_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text check (category in ('Watering','Fertilizer','Weeding','Spraying','Harvesting','Cleaning','Maintenance')),
  assigned_to text,
  area_id text references plantation_areas(id) on delete set null,
  due_date date,
  priority text check (priority in ('low','medium','high','urgent')),
  status text check (status in ('pending','in_progress','completed','overdue')) default 'pending',
  progress int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Generic per-crop harvest weighing log (the Hibiscus ledger is the first
-- real instance of this - table is crop-agnostic so any future paper
-- ledger can be transcribed the same way).
create table harvest_log (
  id uuid primary key default gen_random_uuid(),
  crop_name text not null,
  date date not null,
  quantity_kg numeric not null,
  confidence text check (confidence in ('high','low')) default 'high',
  source text default 'manual ledger transcription',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Livestock (chicken farm) - tables exist ahead of launch; stay empty until
-- chickenFarmStatus.operational is true.
-- ─────────────────────────────────────────────────────────────────────────

create table chicken_batches (
  id uuid primary key default gen_random_uuid(),
  shed text,
  batch_code text,
  breed text,
  count int,
  arrival_date date,
  age_weeks int,
  mortality int not null default 0,
  current_stock int
);

create table egg_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  batch_id uuid references chicken_batches(id) on delete cascade,
  total_eggs int not null default 0,
  damaged_eggs int not null default 0,
  saleable_eggs int not null default 0,
  sold_quantity int not null default 0
);

create table feed_logs (
  id uuid primary key default gen_random_uuid(),
  feed_type text,
  daily_consumption_kg numeric,
  remaining_stock_kg numeric,
  next_purchase_date date
);

create table vaccinations (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references chicken_batches(id) on delete cascade,
  type text check (type in ('Vaccination','Vitamin','Medicine','Deworming')),
  name text,
  due_date date,
  status text check (status in ('upcoming','completed','missed')) default 'upcoming'
);

create table chicken_health_records (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references chicken_batches(id) on delete cascade,
  date date not null,
  sick_birds int not null default 0,
  dead_birds int not null default 0,
  symptoms text,
  treatment text,
  recovery text
);

-- ─────────────────────────────────────────────────────────────────────────
-- Inventory & notifications
-- ─────────────────────────────────────────────────────────────────────────

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('Fertilizer','Pesticide','Seed','Tool','Equipment','Feed','Medicine')),
  stock numeric not null default 0,
  unit text,
  reorder_level numeric not null default 0,
  expiry_date date,
  last_stock_in date,
  last_stock_out date
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  category text,
  severity text check (severity in ('low','medium','high','critical')),
  created_at timestamptz not null default now(),
  read boolean not null default false
);

-- ─────────────────────────────────────────────────────────────────────────
-- AI Insights (mocked forecasts today - schema ready for a real vision
-- pipeline later)
-- ─────────────────────────────────────────────────────────────────────────

create table ai_analyses (
  id uuid primary key default gen_random_uuid(),
  area_id text references plantation_areas(id) on delete cascade,
  analyzed_at date not null default current_date,
  health_score int,
  confidence int,
  severity text check (severity in ('low','medium','high','critical')),
  detected_problems text[] not null default '{}',
  recommended_actions text[] not null default '{}',
  estimated_yield_kg numeric,
  expected_grade text,
  estimated_revenue numeric,
  days_remaining int,
  expected_harvest_date date,
  harvest_readiness_pct int,
  next_fertilizer jsonb,
  irrigation_recommendation jsonb,
  disease_prevention text[] not null default '{}',
  historical_comparison jsonb
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  role text check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Finance (real, transcribed from the P&L Cultivation Google Sheet)
-- ─────────────────────────────────────────────────────────────────────────

create table monthly_finance (
  month text primary key, -- e.g. 'Sep 2024'
  expenses numeric not null,
  income numeric not null
);

create table recent_monthly_detail (
  month text primary key, -- e.g. 'Jan 2026'
  total_expenses numeric not null,
  total_income numeric not null,
  profit_loss numeric not null,
  expense_note text
);

create table bank_fund (
  id int primary key default 1 check (id = 1),
  amount numeric not null,
  as_of date not null
);

create table crop_sales (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  crop_name text not null,
  quantity text,
  income_rs numeric not null
);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- Internal tool: any authenticated staff account can read/write. Tighten
-- per-role (e.g. only Finance can edit monthly_finance) once the app has
-- real multi-role logins.
-- ─────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'app_users','estate_location','chicken_farm_status','crops','plantation_areas',
      'facilities','greenhouses','crop_plan','daily_updates','plantation_tasks',
      'harvest_log','chicken_batches','egg_logs','feed_logs','vaccinations',
      'chicken_health_records','inventory_items','notifications','ai_analyses',
      'chat_messages','monthly_finance','recent_monthly_detail','bank_fund','crop_sales'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy "authenticated read/write" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t
    );
  end loop;
end $$;
