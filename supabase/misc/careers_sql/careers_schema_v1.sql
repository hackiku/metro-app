-- Create the careers schema
CREATE SCHEMA IF NOT EXISTS careers;

-- Career paths (visualized as metro lines)
CREATE TABLE IF NOT EXISTS careers.career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL, -- Hex color code for visualization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles (visualized as stations)
CREATE TABLE IF NOT EXISTS careers.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5), -- Seniority level
  career_path_id UUID NOT NULL REFERENCES careers.career_paths(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS careers.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('technical', 'soft', 'domain', 'leadership')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role skills (which skills are required for which roles)
CREATE TABLE IF NOT EXISTS careers.role_skills (
  role_id UUID REFERENCES careers.roles(id),
  skill_id UUID REFERENCES careers.skills(id),
  required_level INTEGER NOT NULL CHECK (required_level BETWEEN 1 AND 5),
  PRIMARY KEY (role_id, skill_id)
);

-- Role transitions (paths between roles)
CREATE TABLE IF NOT EXISTS careers.role_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_role_id UUID REFERENCES careers.roles(id),
  to_role_id UUID REFERENCES careers.roles(id),
  estimated_months INTEGER NOT NULL,
  is_recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_role_id, to_role_id)
);

-- Development steps (concrete actions to move between roles)
CREATE TABLE IF NOT EXISTS careers.development_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transition_id UUID NOT NULL REFERENCES careers.role_transitions(id),
  name TEXT NOT NULL,
  description TEXT,
  step_type TEXT NOT NULL CHECK (step_type IN ('training', 'experience', 'certification', 'mentoring')),
  duration_weeks INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS careers.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  current_role_id UUID REFERENCES careers.roles(id),
  target_role_id UUID REFERENCES careers.roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skills (current skills of users)
CREATE TABLE IF NOT EXISTS careers.user_skills (
  user_id UUID REFERENCES careers.users(id),
  skill_id UUID REFERENCES careers.skills(id),
  current_level INTEGER NOT NULL CHECK (current_level BETWEEN 0 AND 5),
  PRIMARY KEY (user_id, skill_id)
);

-- Development plans
CREATE TABLE IF NOT EXISTS careers.development_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES careers.users(id),
  target_role_id UUID NOT NULL REFERENCES careers.roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plan steps
CREATE TABLE IF NOT EXISTS careers.plan_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES careers.development_plans(id),
  development_step_id UUID NOT NULL REFERENCES careers.development_steps(id),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
