-- Insert Career Paths
INSERT INTO careers.career_paths (name, description, color) VALUES
  ('Data Analysis', 'Career path focused on deriving insights from data', '#4361EE'),
  ('Product Management', 'Strategic product development and management path', '#3A0CA3'),
  ('Software Engineering', 'Technical software development career track', '#F72585'),
  ('Design', 'User experience and interface design path', '#4CC9F0');

-- Retrieve the inserted career path IDs
DO $$
DECLARE
  data_analysis_id UUID;
  product_management_id UUID;
  software_engineering_id UUID;
  design_id UUID;
BEGIN
  SELECT id INTO data_analysis_id FROM careers.career_paths WHERE name = 'Data Analysis' LIMIT 1;
  SELECT id INTO product_management_id FROM careers.career_paths WHERE name = 'Product Management' LIMIT 1;
  SELECT id INTO software_engineering_id FROM careers.career_paths WHERE name = 'Software Engineering' LIMIT 1;
  SELECT id INTO design_id FROM careers.career_paths WHERE name = 'Design' LIMIT 1;

  -- Insert Skills
  INSERT INTO careers.skills (name, description, category) VALUES
    -- Technical Skills
    ('SQL', 'Database query language for accessing and manipulating data', 'technical'),
    ('Data Analysis', 'Ability to analyze and interpret data sets to extract insights', 'technical'),
    ('Python', 'Programming language for data science and general use', 'technical'),
    ('JavaScript', 'Programming language for web development', 'technical'),
    ('Data Visualization', 'Creating visual representations of data', 'technical'),
    ('A/B Testing', 'Statistical hypothesis testing for comparison', 'technical'),
    ('UI/UX Design', 'User interface and experience design principles', 'technical'),
    ('Product Requirements', 'Documenting and prioritizing product features', 'technical'),
    
    -- Soft Skills
    ('Communication', 'Effectively conveying information to others', 'soft'),
    ('Presentation', 'Delivering information to audiences clearly and engagingly', 'soft'),
    ('Stakeholder Management', 'Building and maintaining relationships with stakeholders', 'soft'),
    ('Collaboration', 'Working effectively with others toward common goals', 'soft'),
    
    -- Domain Skills
    ('Product Thinking', 'Understanding how to build products that solve user problems', 'domain'),
    ('Business Strategy', 'Planning and decision-making to achieve organizational goals', 'domain'),
    ('Market Analysis', 'Examining market trends, competitors, and opportunities', 'domain'),
    
    -- Leadership Skills
    ('Team Leadership', 'Guiding and motivating team members', 'leadership'),
    ('Strategic Planning', 'Setting goals and determining actions to achieve them', 'leadership'),
    ('Performance Management', 'Managing and evaluating employee performance', 'leadership');

  -- Insert Roles for Data Analysis Path
  INSERT INTO careers.roles (name, description, level, career_path_id) VALUES
    ('Junior Data Analyst', 'Entry-level role focusing on basic data analysis and reporting', 1, data_analysis_id),
    ('Data Analyst', 'Mid-level role performing complex analyses and creating dashboards', 2, data_analysis_id),
    ('Senior Data Analyst', 'Experienced analyst leading projects and mentoring junior team members', 3, data_analysis_id),
    ('Data Science Manager', 'Oversees a team of analysts and data scientists', 4, data_analysis_id),
    ('Head of Data', 'Strategic leadership role for all data functions', 5, data_analysis_id);

  -- Insert Roles for Product Management Path
  INSERT INTO careers.roles (name, description, level, career_path_id) VALUES
    ('Associate Product Manager', 'Entry-level product role supporting feature development', 1, product_management_id),
    ('Product Manager', 'Manages product features and coordinates with engineering teams', 2, product_management_id),
    ('Senior Product Manager', 'Leads significant product initiatives with business impact', 3, product_management_id),
    ('Product Director', 'Oversees entire product lines and their strategies', 4, product_management_id),
    ('VP of Product', 'Executive-level product strategy and leadership', 5, product_management_id);

  -- Insert Roles for Software Engineering Path
  INSERT INTO careers.roles (name, description, level, career_path_id) VALUES
    ('Junior Software Engineer', 'Entry-level developer working on feature implementation', 1, software_engineering_id),
    ('Software Engineer', 'Mid-level developer building features and fixing bugs', 2, software_engineering_id),
    ('Senior Software Engineer', 'Experienced developer leading technical projects', 3, software_engineering_id),
    ('Engineering Manager', 'Leads and mentors a team of engineers', 4, software_engineering_id),
    ('CTO', 'Executive leadership for technology organization', 5, software_engineering_id);
END $$;

