-- Insert Organization
INSERT INTO public.organizations (name, description, logo_url, primary_color, secondary_color)
VALUES 
  ('Gasunie', 'Dutch natural gas infrastructure and transportation company transitioning to broader energy solutions', 'https://www.gasunie.nl/images/default-source/interface/gasunie-logo.svg', '#FF671F', '#003366');

-- Insert Business Units
INSERT INTO gasunie.business_units (name, description, abbreviation)
VALUES
  ('Gasunie Transport Services', 'The Netherlands gas transport division operating the national network', 'GTS'),
  ('Gasunie Deutschland', 'German subsidiary managing gas transport in northern Germany', 'GUD'),
  ('Participations & Business Development', 'Non-regulated activities including joint ventures and new energy projects', 'P&BD'),
  ('Corporate', 'Central functions supporting all business operations', 'CORP');

-- Insert Metro Lines (Career Tracks)
INSERT INTO gasunie.metro_lines (name, description, color, abbreviation, business_unit_id)
VALUES
  ('Optimizing Infrastructure', 'Roles focused on maintaining and improving existing gas infrastructure', '#003366', 'OI', (SELECT id FROM gasunie.business_units WHERE abbreviation = 'GTS')),
  ('Energy Transition', 'Forward-looking positions developing hydrogen, CCS, heat networks, and green gas solutions', '#FF671F', 'ET', (SELECT id FROM gasunie.business_units WHERE abbreviation = 'P&BD')),
  ('Corporate Support', 'Essential business functions supporting all operations and strategic initiatives', '#666666', 'CS', (SELECT id FROM gasunie.business_units WHERE abbreviation = 'CORP'));

-- Insert Job Levels
INSERT INTO gasunie.job_levels (name, level_number, description)
VALUES
  ('Junior', 1, 'Entry-level professionals with 0-3 years of experience'),
  ('Medior', 2, 'Mid-level professionals with 3-7 years of experience'),
  ('Senior', 3, 'Experienced professionals with 7+ years of expertise'),
  ('Expert', 4, 'Recognized specialists with deep domain knowledge'),
  ('Lead', 5, 'Leadership positions managing teams and strategic initiatives');

-- Insert Skills
INSERT INTO gasunie.skills (name, description, skill_type)
VALUES
  ('Pipeline Engineering', 'Design, maintenance, and optimization of gas pipelines', 'Technical'),
  ('Hydrogen Technology', 'Expertise in hydrogen production, storage, and transport systems', 'Technical'),
  ('Project Management', 'Planning, execution, and oversight of complex infrastructure projects', 'Management'),
  ('Regulatory Affairs', 'Knowledge of energy regulations and compliance requirements', 'Specialist'),
  ('Leadership', 'Team management and strategic direction setting', 'Soft'),
  ('Carbon Capture & Storage', 'Expertise in CCS technologies and implementation', 'Technical'),
  ('Financial Analysis', 'Budgeting, forecasting, and financial planning', 'Specialist'),
  ('Safety Management', 'Implementing and overseeing safety protocols and standards', 'Specialist');

-- Insert Training Programs
INSERT INTO gasunie.training_programs (name, description, duration_weeks)
VALUES
  ('TOP Class', 'Leadership development program for future senior managers', 52),
  ('HighTech', 'Technical leadership program for operational managers', 36),
  ('Energy Transition Academy', 'Training on hydrogen, CCS, and renewable gas technologies', 24),
  ('Safety Excellence', 'Comprehensive safety training and certification', 12);



