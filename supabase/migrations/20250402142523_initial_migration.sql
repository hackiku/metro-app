create table "public"."career_path_stations" (
    "id" uuid not null default gen_random_uuid(),
    "career_path_id" uuid,
    "job_family_id" uuid,
    "level" text not null,
    "position_order" integer not null
);


create table "public"."development_activities" (
    "id" uuid not null default gen_random_uuid(),
    "competence_id" uuid,
    "activity_type" text not null,
    "description" text not null
);


create table "public"."job_family_competences" (
    "id" uuid not null default gen_random_uuid(),
    "job_family_id" uuid,
    "competence_id" uuid,
    "importance_level" integer not null
);


create table "public"."skill_lines" (
    "id" uuid not null default uuid_generate_v4(),
    "category" text not null,
    "line_id" text not null,
    "name" text not null,
    "color" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."skill_stations" (
    "id" uuid not null default uuid_generate_v4(),
    "line_id" uuid,
    "station_id" text not null,
    "name" text not null,
    "level" integer not null,
    "x_position" integer not null,
    "y_position" integer not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."user_competences" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "competence_id" uuid,
    "current_level" integer not null,
    "target_level" integer,
    "last_assessed_at" timestamp with time zone default now()
);


create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "email" text not null,
    "full_name" text not null,
    "current_job_family_id" uuid,
    "level" text not null,
    "years_in_role" numeric(3,1) not null,
    "created_at" timestamp with time zone default now()
);


CREATE UNIQUE INDEX career_path_stations_pkey ON public.career_path_stations USING btree (id);

CREATE UNIQUE INDEX development_activities_pkey ON public.development_activities USING btree (id);

CREATE UNIQUE INDEX job_family_competences_pkey ON public.job_family_competences USING btree (id);

CREATE INDEX skill_lines_category_idx ON public.skill_lines USING btree (category);

CREATE UNIQUE INDEX skill_lines_pkey ON public.skill_lines USING btree (id);

CREATE INDEX skill_stations_line_id_idx ON public.skill_stations USING btree (line_id);

CREATE UNIQUE INDEX skill_stations_pkey ON public.skill_stations USING btree (id);