-- Add role skills and transitions after roles are created
DO $$
DECLARE
  -- Skill IDs
  sql_id UUID;
  data_analysis_skill_id UUID;
  python_id UUID;
  data_viz_id UUID;
  ab_testing_id UUID;
  communication_id UUID;
  presentation_id UUID;
  stakeholder_mgmt_id UUID;
  product_thinking_id UUID;
  collaboration_id UUID;
  product_req_id UUID;
  
  -- Role IDs - Data Analysis
  jr_analyst_id UUID;
  analyst_id UUID;
  sr_analyst_id UUID;
  
  -- Role IDs - Product Management
  assoc_pm_id UUID;
  pm_id UUID;
  
  -- Transition IDs
  jr_to_analyst_id UUID;
  analyst_to_sr_id UUID;
  analyst_to_pm_id UUID;
BEGIN
  -- Get skill IDs
  SELECT id INTO sql_id FROM careers.skills WHERE name = 'SQL' LIMIT 1;
  SELECT id INTO data_analysis_skill_id FROM careers.skills WHERE name = 'Data Analysis' LIMIT 1;
  SELECT id INTO python_id FROM careers.skills WHERE name = 'Python' LIMIT 1;
  SELECT id INTO data_viz_id FROM careers.skills WHERE name = 'Data Visualization' LIMIT 1;
  SELECT id INTO ab_testing_id FROM careers.skills WHERE name = 'A/B Testing' LIMIT 1;
  SELECT id INTO communication_id FROM careers.skills WHERE name = 'Communication' LIMIT 1;
  SELECT id INTO presentation_id FROM careers.skills WHERE name = 'Presentation' LIMIT 1;
  SELECT id INTO stakeholder_mgmt_id FROM careers.skills WHERE name = 'Stakeholder Management' LIMIT 1;
  SELECT id INTO product_thinking_id FROM careers.skills WHERE name = 'Product Thinking' LIMIT 1;
  SELECT id INTO collaboration_id FROM careers.skills WHERE name = 'Collaboration' LIMIT 1;
  SELECT id INTO product_req_id FROM careers.skills WHERE name = 'Product Requirements' LIMIT 1;
  
  -- Get role IDs
  SELECT id INTO jr_analyst_id FROM careers.roles WHERE name = 'Junior Data Analyst' LIMIT 1;
  SELECT id INTO analyst_id FROM careers.roles WHERE name = 'Data Analyst' LIMIT 1;
  SELECT id INTO sr_analyst_id FROM careers.roles WHERE name = 'Senior Data Analyst' LIMIT 1;
  SELECT id INTO assoc_pm_id FROM careers.roles WHERE name = 'Associate Product Manager' LIMIT 1;
  SELECT id INTO pm_id FROM careers.roles WHERE name = 'Product Manager' LIMIT 1;
  
  -- Insert Role Skills for Data Analysis Path
  -- Junior Data Analyst
  INSERT INTO careers.role_skills (role_id, skill_id, required_level) VALUES
    (jr_analyst_id, sql_id, 2),
    (jr_analyst_id, data_analysis_skill_id, 2),
    (jr_analyst_id, data_viz_id, 1),
    (jr_analyst_id, communication_id, 2);

  -- Data Analyst
  INSERT INTO careers.role_skills (role_id, skill_id, required_level) VALUES
    (analyst_id, sql_id, 3),
    (analyst_id, data_analysis_skill_id, 3),
    (analyst_id, python_id, 2),
    (analyst_id, data_viz_id, 3),
    (analyst_id, ab_testing_id, 2),
    (analyst_id, communication_id, 3),
    (analyst_id, presentation_id, 2);

  -- Senior Data Analyst
  INSERT INTO careers.role_skills (role_id, skill_id, required_level) VALUES
    (sr_analyst_id, sql_id, 4),
    (sr_analyst_id, data_analysis_skill_id, 4),
    (sr_analyst_id, python_id, 3),
    (sr_analyst_id, data_viz_id, 4),
    (sr_analyst_id, ab_testing_id, 3),
    (sr_analyst_id, communication_id, 4),
    (sr_analyst_id, presentation_id, 3),
    (sr_analyst_id, stakeholder_mgmt_id, 3),
    (sr_analyst_id, product_thinking_id, 2);

  -- Insert Role Skills for Product Management Path
  -- Associate Product Manager
  INSERT INTO careers.role_skills (role_id, skill_id, required_level) VALUES
    (assoc_pm_id, product_req_id, 2),
    (assoc_pm_id, communication_id, 3),
    (assoc_pm_id, collaboration_id, 3),
    (assoc_pm_id, product_thinking_id, 2);

  -- Product Manager
  INSERT INTO careers.role_skills (role_id, skill_id, required_level) VALUES
    (pm_id, ab_testing_id, 2),
    (pm_id, product_req_id, 4),
    (pm_id, communication_id, 4),
    (pm_id, presentation_id, 3),
    (pm_id, stakeholder_mgmt_id, 3),
    (pm_id, collaboration_id, 4),
    (pm_id, product_thinking_id, 4);

  -- Insert Role Transitions
  -- Data Analysis path progression
  INSERT INTO careers.role_transitions (from_role_id, to_role_id, estimated_months, is_recommended) VALUES
    (jr_analyst_id, analyst_id, 18, true)
  RETURNING id INTO jr_to_analyst_id;
  
  INSERT INTO careers.role_transitions (from_role_id, to_role_id, estimated_months, is_recommended) VALUES
    (analyst_id, sr_analyst_id, 24, true)
  RETURNING id INTO analyst_to_sr_id;

  -- Cross-functional transitions
  INSERT INTO careers.role_transitions (from_role_id, to_role_id, estimated_months, is_recommended) VALUES
    (analyst_id, pm_id, 12, true)
  RETURNING id INTO analyst_to_pm_id;

  -- Insert Development Steps
  -- Junior to Data Analyst
  INSERT INTO careers.development_steps (transition_id, name, description, step_type, duration_weeks, order_index) VALUES
    (jr_to_analyst_id, 'Advanced SQL Training', 'Complete advanced SQL course covering complex joins, window functions, and query optimization', 'training', 6, 1),
    (jr_to_analyst_id, 'Python Fundamentals', 'Learn Python basics for data analysis including pandas and numpy libraries', 'training', 8, 2),
    (jr_to_analyst_id, 'Dashboard Project', 'Build a comprehensive analytics dashboard for a business unit', 'experience', 12, 3);

  -- Data Analyst to Senior Data Analyst
  INSERT INTO careers.development_steps (transition_id, name, description, step_type, duration_weeks, order_index) VALUES
    (analyst_to_sr_id, 'Statistical Analysis Workshop', 'Advanced statistical methods and experimental design', 'training', 4, 1),
    (analyst_to_sr_id, 'Lead A/B Test Project', 'Design and analyze a significant A/B test for key business metrics', 'experience', 8, 2),
    (analyst_to_sr_id, 'Analytics Mentoring', 'Mentor junior analysts on at least two projects', 'experience', 16, 3),
    (analyst_to_sr_id, 'Cross-functional Project', 'Work with product team on data-driven feature development', 'experience', 12, 4);

  -- Data Analyst to Product Manager
  INSERT INTO careers.development_steps (transition_id, name, description, step_type, duration_weeks, order_index) VALUES
    (analyst_to_pm_id, 'Product Management Fundamentals', 'Learn core product management frameworks and methodologies', 'training', 6, 1),
    (analyst_to_pm_id, 'Product Requirements Workshop', 'Practice writing PRDs and user stories', 'training', 2, 2),
    (analyst_to_pm_id, 'Product Shadow Experience', 'Shadow a product manager for feature development cycle', 'experience', 8, 3),
    (analyst_to_pm_id, 'Feature Ownership', 'Take ownership of a small product feature from concept to launch', 'experience', 12, 4);

  -- Insert Users
  INSERT INTO careers.users (name, email, current_role_id, target_role_id) VALUES
    ('Thierry Duffries', 'thierry@example.com', jr_analyst_id, pm_id);
