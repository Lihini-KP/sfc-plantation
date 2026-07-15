-- Daily Plantation Update photo uploads. The Photos/Videos field on the Log
-- New Update form was previously a disabled placeholder ("connects to
-- Supabase Storage once the platform goes live"). Rather than a separate
-- object storage bucket, this follows the same pattern already used for
-- tunnel_photo_logs: compressed photos stored directly as data URLs in a
-- text[] column, shared across every device/user via the existing table.

alter table daily_updates add column photos text[] not null default '{}';
