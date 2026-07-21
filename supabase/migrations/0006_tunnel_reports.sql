-- Tracks the single Telegram message used for each day's tunnel health
-- report PDF, so re-triggering the report later the same day edits that
-- message's attached file in place instead of posting a new document each
-- time (previously every tunnel update sent a brand new PDF, which spammed
-- the group when several tunnels were updated back-to-back).

create table tunnel_reports (
  date date primary key,
  telegram_message_id bigint,
  generated_at timestamptz not null default now()
);

alter table tunnel_reports enable row level security;
create policy "authenticated read/write" on tunnel_reports for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
