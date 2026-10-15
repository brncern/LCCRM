-- LawChat CRM — ilk şema
-- Supabase SQL Editor'da çalıştır ya da `supabase db push` ile uygula.

create extension if not exists "pgcrypto";

-- Giriş yapabilen kişiler. Tüm tablolar bu listeye göre korunur.
create table if not exists app_admins (
  email text primary key
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- Reklam kampanyaları (Meta + Google). id = '<platform>:<platform kampanya id>'
create table if not exists ad_campaigns (
  id text primary key,
  platform text not null check (platform in ('meta', 'google')),
  external_id text not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'limited', 'paused', 'removed')),
  updated_at timestamptz not null default now(),
  unique (platform, external_id)
);

-- Günlük reklam metrikleri (senkron işi doldurur)
create table if not exists ad_daily_metrics (
  campaign_id text not null references ad_campaigns (id) on delete cascade,
  date date not null,
  spend numeric(12, 2) not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  platform_leads integer not null default 0,
  primary key (campaign_id, date)
);
create index if not exists ad_daily_metrics_date_idx on ad_daily_metrics (date);

-- Lead'ler (gelen kutusundan ya da elle)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  topic text not null default '',
  channel text check (channel in ('instagram', 'messenger', 'whatsapp')),
  source text not null default 'organic' check (source in ('meta', 'google', 'organic')),
  campaign_id text references ad_campaigns (id) on delete set null,
  stage text not null default 'new'
    check (stage in ('new', 'contacted', 'qualified', 'proposal', 'customer', 'lost')),
  lost_reason text,
  notes text,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists leads_stage_idx on leads (stage);
create index if not exists leads_created_idx on leads (created_at);

-- Konuşmalar (Messenger / Instagram / WhatsApp)
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  channel text not null check (channel in ('instagram', 'messenger', 'whatsapp')),
  external_thread_id text not null,
  contact_name text not null,
  ad_id text,
  ad_name text,
  unread boolean not null default true,
  first_contact_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (channel, external_thread_id)
);
create index if not exists conversations_last_idx on conversations (last_message_at desc);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  external_id text unique,
  from_me boolean not null,
  body text not null,
  sent_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on messages (conversation_id, sent_at);

-- Ücretli abonelikler (4. aşama: ödeme sisteminden gelir). Dönüşüm = ücretli abone.
create table if not exists subscriptions (
  id text primary key,
  provider text not null,
  customer_ref text not null,
  lead_id uuid references leads (id) on delete set null,
  plan text,
  status text not null,
  amount numeric(12, 2),
  currency text default 'TRY',
  utm_source text,
  utm_campaign text,
  click_id text,
  started_at timestamptz not null default now()
);

-- Senkron kayıtları (hangi kaynak en son ne zaman başarıyla çekildi)
create table if not exists sync_runs (
  id bigserial primary key,
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean,
  error text
);

-- updated_at otomatik
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists leads_touch on leads;
create trigger leads_touch before update on leads for each row execute function touch_updated_at();

-- Satır düzeyi güvenlik: sadece app_admins listesindekiler
alter table app_admins enable row level security;
alter table ad_campaigns enable row level security;
alter table ad_daily_metrics enable row level security;
alter table leads enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table subscriptions enable row level security;
alter table sync_runs enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ad_campaigns', 'ad_daily_metrics', 'leads', 'conversations', 'messages', 'subscriptions', 'sync_runs']
  loop
    execute format('drop policy if exists admin_all on %I', t);
    execute format('create policy admin_all on %I for all to authenticated using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

drop policy if exists admin_read_self on app_admins;
create policy admin_read_self on app_admins for select to authenticated using (is_admin());

-- KENDİ E-POSTANI EKLE:
-- insert into app_admins (email) values ('sen@ornek.com');