END $$;

-- Add user skills after user is created
DO $$
DECLARE
  user_id UUID;
  sql_id UUID;
  data_analysis_skill_id UUID;
  python_id UUID;
  data_viz_id UUID;
  ab_testing_id UUID;
  communication_id UUID;
  collaboration_id UUID;
  product_thinking_id UUID;
  product_req_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO user_id FROM careers.users WHERE name = 'Thierry Duffries' LIMIT 1;
  
  -- Get skill IDs
  SELECT id INTO sql_id FROM careers.skills WHERE name = 'SQL' LIMIT 1;
  SELECT id INTO data_analysis_skill_id FROM careers.skills WHERE name = 'Data Analysis' LIMIT 1;
  SELECT id INTO python_id FROM careers.skills WHERE name = 'Python' LIMIT 1;
  SELECT id INTO data_viz_id FROM careers.skills WHERE name = 'Data Visualization' LIMIT 1;
  SELECT id INTO ab_testing_id FROM careers.skills WHERE name = 'A/B Testing' LIMIT 1;
  SELECT id INTO communication_id FROM careers.skills WHERE name = 'Communication' LIMIT 1;
  SELECT id INTO collaboration_id FROM careers.skills WHERE name = 'Collaboration' LIMIT 1;
  SELECT id INTO product_thinking_id FROM careers.skills WHERE name = 'Product Thinking' LIMIT 1;
  SELECT id INTO product_req_id FROM careers.skills WHERE name = 'Product Requirements' LIMIT 1;
  
  -- Insert User Skills
  INSERT INTO careers.user_skills (user_id, skill_id, current_level) VALUES
    -- Thierry's skills
    (user_id, sql_id, 2),
    (user_id, data_analysis_skill_id, 2),
    (user_id, python_id, 1),
    (user_id, data_viz_id, 2),
    (user_id, ab_testing_id, 1),
    (user_id, product_req_id, 1),
    (user_id, communication_id, 3),
    (user_id, collaboration_id, 2),
    (user_id, product_thinking_id, 1);

  -- Create Development Plan
  INSERT INTO careers.development_plans (user_id, target_role_id) 
  VALUES (user_id, (SELECT id FROM careers.roles WHERE name = 'Product Manager' LIMIT 1));
END $$;