-- Insert Metro Stations
INSERT INTO gasunie.metro_stations (name, description, metro_line_id, job_level_id, is_interchange, position_x, position_y)
VALUES
  -- Optimizing Infrastructure Line
  ('Pipeline Engineer', 'Designs and maintains gas transportation pipeline systems', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Optimizing Infrastructure'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Medior'), 
   false, 10, 10),
   
  ('Asset Manager', 'Oversees gas infrastructure assets and maintenance planning', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Optimizing Infrastructure'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Senior'), 
   false, 20, 10),
   
  ('Operations Manager', 'Manages day-to-day operations of gas transport facilities', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Optimizing Infrastructure'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Lead'), 
   true, 30, 10),
  
  -- Energy Transition Line
  ('Hydrogen Specialist', 'Develops hydrogen production and transportation solutions', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Energy Transition'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Medior'), 
   false, 10, 30),
   
  ('CCS Project Lead', 'Leads carbon capture and storage initiatives', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Energy Transition'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Senior'), 
   false, 20, 30),
   
  ('Energy Transition Director', 'Strategic leadership for new energy solutions', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Energy Transition'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Lead'), 
   true, 30, 30),
  
  -- Corporate Support Line
  ('HR Specialist', 'Supports workforce development and organizational culture', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Medior'), 
   false, 10, 50),
   
  ('Financial Controller', 'Manages financial planning and reporting', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Senior'), 
   false, 20, 50),
   
  ('Corporate Affairs Director', 'Oversees communications, public affairs, and stakeholder relations', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Lead'), 
   true, 30, 50),
  
  -- Interchange Stations
  ('Project Manager', 'Manages complex infrastructure and energy transition projects', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Optimizing Infrastructure'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Senior'), 
   true, 25, 20),
   
  ('Safety Officer', 'Ensures compliance with safety standards across operations', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Medior'), 
   true, 15, 40),
   
  ('Innovation Lead', 'Drives innovation in energy technologies and business models', 
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Energy Transition'), 
   (SELECT id FROM gasunie.job_levels WHERE name = 'Expert'), 
   true, 35, 40);

-- Insert Station Connections
INSERT INTO gasunie.station_connections (from_station_id, to_station_id, transition_difficulty, estimated_months, is_recommended)
VALUES
  -- Horizontal progression within Optimizing Infrastructure
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager'), 
   2, 18, true),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Operations Manager'), 
   3, 24, true),
  
  -- Horizontal progression within Energy Transition
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'CCS Project Lead'), 
   2, 18, true),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'CCS Project Lead'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Energy Transition Director'), 
   4, 30, false),
  
  -- Horizontal progression within Corporate Support
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'HR Specialist'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Financial Controller'), 
   2, 12, false),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Financial Controller'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Corporate Affairs Director'), 
   3, 24, false),
  
  -- Cross-track transitions
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist'), 
   4, 24, true),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager'), 
   2, 12, true),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'CCS Project Lead'), 
   3, 18, true),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'HR Specialist'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Safety Officer'), 
   1, 6, false),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Safety Officer'), 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Innovation Lead'), 
   3, 18, true);

-- Insert Line Interconnections
INSERT INTO gasunie.line_interconnections (station_id, line_one_id, line_two_id)
VALUES
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Optimizing Infrastructure'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Energy Transition')),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Safety Officer'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Optimizing Infrastructure')),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Innovation Lead'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Energy Transition'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support')),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Operations Manager'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Optimizing Infrastructure'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support')),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Energy Transition Director'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Energy Transition'),
   (SELECT id FROM gasunie.metro_lines WHERE name = 'Corporate Support'));

