-- HARTI weekly Passion Fruit market data + saved AI analysis history.
-- harti_weekly_source: the real figures parsed from each week's HARTI
-- Weekly Food Commodities Bulletin (used as a fallback if a future week's
-- live fetch/parse fails, so the app never fabricates numbers).
-- harti_weekly_analysis: the AI-generated comparison saved once per week,
-- regenerated automatically every Monday by a Netlify scheduled function.

create table harti_weekly_source (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  bulletin_volume int,
  bulletin_issue int,
  pdf_url text,
  wholesale_range_low numeric,
  wholesale_range_high numeric,
  wholesale_avg_this_week numeric,
  wholesale_avg_last_week numeric,
  wholesale_avg_same_week_last_year numeric,
  fetched_at timestamptz not null default now(),
  unique (week_start, week_end)
);

create table harti_weekly_analysis (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  week_end date not null,
  analysis jsonb not null,
  generated_at timestamptz not null default now(),
  unique (week_start, week_end)
);

alter table harti_weekly_source enable row level security;
create policy "authenticated read/write" on harti_weekly_source for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

alter table harti_weekly_analysis enable row level security;
create policy "authenticated read/write" on harti_weekly_analysis for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
