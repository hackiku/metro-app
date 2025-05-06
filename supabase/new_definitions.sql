
--------------------

create table public.competences (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  description text null,
  category text null,
  organization_id uuid null,
  constraint competences_pkey primary key (id)
) TABLESPACE pg_default;

--------------------

create table public.development_activities (
  id uuid not null default gen_random_uuid (),
  competence_id uuid null,
  activity_type text not null,
  description text not null,
  constraint development_activities_pkey primary key (id),
  constraint development_activities_competence_id_fkey foreign KEY (competence_id) references competences (id),
  constraint development_activities_activity_type_check check (
    (
      activity_type = any (
        array['job'::text, 'social'::text, 'formal'::text]
      )
    )
  )
) TABLESPACE pg_default;

--------------------

CREATE TABLE
	public.plan_actions (
		id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4 (),
		phase_id uuid NOT NULL REFERENCES plan_phases (id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		description TEXT, -- Optional extra detail
		category TEXT NOT NULL, -- Mentoring, Task, Training, Project, Other
		status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
		due_date DATE NULL,
		-- learning_resource_id uuid NULL REFERENCES learning_resources(id) ON DELETE SET NULL, -- Link for later
		created_at TIMESTAMPTZ DEFAULT now (),
		updated_at TIMESTAMPTZ DEFAULT now ()
	);

CREATE INDEX idx_plan_actions_phase_id ON public.plan_actions (phase_id);

CREATE INDEX idx_plan_actions_status ON public.plan_actions (status); -- To quickly find todo/in-progress

--------------------

CREATE TABLE
	public.plan_phases (
		id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4 (),
		plan_id uuid NOT NULL REFERENCES user_career_plans (id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		description TEXT,
		sequence INTEGER NOT NULL, -- Order of phases
		duration TEXT, -- Store display string e.g., "3 months"
		created_at TIMESTAMPTZ DEFAULT now (),
		UNIQUE (plan_id, sequence)
	);

CREATE INDEX idx_plan_phases_plan_id ON public.plan_phases (plan_id);

----------------

create table public.position_details (
  id uuid not null default extensions.uuid_generate_v4 (),
  organization_id uuid not null,
  position_id uuid not null,
  career_path_id uuid not null,
  level integer not null,
  path_specific_description text null,
  sequence_in_path integer null,
  created_at timestamp with time zone not null default now(),
  work_focus text null,
  team_interaction text null,
  work_style text null,
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

----------------

create table public.learning_resources (
  id uuid not null default extensions.uuid_generate_v4 (),
  organization_id uuid null,
  title text not null,
  description text null,
  url text null,
  type text not null,
  source text null,
  estimated_duration text null,
  created_at timestamp with time zone null default now(),
  constraint learning_resources_pkey primary key (id),
  constraint learning_resources_organization_id_fkey foreign KEY (organization_id) references organizations (id) on delete CASCADE,
  constraint learning_resources_url_check check (
    (
      (url is null)
      or (url ~~ 'http%'::text)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_learning_resources_org_id on public.learning_resources using btree (organization_id) TABLESPACE pg_default;

--------------------

CREATE TABLE
	public.user_career_plans (
		id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4 (),
		user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
		organization_id uuid NOT NULL REFERENCES organizations (id) ON DELETE CASCADE, -- Good for scoping queries
		target_position_details_id uuid NOT NULL REFERENCES position_details (id) ON DELETE CASCADE,
		status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
		estimated_total_duration TEXT, -- Store display string e.g., "12-18 months"
		notes TEXT, -- General notes about the plan
		created_at TIMESTAMPTZ DEFAULT now (),
		updated_at TIMESTAMPTZ DEFAULT now ()
		-- Consider UNIQUE (user_id, status) where status = 'active' if only one active plan allowed
	);

CREATE INDEX idx_user_career_plans_user_org ON public.user_career_plans (user_id, organization_id);

CREATE INDEX idx_user_career_plans_target ON public.user_career_plans (target_position_details_id);

--------------------

create table public.user_competences (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  competence_id uuid null,
  target_level integer null,
  last_assessed_at timestamp with time zone null default now(),
  current_level integer not null,
  constraint user_competences_pkey primary key (id),
  constraint user_competences_competence_id_fkey foreign KEY (competence_id) references competences (id),
  constraint user_competences_user_id_fkey foreign KEY (user_id) references users (id),
  constraint user_competences_current_level_check check (
    (
      (current_level >= 0)
      and (current_level <= 5)
    )
  )
) TABLESPACE pg_default;


--------------------

create table public.position_detail_competences (
  id uuid not null default extensions.uuid_generate_v4 (),
  position_details_id uuid not null,
  competence_id uuid not null,
  required_level integer not null,
  importance_level integer null,
  created_at timestamp with time zone not null default now(),
  constraint position_detail_competences_pkey primary key (id),
  constraint position_detail_competences_position_details_id_competence__key unique (position_details_id, competence_id),
  constraint position_detail_competences_competence_id_fkey foreign KEY (competence_id) references competences (id) on delete CASCADE,
  constraint position_detail_competences_position_details_id_fkey foreign KEY (position_details_id) references position_details (id) on delete CASCADE,
  constraint position_detail_competences_importance_level_check check (
    (
      (importance_level >= 1)
      and (importance_level <= 5)
    )
  ),
  constraint position_detail_competences_level_scale_check check (
    (
      (required_level >= 0)
      and (required_level <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_pdc_position_details_id on public.position_detail_competences using btree (position_details_id) TABLESPACE pg_default;

create index IF not exists idx_pdc_competence_id on public.position_detail_competences using btree (competence_id) TABLESPACE pg_default;