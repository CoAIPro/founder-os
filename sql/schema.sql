-- FounderOS.pro — Supabase Schema
-- Run this in your Supabase SQL editor

create extension if not exists "pgcrypto";

create table public.analyses (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),

  -- Input
  idea_text       text not null,
  idea_name       text,
  stage           text check (stage in ('idea', 'mvp', 'launched')),
  customer        text,

  -- AI output (structured JSON)
  result          jsonb not null,

  -- Traceability
  ip_hash         text not null,
  model           text not null default 'gpt-4o',
  prompt_version  text not null default 'v1.6',

  -- Engagement signals
  cta_clicked     boolean not null default false,
  useful_rating   smallint check (useful_rating between 1 and 5)
);

-- Index: rate limit queries (per IP, recent)
create index analyses_ip_hash_created_at_idx
  on public.analyses (ip_hash, created_at desc);

-- Index: results page lookup by ID
create index analyses_id_idx on public.analyses (id);

-- RLS: service role only (no public access)
alter table public.analyses enable row level security;

-- No public policies — all access via service role key from Next.js backend
-- Never expose this table directly to the browser client

-- ─────────────────────────────────────────────────────────────
-- MIGRATIONS — run these if upgrading from an earlier schema
-- ─────────────────────────────────────────────────────────────

-- Add stage column (if running v1.3+)
-- alter table public.analyses add column if not exists
--   stage text check (stage in ('idea', 'mvp', 'launched'));

-- Add customer column (if running v1.6+)
-- alter table public.analyses add column if not exists customer text;
