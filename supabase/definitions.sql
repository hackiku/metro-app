
-- fundamental tables currently included in global context and 
-- tRPC procedures that talk to db and ensure multi-tenancy

create table public.organizations (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  description text null,
  logo_url text null,
  primary_color text null,
  secondary_color text null,
  created_at timestamp with time zone null default now(),
  docs jsonb null,
  constraint organizations_pkey primary key (id)
) TABLESPACE pg_default;

--------------------

create table public.users (
  id uuid not null default gen_random_uuid (),
  email text not null,
  full_name text not null,
  level text not null,
  years_in_role numeric(3, 1) not null,
  created_at timestamp with time zone null default now(),
  current_position_details_id uuid null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint fk_users_current_position_details foreign KEY (current_position_details_id) references position_details (id) on delete set null,
  constraint users_level_check check (
    (
      level = any (
        array[
          'Junior'::text,
          'Medior'::text,
          'Senior'::text,
          'Lead'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


--------------------

create table public.career_paths (
  id uuid not null default extensions.uuid_generate_v4 (),
  organization_id uuid not null,
  name text not null,
  description text null,
  color text null,
  created_at timestamp with time zone not null default now(),
  constraint career_paths_pkey primary key (id),
  constraint fk_organization foreign KEY (organization_id) references organizations (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_career_paths_organization_id on public.career_paths using btree (organization_id) TABLESPACE pg_default;


--------------------

create table public.positions (
  id uuid not null default extensions.uuid_generate_v4 (),
  organization_id uuid not null,
  name text not null,
  base_description text null,
  created_at timestamp with time zone not null default now(),
  constraint positions_pkey primary key (id),
  constraint fk_organization foreign KEY (organization_id) references organizations (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_positions_organization_id on public.positions using btree (organization_id) TABLESPACE pg_default;


------------ JUNCTION TABLES ------------

create table public.user_organizations (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  organization_id uuid not null,
  is_primary boolean null default false,
  role text null default 'member'::text,
  created_at timestamp with time zone null default now(),
  constraint user_organizations_pkey primary key (id),
  constraint user_organizations_user_id_organization_id_key unique (user_id, organization_id),
  constraint user_organizations_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
  constraint user_organizations_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_organizations_user_id on public.user_organizations using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_organizations_org_id on public.user_organizations using btree (organization_id) TABLESPACE pg_default;

--------------------



