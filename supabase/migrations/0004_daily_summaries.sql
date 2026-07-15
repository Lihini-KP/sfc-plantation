-- One AI-written summary per day, compiled from that day's daily_updates
-- entries, and mirrored to a Telegram group. telegram_message_id lets the
-- summary text be edited in place as more updates come in through the day
-- instead of spamming a new message each time. sent_photo_urls tracks which
-- of that day's photos have already been posted to Telegram so the same
-- photo isn't sent twice as more updates are logged.

create table daily_summaries (
  date date primary key,
  summary text not null,
  telegram_message_id bigint,
  sent_photo_urls text[] not null default '{}',
  generated_at timestamptz not null default now()
);

alter table daily_summaries enable row level security;
create policy "authenticated read/write" on daily_summaries for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
