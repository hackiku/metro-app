-- Create the Gasunie schema
CREATE SCHEMA IF NOT EXISTS gasunie;

-- Organization table (in public schema as it's shared)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT, -- For UI theming
  secondary_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business units (divisions within Gasunie)
CREATE TABLE IF NOT EXISTS gasunie.business_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  abbreviation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metro lines (representing career tracks or strategic pillars)
CREATE TABLE IF NOT EXISTS gasunie.metro_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL, -- Hex color code
  abbreviation TEXT,
  business_unit_id UUID REFERENCES gasunie.business_units(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job levels (shared across roles)
CREATE TABLE IF NOT EXISTS gasunie.job_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  level_number INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metro stations (representing specific job roles)
CREATE TABLE IF NOT EXISTS gasunie.metro_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  metro_line_id UUID NOT NULL REFERENCES gasunie.metro_lines(id),
  job_level_id UUID NOT NULL REFERENCES gasunie.job_levels(id),
  is_interchange BOOLEAN DEFAULT FALSE, -- True if this is an interchange between multiple lines
  position_x FLOAT NOT NULL, -- X coordinate on the map
  position_y FLOAT NOT NULL, -- Y coordinate on the map
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Station connections (paths between stations)
CREATE TABLE IF NOT EXISTS gasunie.station_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_station_id UUID NOT NULL REFERENCES gasunie.metro_stations(id),
  to_station_id UUID NOT NULL REFERENCES gasunie.metro_stations(id),
  transition_difficulty INTEGER, -- 1-5 scale of difficulty
  estimated_months INTEGER, -- Estimated time to transition
  is_recommended BOOLEAN DEFAULT FALSE, -- For highlighting recommended paths
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_station_id, to_station_id)
);

-- Skills (competencies needed for roles)
CREATE TABLE IF NOT EXISTS gasunie.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  skill_type TEXT, -- Technical, Soft, Leadership, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Station skills (which skills are needed for which stations/roles)
CREATE TABLE IF NOT EXISTS gasunie.station_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES gasunie.metro_stations(id),
  skill_id UUID NOT NULL REFERENCES gasunie.skills(id),
  importance_level INTEGER NOT NULL, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(station_id, skill_id)
);

-- Development steps (concrete actions to move between stations)
CREATE TABLE IF NOT EXISTS gasunie.development_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES gasunie.station_connections(id),
  name TEXT NOT NULL,
  description TEXT,
  step_type TEXT, -- Training, Certification, Project Experience, etc.
  duration_weeks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training programs (TOP class, HighTech, etc.)
CREATE TABLE IF NOT EXISTS gasunie.training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lines interconnections (which lines connect at interchange stations)
CREATE TABLE IF NOT EXISTS gasunie.line_interconnections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES gasunie.metro_stations(id),
  line_one_id UUID NOT NULL REFERENCES gasunie.metro_lines(id),
  line_two_id UUID NOT NULL REFERENCES gasunie.metro_lines(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(station_id, line_one_id, line_two_id)
);

-- Demo users (for presentation purposes)
CREATE TABLE IF NOT EXISTS gasunie.demo_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  current_station_id UUID REFERENCES gasunie.metro_stations(id),
  years_experience INTEGER,
  profile_description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interests (for personalized recommendations)
CREATE TABLE IF NOT EXISTS gasunie.user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES gasunie.demo_users(id),
  metro_line_id UUID NOT NULL REFERENCES gasunie.metro_lines(id),
  interest_level INTEGER NOT NULL, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metro_line_id)
);

-- User skills (current skills of the user)
CREATE TABLE IF NOT EXISTS gasunie.user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES gasunie.demo_users(id),
  skill_id UUID NOT NULL REFERENCES gasunie.skills(id),
  proficiency_level INTEGER NOT NULL, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Career plans (saved routes for users)
CREATE TABLE IF NOT EXISTS gasunie.career_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES gasunie.demo_users(id),
  name TEXT NOT NULL,
  description TEXT,
  target_station_id UUID NOT NULL REFERENCES gasunie.metro_stations(id),
  estimated_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career plan steps (stations along the career plan)
CREATE TABLE IF NOT EXISTS gasunie.career_plan_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_plan_id UUID NOT NULL REFERENCES gasunie.career_plans(id),
  station_id UUID NOT NULL REFERENCES gasunie.metro_stations(id),
  step_order INTEGER NOT NULL,
  estimated_start_date DATE,
  estimated_end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(career_plan_id, step_order)
);