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


create table public.users (
  id uuid not null default gen_random_uuid (),
  email text not null,
  full_name text not null,
  current_job_family_id uuid null,
  level text not null,
  years_in_role numeric(3, 1) not null,
  created_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_current_job_family_id_fkey foreign KEY (current_job_family_id) references job_families (id),
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



------------ LINKAGE TABLES ------------

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


create table public.position_details (
  id uuid not null default extensions.uuid_generate_v4 (),
  organization_id uuid not null,
  position_id uuid not null,
  career_path_id uuid not null,
  level integer not null,
  path_specific_description text null,
  sequence_in_path integer null,
  created_at timestamp with time zone not null default now(),
  constraint position_details_pkey primary key (id),
  constraint unique_org_position_path unique (organization_id, position_id, career_path_id),
  constraint fk_career_path foreign KEY (career_path_id) references career_paths (id) on delete CASCADE,
  constraint fk_organization foreign KEY (organization_id) references organizations (id) on delete CASCADE,
  constraint fk_position foreign KEY (position_id) references positions (id) on delete CASCADE,
  constraint position_details_level_check check ((level > 0))
) TABLESPACE pg_default;

create index IF not exists idx_position_details_organization_id on public.position_details using btree (organization_id) TABLESPACE pg_default;

create index IF not exists idx_position_details_position_id on public.position_details using btree (position_id) TABLESPACE pg_default;

create index IF not exists idx_position_details_career_path_id on public.position_details using btree (career_path_id) TABLESPACE pg_default;



create table public.user_competences (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  competence_id uuid null,
  current_level integer not null,
  target_level integer null,
  last_assessed_at timestamp with time zone null default now(),
  constraint user_competences_pkey primary key (id),
  constraint user_competences_competence_id_fkey foreign KEY (competence_id) references competences (id),
  constraint user_competences_user_id_fkey foreign KEY (user_id) references users (id),
  constraint user_competences_current_level_check check (
    (
      (current_level >= 1)
      and (current_level <= 100)
    )
  ),
  constraint user_competences_target_level_check check (
    (
      (target_level >= 1)
      and (target_level <= 100)
    )
  )
) TABLESPACE pg_default;


---------------- OLD TABLES STILL NOT LINKED TO CONTEXTS ----------------

create table public.competences (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  description text null,
  constraint competences_pkey primary key (id)
) TABLESPACE pg_default;