CREATE UNIQUE INDEX user_competences_pkey ON public.user_competences USING btree (id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."career_path_stations" add constraint "career_path_stations_pkey" PRIMARY KEY using index "career_path_stations_pkey";

alter table "public"."development_activities" add constraint "development_activities_pkey" PRIMARY KEY using index "development_activities_pkey";

alter table "public"."job_family_competences" add constraint "job_family_competences_pkey" PRIMARY KEY using index "job_family_competences_pkey";

alter table "public"."skill_lines" add constraint "skill_lines_pkey" PRIMARY KEY using index "skill_lines_pkey";

alter table "public"."skill_stations" add constraint "skill_stations_pkey" PRIMARY KEY using index "skill_stations_pkey";

alter table "public"."user_competences" add constraint "user_competences_pkey" PRIMARY KEY using index "user_competences_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."career_path_stations" add constraint "career_path_stations_career_path_id_fkey" FOREIGN KEY (career_path_id) REFERENCES career_paths(id) not valid;

alter table "public"."career_path_stations" validate constraint "career_path_stations_career_path_id_fkey";

alter table "public"."career_path_stations" add constraint "career_path_stations_job_family_id_fkey" FOREIGN KEY (job_family_id) REFERENCES job_families(id) not valid;

alter table "public"."career_path_stations" validate constraint "career_path_stations_job_family_id_fkey";

alter table "public"."career_path_stations" add constraint "career_path_stations_level_check" CHECK ((level = ANY (ARRAY['Junior'::text, 'Medior'::text, 'Senior'::text, 'Lead'::text]))) not valid;

alter table "public"."career_path_stations" validate constraint "career_path_stations_level_check";

alter table "public"."development_activities" add constraint "development_activities_activity_type_check" CHECK ((activity_type = ANY (ARRAY['job'::text, 'social'::text, 'formal'::text]))) not valid;

alter table "public"."development_activities" validate constraint "development_activities_activity_type_check";

alter table "public"."development_activities" add constraint "development_activities_competence_id_fkey" FOREIGN KEY (competence_id) REFERENCES competences(id) not valid;

alter table "public"."development_activities" validate constraint "development_activities_competence_id_fkey";

alter table "public"."job_family_competences" add constraint "job_family_competences_competence_id_fkey" FOREIGN KEY (competence_id) REFERENCES competences(id) not valid;

alter table "public"."job_family_competences" validate constraint "job_family_competences_competence_id_fkey";

alter table "public"."job_family_competences" add constraint "job_family_competences_job_family_id_fkey" FOREIGN KEY (job_family_id) REFERENCES job_families(id) not valid;

alter table "public"."job_family_competences" validate constraint "job_family_competences_job_family_id_fkey";

alter table "public"."skill_stations" add constraint "skill_stations_line_id_fkey" FOREIGN KEY (line_id) REFERENCES skill_lines(id) not valid;

alter table "public"."skill_stations" validate constraint "skill_stations_line_id_fkey";

alter table "public"."user_competences" add constraint "user_competences_competence_id_fkey" FOREIGN KEY (competence_id) REFERENCES competences(id) not valid;

alter table "public"."user_competences" validate constraint "user_competences_competence_id_fkey";

alter table "public"."user_competences" add constraint "user_competences_current_level_check" CHECK (((current_level >= 1) AND (current_level <= 100))) not valid;

alter table "public"."user_competences" validate constraint "user_competences_current_level_check";

alter table "public"."user_competences" add constraint "user_competences_target_level_check" CHECK (((target_level >= 1) AND (target_level <= 100))) not valid;

alter table "public"."user_competences" validate constraint "user_competences_target_level_check";

alter table "public"."user_competences" add constraint "user_competences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."user_competences" validate constraint "user_competences_user_id_fkey";

alter table "public"."users" add constraint "users_current_job_family_id_fkey" FOREIGN KEY (current_job_family_id) REFERENCES job_families(id) not valid;

alter table "public"."users" validate constraint "users_current_job_family_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_level_check" CHECK ((level = ANY (ARRAY['Junior'::text, 'Medior'::text, 'Senior'::text, 'Lead'::text]))) not valid;

alter table "public"."users" validate constraint "users_level_check";

grant delete on table "public"."career_path_stations" to "anon";

grant insert on table "public"."career_path_stations" to "anon";

grant references on table "public"."career_path_stations" to "anon";

grant select on table "public"."career_path_stations" to "anon";

grant trigger on table "public"."career_path_stations" to "anon";

grant truncate on table "public"."career_path_stations" to "anon";

grant update on table "public"."career_path_stations" to "anon";

grant delete on table "public"."career_path_stations" to "authenticated";

grant insert on table "public"."career_path_stations" to "authenticated";

grant references on table "public"."career_path_stations" to "authenticated";

grant select on table "public"."career_path_stations" to "authenticated";

grant trigger on table "public"."career_path_stations" to "authenticated";

grant truncate on table "public"."career_path_stations" to "authenticated";

grant update on table "public"."career_path_stations" to "authenticated";

grant delete on table "public"."career_path_stations" to "service_role";

grant insert on table "public"."career_path_stations" to "service_role";

grant references on table "public"."career_path_stations" to "service_role";

grant select on table "public"."career_path_stations" to "service_role";

grant trigger on table "public"."career_path_stations" to "service_role";

grant truncate on table "public"."career_path_stations" to "service_role";

grant update on table "public"."career_path_stations" to "service_role";

grant delete on table "public"."development_activities" to "anon";

grant insert on table "public"."development_activities" to "anon";

grant references on table "public"."development_activities" to "anon";

grant select on table "public"."development_activities" to "anon";

grant trigger on table "public"."development_activities" to "anon";

grant truncate on table "public"."development_activities" to "anon";

grant update on table "public"."development_activities" to "anon";

grant delete on table "public"."development_activities" to "authenticated";

grant insert on table "public"."development_activities" to "authenticated";

grant references on table "public"."development_activities" to "authenticated";

grant select on table "public"."development_activities" to "authenticated";

grant trigger on table "public"."development_activities" to "authenticated";

grant truncate on table "public"."development_activities" to "authenticated";

grant update on table "public"."development_activities" to "authenticated";

grant delete on table "public"."development_activities" to "service_role";

grant insert on table "public"."development_activities" to "service_role";

grant references on table "public"."development_activities" to "service_role";

grant select on table "public"."development_activities" to "service_role";

grant trigger on table "public"."development_activities" to "service_role";

grant truncate on table "public"."development_activities" to "service_role";

grant update on table "public"."development_activities" to "service_role";

grant delete on table "public"."job_family_competences" to "anon";

grant insert on table "public"."job_family_competences" to "anon";

grant references on table "public"."job_family_competences" to "anon";

grant select on table "public"."job_family_competences" to "anon";

grant trigger on table "public"."job_family_competences" to "anon";

grant truncate on table "public"."job_family_competences" to "anon";

grant update on table "public"."job_family_competences" to "anon";

grant delete on table "public"."job_family_competences" to "authenticated";

grant insert on table "public"."job_family_competences" to "authenticated";

grant references on table "public"."job_family_competences" to "authenticated";

grant select on table "public"."job_family_competences" to "authenticated";

grant trigger on table "public"."job_family_competences" to "authenticated";

grant truncate on table "public"."job_family_competences" to "authenticated";

grant update on table "public"."job_family_competences" to "authenticated";

grant delete on table "public"."job_family_competences" to "service_role";

grant insert on table "public"."job_family_competences" to "service_role";

grant references on table "public"."job_family_competences" to "service_role";

grant select on table "public"."job_family_competences" to "service_role";

grant trigger on table "public"."job_family_competences" to "service_role";

grant truncate on table "public"."job_family_competences" to "service_role";

grant update on table "public"."job_family_competences" to "service_role";

grant delete on table "public"."skill_lines" to "anon";

grant insert on table "public"."skill_lines" to "anon";

grant references on table "public"."skill_lines" to "anon";

grant select on table "public"."skill_lines" to "anon";

grant trigger on table "public"."skill_lines" to "anon";

grant truncate on table "public"."skill_lines" to "anon";

grant update on table "public"."skill_lines" to "anon";

grant delete on table "public"."skill_lines" to "authenticated";

grant insert on table "public"."skill_lines" to "authenticated";

grant references on table "public"."skill_lines" to "authenticated";

grant select on table "public"."skill_lines" to "authenticated";

grant trigger on table "public"."skill_lines" to "authenticated";

grant truncate on table "public"."skill_lines" to "authenticated";

grant update on table "public"."skill_lines" to "authenticated";

grant delete on table "public"."skill_lines" to "service_role";

grant insert on table "public"."skill_lines" to "service_role";

grant references on table "public"."skill_lines" to "service_role";

grant select on table "public"."skill_lines" to "service_role";

grant trigger on table "public"."skill_lines" to "service_role";

grant truncate on table "public"."skill_lines" to "service_role";

grant update on table "public"."skill_lines" to "service_role";

grant delete on table "public"."skill_stations" to "anon";

grant insert on table "public"."skill_stations" to "anon";

grant references on table "public"."skill_stations" to "anon";

grant select on table "public"."skill_stations" to "anon";

grant trigger on table "public"."skill_stations" to "anon";

grant truncate on table "public"."skill_stations" to "anon";

grant update on table "public"."skill_stations" to "anon";

grant delete on table "public"."skill_stations" to "authenticated";

grant insert on table "public"."skill_stations" to "authenticated";

grant references on table "public"."skill_stations" to "authenticated";

grant select on table "public"."skill_stations" to "authenticated";

grant trigger on table "public"."skill_stations" to "authenticated";

grant truncate on table "public"."skill_stations" to "authenticated";

grant update on table "public"."skill_stations" to "authenticated";

grant delete on table "public"."skill_stations" to "service_role";

grant insert on table "public"."skill_stations" to "service_role";

grant references on table "public"."skill_stations" to "service_role";

grant select on table "public"."skill_stations" to "service_role";

grant trigger on table "public"."skill_stations" to "service_role";

grant truncate on table "public"."skill_stations" to "service_role";

grant update on table "public"."skill_stations" to "service_role";

grant delete on table "public"."user_competences" to "anon";

grant insert on table "public"."user_competences" to "anon";

grant references on table "public"."user_competences" to "anon";

grant select on table "public"."user_competences" to "anon";

grant trigger on table "public"."user_competences" to "anon";

grant truncate on table "public"."user_competences" to "anon";

grant update on table "public"."user_competences" to "anon";

grant delete on table "public"."user_competences" to "authenticated";

grant insert on table "public"."user_competences" to "authenticated";

grant references on table "public"."user_competences" to "authenticated";

grant select on table "public"."user_competences" to "authenticated";

grant trigger on table "public"."user_competences" to "authenticated";

grant truncate on table "public"."user_competences" to "authenticated";

grant update on table "public"."user_competences" to "authenticated";

grant delete on table "public"."user_competences" to "service_role";

grant insert on table "public"."user_competences" to "service_role";

grant references on table "public"."user_competences" to "service_role";

grant select on table "public"."user_competences" to "service_role";

grant trigger on table "public"."user_competences" to "service_role";

grant truncate on table "public"."user_competences" to "service_role";

grant update on table "public"."user_competences" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


