-- First ensure the organization exists
-- INSERT INTO public.organizations (id, name, description, primary_color) VALUES
('1729324b-672e-418d-86d1-c87fe1c38ceb', 'Bol.com Example Org', 'Leading e-commerce platform in the Netherlands', '#4299E1')
-- ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, primary_color = EXCLUDED.primary_color;

--bol
'1729324b-672e-418d-86d1-c87fe1c38ceb' 
--lehman
'9e40b94e-dd8d-4679-98b9-0716cff26810'

-- Ensure Career Path exists
INSERT INTO public.career_paths (id, organization_id, name, description, color) VALUES
('6f47481d-80c7-408f-9db4-e331487336d8', '1729324b-672e-418d-86d1-c87fe1c38ceb', 'Business Analysis', 'Analyzing business needs and recommending solutions.', '#48BB78')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, color = EXCLUDED.color;

-- Ensure Positions exist with actual UUIDs from Gemini
INSERT INTO public.positions (organization_id, name, base_description) VALUES
('1729324b-672e-418d-86d1-c87fe1c38ceb', 'Data Analyst', 'Responsible for collecting, processing, and performing statistical analyses of data.'),
('1729324b-672e-418d-86d1-c87fe1c38ceb', 'Product Analyst', 'Analyzes product data to understand user behavior, identify opportunities, and measure feature success.')
-- To make this idempotent based on a natural key (e.g., name + organization_id):
-- ON CONFLICT (organization_id, name) DO NOTHING;
-- Or if you want to update if it exists:
-- ON CONFLICT (organization_id, name) DO UPDATE SET base_description = EXCLUDED.base_description;

-- Insert competences with Gemini's UUIDs
-- First, add a unique constraint to the name column
ALTER TABLE public.competences ADD CONSTRAINT competences_name_key UNIQUE (name);

-- Then run your insert
INSERT INTO public.competences (name, description, category, organization_id)
VALUES
  ('Data Analysis', 'Analyzing data to identify trends and insights.', 'Technical', NULL),
  ('SQL Proficiency', 'Writing and optimizing SQL queries.', 'Technical', NULL),
  ('Visualization', 'Creating charts and dashboards to communicate data.', 'Technical', NULL),
  ('Product Thinking', 'Understanding product goals and user needs to guide analysis.', 'Product', NULL),
  ('A/B Testing', 'Designing and analyzing A/B tests for product features.', 'Technical', NULL),
  ('User Behavior Analysis', 'Analyzing how users interact with a product.', 'Analytical', NULL),
  ('Agile Methodologies', 'Working within Agile/Scrum frameworks.', 'Process', NULL),
  ('Stakeholder Management', 'Communicating and collaborating effectively with stakeholders.', 'Soft Skills', NULL),
  ('Python/R Proficiency', 'Using Python or R for data analysis and modeling.', 'Technical', NULL),
  ('Machine Learning Basics', 'Understanding and applying basic ML algorithms.', 'Technical', NULL),
  ('Statistical Modeling', 'Building and interpreting statistical models.', 'Technical', NULL),
  ('E-commerce Domain Expertise', 'Deep knowledge of e-commerce business.', 'Domain', '1729324b-672e-418d-86d1-c87fe1c38ceb'),
  ('Business Strategy Acumen', 'Understanding and contributing to business strategy.', 'Business', NULL),
  ('Executive Communication', 'Presenting findings clearly to leadership.', 'Soft Skills', NULL)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  organization_id = EXCLUDED.organization_id
RETURNING id, name;


-- Insert position details with rich descriptions
INSERT INTO public.position_details (id, organization_id, position_id, career_path_id, level, path_specific_description, sequence_in_path, work_focus, team_interaction, work_style) VALUES
('pd-uuid-jda', '1729324b-672e-418d-86d1-c87fe1c38ceb', 'c1a5b760-1f79-4a3e-8b5c-01df7a9b0cd1', '6f47481d-80c7-408f-9db4-e331487336d8', 1, 'Entry-level data analysis tasks, report generation, and supporting senior analysts.', 1, 'Focused on reporting and regular data updates', 'Work primarily with data team and requesters', 'Project-based work with defined deliverables'),
('pd-uuid-pa', '1729324b-672e-418d-86d1-c87fe1c38ceb', 'd2b6c871-2g80-4b4f-9c6d-12ef8b0c1de2', '6f47481d-80c7-408f-9db4-e331487336d8', 3, 'Drives product decisions through data, analyzes user behavior, and collaborates with product teams.', 3, 'Focused on user journeys and feature metrics', 'Work embedded within product teams (PM, designers, devs)', 'Agile sprints with evolving priorities')
ON CONFLICT (id) DO UPDATE SET 
  level = EXCLUDED.level, 
  path_specific_description = EXCLUDED.path_specific_description, 
  sequence_in_path = EXCLUDED.sequence_in_path,
  work_focus = EXCLUDED.work_focus,
  team_interaction = EXCLUDED.team_interaction,
  work_style = EXCLUDED.work_style;

