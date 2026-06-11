-- ============================================================
-- FLUIQ — Esquema de la tabla de leads en Supabase
-- ------------------------------------------------------------
-- Ejecutar en: Supabase -> SQL Editor -> New query -> Run
-- ============================================================

create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  email       text not null,
  consultora  text not null,
  mensaje     text,
  tamano      text,
  dolor       text,
  origen      text default 'sitio',
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

-- Índices para consultas y para el rate-limiting por IP
create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_ip_created_idx on public.leads (ip, created_at desc);

-- ------------------------------------------------------------
-- Seguridad: Row Level Security activado.
-- La función serverless usa la clave service_role, que IGNORA
-- las políticas RLS, por lo que NO definimos políticas públicas.
-- Esto garantiza que nadie con la clave anónima pueda leer ni
-- escribir la tabla desde el navegador.
-- ------------------------------------------------------------
alter table public.leads enable row level security;

-- (Sin políticas) => acceso denegado a anon/authenticated.
-- Solo el backend con service_role puede insertar y leer.
