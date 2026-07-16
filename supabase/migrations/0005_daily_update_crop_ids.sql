-- Lets a single Daily Update entry cover multiple crops (e.g. a watering
-- round that touches several crop plots at once), not just one. Adds
-- crop_ids as an array alongside the existing single crop_id column -
-- crop_id is left in place (not dropped) so existing rows stay readable;
-- new entries populate crop_ids and the app reads that first, falling back
-- to crop_id for older rows that predate this change.

alter table daily_updates add column crop_ids text[] not null default '{}';