-- Insert position detail competences - the required competences for each position
-- For Junior Data Analyst
INSERT INTO public.position_detail_competences (position_details_id, competence_id, required_level, importance_level, organization_id) VALUES
('pd-uuid-jda', 'comp-uuid-data-analysis', 2, 5, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-jda', 'comp-uuid-sql', 2, 5, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-jda', 'comp-uuid-viz', 1, 4, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-jda', 'comp-uuid-stakeholder', 1, 3, '1729324b-672e-418d-86d1-c87fe1c38ceb')
ON CONFLICT (position_details_id, competence_id) DO UPDATE SET 
  required_level = EXCLUDED.required_level, 
  importance_level = EXCLUDED.importance_level;

-- For Product Analyst - more advanced competences required
INSERT INTO public.position_detail_competences (position_details_id, competence_id, required_level, importance_level, organization_id) VALUES
('pd-uuid-pa', 'comp-uuid-data-analysis', 4, 5, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-sql', 3, 4, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-viz', 3, 4, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-prod-think', 4, 5, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-abtest', 3, 5, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-user-behav', 3, 5, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-agile', 2, 4, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-stakeholder', 3, 4, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-python-r', 2, 3, '1729324b-672e-418d-86d1-c87fe1c38ceb'),
('pd-uuid-pa', 'comp-uuid-exec-comm', 2, 3, '1729324b-672e-418d-86d1-c87fe1c38ceb')
ON CONFLICT (position_details_id, competence_id) DO UPDATE SET 
  required_level = EXCLUDED.required_level, 
  importance_level = EXCLUDED.importance_level;

-- Update Sam Taylor's current position
UPDATE public.users
SET current_position_details_id = 'pd-uuid-jda'
WHERE id = 'e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2'; -- Sam Taylor's ID

-- Insert Sam's competence levels
INSERT INTO public.user_competences (user_id, competence_id, current_level, target_level, last_assessed_at) VALUES
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-data-analysis', 3, 4, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-sql', 3, 4, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-viz', 3, 4, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-prod-think', 1, 3, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-abtest', 1, 3, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-user-behav', 1, 3, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-agile', 0, 2, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-stakeholder', 1, 3, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-python-r', 0, 2, NOW()),
('e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', 'comp-uuid-exec-comm', 0, 2, NOW())
ON CONFLICT (user_id, competence_id) DO UPDATE SET 
  current_level = EXCLUDED.current_level,
  target_level = EXCLUDED.target_level,
  last_assessed_at = EXCLUDED.last_assessed_at;

-- Create a career plan for Sam targeting Product Analyst
INSERT INTO public.user_career_plans (id, user_id, organization_id, target_position_details_id, status, estimated_total_duration, notes, created_at, updated_at) VALUES
('plan-uuid-sam-pa', 'e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2', '1729324b-672e-418d-86d1-c87fe1c38ceb', 'pd-uuid-pa', 'active', '12-18 months', 'My plan to become a Product Analyst.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  estimated_total_duration = EXCLUDED.estimated_total_duration,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Create structured phases for Sam's career plan
INSERT INTO public.plan_phases (id, plan_id, title, description, sequence, duration) VALUES
('phase-uuid-1', 'plan-uuid-sam-pa', 'Cross-team Collaboration', 'Start collaborating with product teams to understand their workflows and data needs', 1, '3 months'),
('phase-uuid-2', 'plan-uuid-sam-pa', 'Product Metrics & Roadmap', 'Learn to define, track, and analyze key product metrics. Contribute to roadmap planning.', 2, '4 months'),
('phase-uuid-3', 'plan-uuid-sam-pa', 'Product Tools & Agile', 'Gain proficiency in common product management tools and agile methodologies.', 3, '2 months'),
('phase-uuid-4', 'plan-uuid-sam-pa', 'Feature Ownership', 'Take ownership of a small feature from ideation to launch and iteration.', 4, '3 months')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  sequence = EXCLUDED.sequence,
  duration = EXCLUDED.duration;

-- Add specific actions for each phase
-- Actions for Phase 1
INSERT INTO public.plan_actions (id, phase_id, title, description, category, status, due_date, created_at, updated_at) VALUES
('action-uuid-1-1', 'phase-uuid-1', 'Shadow a product manager for 2 weeks', 'Follow a senior PM to learn their workflow and decision-making process', 'Mentoring', 'todo', NOW() + INTERVAL '30 days', NOW(), NOW()),
('action-uuid-1-2', 'phase-uuid-1', 'Attend product team stand-ups', 'Participate in daily stand-ups with a product team to understand their rhythm', 'Task', 'todo', NOW() + INTERVAL '14 days', NOW(), NOW());

-- Actions for Phase 2
INSERT INTO public.plan_actions (id, phase_id, title, description, category, status, due_date, created_at, updated_at) VALUES
('action-uuid-2-1', 'phase-uuid-2', 'Complete "Data-Driven Product Management" course', 'Take online course to learn about product metrics and KPIs', 'Training', 'todo', NOW() + INTERVAL '90 days', NOW(), NOW()),
('action-uuid-2-2', 'phase-uuid-2', 'Analyze metrics for an existing feature', 'Perform in-depth analysis of a feature and present findings to product team', 'Project', 'todo', NOW() + INTERVAL '120 days', NOW(), NOW());

-- Actions for Phase 3
INSERT INTO public.plan_actions (id, phase_id, title, description, category, status, due_date, created_at, updated_at) VALUES
('action-uuid-3-1', 'phase-uuid-3', 'Complete Agile certification', 'Get certified in Agile methodologies', 'Training', 'todo', NOW() + INTERVAL '180 days', NOW(), NOW()),
('action-uuid-3-2', 'phase-uuid-3', 'Learn product management tools', 'Become proficient with Jira, Amplitude, and other product tools', 'Task', 'todo', NOW() + INTERVAL '210 days', NOW(), NOW());

-- Actions for Phase 4
INSERT INTO public.plan_actions (id, phase_id, title, description, category, status, due_date, created_at, updated_at) VALUES
('action-uuid-4-1', 'phase-uuid-4', 'Lead feature design workshop', 'Facilitate a design session for a new feature', 'Project', 'todo', NOW() + INTERVAL '270 days', NOW(), NOW()),
('action-uuid-4-2', 'phase-uuid-4', 'Own feature launch and metrics tracking', 'Take ownership of launching a feature and tracking its performance', 'Project', 'todo', NOW() + INTERVAL '300 days', NOW(), NOW());

-- Add learning resources
INSERT INTO public.learning_resources (id, organization_id, title, description, url, type, source, estimated_duration, created_at) VALUES
('resource-uuid-1', NULL, 'Product Analytics Fundamentals', 'Comprehensive course covering the basics of product analytics', 'https://www.coursera.org/example-pa-course', 'Course', 'Coursera', '4 weeks', NOW()),
('resource-uuid-2', '1729324b-672e-418d-86d1-c87fe1c38ceb', 'Introduction to A/B Testing', 'Internal workshop on A/B testing methodologies', NULL, 'Workshop', 'Internal', '2 hours', NOW()),
('resource-uuid-3', NULL, 'Agile for Analysts', 'Course covering Agile principles for data professionals', 'https://www.udemy.com/example-agile-course', 'Course', 'Udemy', '6 hours', NOW()),
('resource-uuid-4', NULL, 'SQL Masterclass', 'Advanced SQL techniques for analytics', 'https://www.datacamp.com/courses/sql-masterclass', 'Course', 'DataCamp', '8 hours', NOW()),
('resource-uuid-5', '1729324b-672e-418d-86d1-c87fe1c38ceb', 'E-commerce Analytics Playbook', 'Internal guide to e-commerce metrics and analysis techniques', NULL, 'Guide', 'Internal', '3 hours', NOW())
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  url = EXCLUDED.url,
  type = EXCLUDED.type,
  source = EXCLUDED.source,
  estimated_duration = EXCLUDED.estimated_duration;

-- Add some development activities for competences
INSERT INTO public.development_activities (id, competence_id, activity_type, description) VALUES
('dev-act-uuid-1', 'comp-uuid-data-analysis', 'job', 'Analyze weekly sales data and present findings to the team'),
('dev-act-uuid-2', 'comp-uuid-data-analysis', 'formal', 'Complete an online course in statistical analysis techniques'),
('dev-act-uuid-3', 'comp-uuid-sql', 'job', 'Optimize complex SQL queries to improve performance'),
('dev-act-uuid-4', 'comp-uuid-viz', 'formal', 'Create a dashboard showing key business metrics'),
('dev-act-uuid-5', 'comp-uuid-prod-think', 'social', 'Participate in product brainstorming sessions'),
('dev-act-uuid-6', 'comp-uuid-abtest', 'job', 'Design and analyze an A/B test for a product feature'),
('dev-act-uuid-7', 'comp-uuid-user-behav', 'job', 'Perform user journey analysis across the website'),
('dev-act-uuid-8', 'comp-uuid-agile', 'formal', 'Complete Agile certification training'),
('dev-act-uuid-9', 'comp-uuid-stakeholder', 'social', 'Present findings to cross-functional teams'),
('dev-act-uuid-10', 'comp-uuid-python-r', 'job', 'Build a data pipeline using Python for a real business problem')
ON CONFLICT (id) DO UPDATE SET 
  competence_id = EXCLUDED.competence_id,
  activity_type = EXCLUDED.activity_type,
  description = EXCLUDED.description;