-- Insert Station Skills
INSERT INTO gasunie.station_skills (station_id, skill_id, importance_level)
VALUES
  -- Pipeline Engineer skills
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer'),
   (SELECT id FROM gasunie.skills WHERE name = 'Pipeline Engineering'),
   5),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer'),
   (SELECT id FROM gasunie.skills WHERE name = 'Safety Management'),
   4),
  
  -- Asset Manager skills
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager'),
   (SELECT id FROM gasunie.skills WHERE name = 'Pipeline Engineering'),
   3),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager'),
   (SELECT id FROM gasunie.skills WHERE name = 'Financial Analysis'),
   4),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager'),
   (SELECT id FROM gasunie.skills WHERE name = 'Leadership'),
   3),
  
  -- Hydrogen Specialist skills
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist'),
   (SELECT id FROM gasunie.skills WHERE name = 'Hydrogen Technology'),
   5),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist'),
   (SELECT id FROM gasunie.skills WHERE name = 'Regulatory Affairs'),
   3),
  
  -- Project Manager skills
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager'),
   (SELECT id FROM gasunie.skills WHERE name = 'Project Management'),
   5),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager'),
   (SELECT id FROM gasunie.skills WHERE name = 'Leadership'),
   4),
   
  ((SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager'),
   (SELECT id FROM gasunie.skills WHERE name = 'Pipeline Engineering'),
   3);


-- Insert Development Steps
INSERT INTO gasunie.development_steps (connection_id, name, description, step_type, duration_weeks)
VALUES
  -- Steps for Pipeline Engineer to Asset Manager
  ((SELECT id FROM gasunie.station_connections 
    WHERE from_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer')
    AND to_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager')),
   'Asset Management Certification', 
   'Obtain formal certification in infrastructure asset management', 
   'Certification', 16),
   
  ((SELECT id FROM gasunie.station_connections 
    WHERE from_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer')
    AND to_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager')),
   'Financial Planning Training', 
   'Complete training in budget management for infrastructure assets', 
   'Training', 8),
  
  -- Steps for Pipeline Engineer to Hydrogen Specialist
  ((SELECT id FROM gasunie.station_connections 
    WHERE from_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer')
    AND to_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist')),
   'Hydrogen Technology Fundamentals', 
   'Complete Energy Transition Academy module on hydrogen basics', 
   'Training', 12),
   
  ((SELECT id FROM gasunie.station_connections 
    WHERE from_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer')
    AND to_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist')),
   'Hydrogen Project Rotation', 
   'Participate in hydrogen pilot project implementation', 
   'Project Experience', 24),
   
  ((SELECT id FROM gasunie.station_connections 
    WHERE from_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer')
    AND to_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist')),
   'Regulatory Framework Study', 
   'Learn about hydrogen regulations and policy frameworks', 
   'Training', 6),
  
  -- Steps for Asset Manager to Project Manager
  ((SELECT id FROM gasunie.station_connections 
    WHERE from_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager')
    AND to_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager')),
   'Project Management Certification', 
   'Obtain PMP or equivalent project management certification', 
   'Certification', 16),
   
  ((SELECT id FROM gasunie.station_connections 
    WHERE from_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Asset Manager')
    AND to_station_id = (SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager')),
   'Leadership Skills Workshop', 
   'Complete TOP Class leadership development module', 
   'Training', 4);

-- Insert Demo User
INSERT INTO gasunie.demo_users (name, current_station_id, years_experience, profile_description, avatar_url)
VALUES
  ('Thomas Bakker', 
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer'), 
   5, 
   'Experienced pipeline engineer with interest in energy transition technologies', 
   'https://randomuser.me/api/portraits/men/42.jpg');

-- Insert User Skills
INSERT INTO gasunie.user_skills (user_id, skill_id, proficiency_level)
VALUES
  ((SELECT id FROM gasunie.demo_users WHERE name = 'Thomas Bakker'),
   (SELECT id FROM gasunie.skills WHERE name = 'Pipeline Engineering'),
   4),
   
  ((SELECT id FROM gasunie.demo_users WHERE name = 'Thomas Bakker'),
   (SELECT id FROM gasunie.skills WHERE name = 'Hydrogen Technology'),
   2),
   
  ((SELECT id FROM gasunie.demo_users WHERE name = 'Thomas Bakker'),
   (SELECT id FROM gasunie.skills WHERE name = 'Project Management'),
   3),
   
  ((SELECT id FROM gasunie.demo_users WHERE name = 'Thomas Bakker'),
   (SELECT id FROM gasunie.skills WHERE name = 'Safety Management'),
   4);

-- Insert Career Plan for demo user
INSERT INTO gasunie.career_plans (user_id, name, description, target_station_id, estimated_completion_date)
VALUES
  ((SELECT id FROM gasunie.demo_users WHERE name = 'Thomas Bakker'),
   'Energy Transition Career Path',
   'Moving from traditional gas infrastructure to hydrogen technologies',
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist'),
   '2025-06-30');

-- Insert Career Plan Steps
INSERT INTO gasunie.career_plan_steps (career_plan_id, station_id, step_order, estimated_start_date, estimated_end_date)
VALUES
  ((SELECT id FROM gasunie.career_plans WHERE name = 'Energy Transition Career Path'),
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Pipeline Engineer'),
   1,
   '2023-01-01',
   '2023-12-31'),
   
  ((SELECT id FROM gasunie.career_plans WHERE name = 'Energy Transition Career Path'),
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Project Manager'),
   2,
   '2024-01-01',
   '2024-12-31'),
   
  ((SELECT id FROM gasunie.career_plans WHERE name = 'Energy Transition Career Path'),
   (SELECT id FROM gasunie.metro_stations WHERE name = 'Hydrogen Specialist'),
   3,
   '2025-01-01',
   '2025-06-30');

