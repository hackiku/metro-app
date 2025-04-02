--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: career_path_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.career_path_stations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    career_path_id uuid,
    job_family_id uuid,
    level text NOT NULL,
    position_order integer NOT NULL,
    CONSTRAINT career_path_stations_level_check CHECK ((level = ANY (ARRAY['Junior'::text, 'Medior'::text, 'Senior'::text, 'Lead'::text])))
);


--
-- Name: career_paths; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.career_paths (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    from_job_family_id uuid,
    to_job_family_id uuid
);


--
-- Name: competences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competences (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text
);


--
-- Name: development_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.development_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    competence_id uuid,
    activity_type text NOT NULL,
    description text NOT NULL,
    CONSTRAINT development_activities_activity_type_check CHECK ((activity_type = ANY (ARRAY['job'::text, 'social'::text, 'formal'::text])))
);


--
-- Name: job_families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_families (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    department text
);


--
-- Name: job_family_competences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_family_competences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_family_id uuid,
    competence_id uuid,
    importance_level integer NOT NULL
);


--
-- Name: skill_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_lines (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    category text NOT NULL,
    line_id text NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: skill_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skill_stations (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    line_id uuid,
    station_id text NOT NULL,
    name text NOT NULL,
    level integer NOT NULL,
    x_position integer NOT NULL,
    y_position integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_competences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_competences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    competence_id uuid,
    current_level integer NOT NULL,
    target_level integer,
    last_assessed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_competences_current_level_check CHECK (((current_level >= 1) AND (current_level <= 100))),
    CONSTRAINT user_competences_target_level_check CHECK (((target_level >= 1) AND (target_level <= 100)))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    current_job_family_id uuid,
    level text NOT NULL,
    years_in_role numeric(3,1) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT users_level_check CHECK ((level = ANY (ARRAY['Junior'::text, 'Medior'::text, 'Senior'::text, 'Lead'::text])))
);


--
-- Data for Name: career_path_stations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.career_path_stations (id, career_path_id, job_family_id, level, position_order) FROM stdin;
\.


--
-- Data for Name: career_paths; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.career_paths (id, from_job_family_id, to_job_family_id) FROM stdin;
\.


--
-- Data for Name: competences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.competences (id, name, description) FROM stdin;
17411cab-b076-43b3-af3e-65db8468c041	Problem Analysis	The ability to detect problems, recognize important information, and link various data; to trace potential causes and look for relevant details.
07a79c4d-61bf-4991-a4fb-641d2bd3f8cb	Forming Judgment	The ability to balance facts and potential approaches taking the appropriate criteria into account.
c649801e-6010-4810-a0e7-cc5be31a8e5a	Planning & Organising	The ability to determine goals and priorities and to assess the actions, time and resources needed to achieve those goals.
1adad5e3-5488-4831-9bbb-0a477c331ed9	Result-Orientedness	The ability to take direct action in order to attain or exceed objectives.
a3d1e957-0028-46db-b765-de196ea6d0ed	Persuasiveness	The ambition to win over other people for one's views and ideas and to generate support.
3ca4daf5-1b80-4c9e-b29a-47dc1ab206a6	Cooperation	The ability to work effectively with others in order to achieve a shared goal - even when the object at stake is of no direct personal interest.
d2071e73-bb5f-4dcd-86c2-a413ba5ad406	Organisation Sensitivity	Showing awareness of the consequences of one's choices, decisions and actions for parts of or the entire organisation.
e455a99e-0499-4d68-8d73-b18384b11de0	Vision	The ability to step back from one's daily routine, explore ideas for the future, regard the facts from a distance and see them in a broader context or in the longer term.
d38055ac-34b7-43aa-bb10-91b86e722572	Independence	The ability to perform actions and make statements that reflect an opinion or view of one's own; not to fawn.
f4c987ae-cca8-41f5-a34f-4809a529dc03	Innovative Power	The ability to direct one's inquisitive mind toward initiating new strategies, products, services, and markets.
12af5a3e-ddce-480c-8f1b-11fcaef3151a	Adaptability	The ability to remain fully functional by adapting to changing circumstances (environment, procedures, people).
ee9c686c-7c2c-4975-b643-f8894cbf0b23	Coaching	Encouraging and guiding employees in order to make their performance more effective and to enhance their self-perception and problem solving skills.
7aa71d5e-a266-4f7c-86a8-887168c8e703	Decisiveness	The ability to make active decisions or to commit oneself by speaking one's mind and taking position.
6f6b5a23-c962-489f-a384-d33033e0d732	Negotiating	The ability to obtain maximum results from meetings in which interests conflict both in terms of content and maintaining good relations.
0d3360fd-2ee1-4668-bb85-227fc20e2910	Commercial Power	Acting from opportunities in the market; acting with customer-focus and affiliating with appropriate contacts.
22e2b48c-8686-4e8e-af63-a84afdbe8088	Business Orientation	The ability to recognize opportunities for new services and products and to act accordingly, taking measured risks into account.
eda91190-2699-4339-a510-5d5b76fe85c9	Insight	The ability to understand situations, problems and processes. Deconstructing problems and systematically investigating the various components.
f8cc3143-c278-47f3-a0e9-2de3c05cdcb0	Focus on Quality	Maintaining high quality standards and striving for continuous improvement and quality assurance.
d6351bb6-23f2-4a06-97c7-c6db098cd8ed	Customer Orientation	The ability and willingness to find out what the customer and/or partner wants and needs and to act accordingly, taking the organisation's costs and benefits into account.
dc401571-1699-4641-8830-fc4dd8a8f0b1	Learning Ability	The ability to absorb and apply new information, concepts, and skills effectively.
ed3705c6-a873-4a02-b153-c7cf2dd69748	Delegating	The ability to assign responsibilities and authority to the right employees, taking their interests, ambitions, development and competence into account. Following up on delegated tasks.
\.


--
-- Data for Name: development_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.development_activities (id, competence_id, activity_type, description) FROM stdin;
36c00b5a-3393-467e-adb1-8c9f38e13ff2	17411cab-b076-43b3-af3e-65db8468c041	formal	Read "The Art of Thinking Clearly" and apply the concepts
4d32223a-2db7-47df-9776-1c52e45618ed	17411cab-b076-43b3-af3e-65db8468c041	formal	Complete a course on data analysis or structured problem-solving techniques
562b90ea-ac0b-4b73-986c-c2b7a60d4263	17411cab-b076-43b3-af3e-65db8468c041	social	Facilitate a problem-solving workshop for your team
658650fa-407b-43a0-ae84-b3dbac77f952	17411cab-b076-43b3-af3e-65db8468c041	social	Shadow a senior analyst and observe their approach to complex problems
7e87eb75-332b-4cbd-a002-0eda27172e95	17411cab-b076-43b3-af3e-65db8468c041	job	Volunteer to analyze recurring issues in your team and propose solutions
705426a4-43b9-4c16-86b4-f9df3a0c0ba2	17411cab-b076-43b3-af3e-65db8468c041	job	Lead a complex analysis project and present findings to stakeholders
9fc65f0d-62d4-4cea-b00a-21bb27793e0a	c649801e-6010-4810-a0e7-cc5be31a8e5a	formal	Read "Getting Things Done" and implement the methodology
21075493-0a40-4ec3-9799-808afaa19e8c	c649801e-6010-4810-a0e7-cc5be31a8e5a	formal	Take a course on project management methodologies
5b414fc8-6eda-42af-b13e-6389bb0a9068	c649801e-6010-4810-a0e7-cc5be31a8e5a	social	Seek feedback from colleagues on your planning approach
86a3387d-b97c-444d-b752-fe761ecf87b1	c649801e-6010-4810-a0e7-cc5be31a8e5a	social	Participate in sprint planning sessions to learn from others
71d5f1c7-bdf9-4ac5-9b29-3229d104a773	c649801e-6010-4810-a0e7-cc5be31a8e5a	job	Create and implement a more efficient work process for your team
64ac88d2-99ee-443c-bbbe-915c52c37378	c649801e-6010-4810-a0e7-cc5be31a8e5a	job	Take responsibility for planning a small project from start to finish
4ec8ddaf-5516-4262-b5b0-c9c672d36eaa	1adad5e3-5488-4831-9bbb-0a477c331ed9	formal	Study performance improvement techniques
6bc6278c-db8c-4454-a71a-44811fb1be21	1adad5e3-5488-4831-9bbb-0a477c331ed9	formal	Take a course on OKR methodology
5916d1c8-c2f0-4107-8240-3542729e92a6	1adad5e3-5488-4831-9bbb-0a477c331ed9	social	Seek mentoring from colleagues known for delivering results
6fcab679-1ed0-4208-9ac4-71b41fabb942	1adad5e3-5488-4831-9bbb-0a477c331ed9	social	Join a high-performing team and observe their working methods
b21c41b9-bae5-43a0-9a90-891bac68cba5	1adad5e3-5488-4831-9bbb-0a477c331ed9	job	Take on a challenging project with measurable outcomes
d35100c7-5fb3-4f5f-8bb9-6dbce8238d73	1adad5e3-5488-4831-9bbb-0a477c331ed9	job	Set SMART goals for yourself and track progress regularly
\.


--
-- Data for Name: job_families; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_families (id, name, description, department) FROM stdin;
1bc43ea4-be76-49a4-b84a-38f93de2221e	Business Partnering	You analyse, advise, and implement solutions associated with their functional discipline (e.g. Finance, People& etc.) for an assigned function/department.	People&
37060744-ab00-485b-9ae0-13e90db4d06e	Buying	You effectively respond to consumer demand by understanding market trends and ensuring supply of an optimal assortment of goods on bol through high-quality negotiation and effective supplier management.	Commercial
37c45168-6536-4cc2-b8d4-ceb3685b10d6	Business Analysis	You identify and analyse business problems and support the realisation of workable solutions to these business problems using analytical and process optimisation techniques.	Product & Technology
5503a631-fd9a-4237-a4e1-367f7d7bf038	Commercial Partnering	You build, grow and maintain long-term and mutually beneficial relationships with customers through acquisition, account management and commercial activities.	Commercial
b7138a53-f8ff-4592-af20-cc4d910e5e28	Product Management	You deliver maximised value to customers by defining product vision and strategy and guiding product development, in line with customer needs and ambitions for bol.	Product & Technology
ed415a92-0bbe-4543-81aa-bfc00c0b6266	Commercial Expertise	You plan, analyse, advise and optimise the customer journey cycle and/or promotions and marketing campaigns for own and partner assortment.	Commercial
\.


--
-- Data for Name: job_family_competences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_family_competences (id, job_family_id, competence_id, importance_level) FROM stdin;
f9851ab7-0ee4-45ee-b001-ababc23ddb64	1bc43ea4-be76-49a4-b84a-38f93de2221e	17411cab-b076-43b3-af3e-65db8468c041	5
859097e4-54a2-49a3-95fb-42e304de6715	37c45168-6536-4cc2-b8d4-ceb3685b10d6	17411cab-b076-43b3-af3e-65db8468c041	5
9bd1f7dc-520a-4212-bbda-a9cfc962310b	b7138a53-f8ff-4592-af20-cc4d910e5e28	17411cab-b076-43b3-af3e-65db8468c041	5
f171c868-76d6-43c9-8e19-d9f0b685a187	37060744-ab00-485b-9ae0-13e90db4d06e	17411cab-b076-43b3-af3e-65db8468c041	5
c343d616-5631-4e3d-b534-64c35751b826	5503a631-fd9a-4237-a4e1-367f7d7bf038	17411cab-b076-43b3-af3e-65db8468c041	5
13f25217-de7d-494c-9ff4-a5ff2305a45c	1bc43ea4-be76-49a4-b84a-38f93de2221e	07a79c4d-61bf-4991-a4fb-641d2bd3f8cb	5
1899441b-27a5-42a1-8331-69e4bbb8c51a	37c45168-6536-4cc2-b8d4-ceb3685b10d6	07a79c4d-61bf-4991-a4fb-641d2bd3f8cb	5
a41b9dee-57c7-41e6-a93c-cc64596fdbad	37c45168-6536-4cc2-b8d4-ceb3685b10d6	c649801e-6010-4810-a0e7-cc5be31a8e5a	5
cc42f781-cdc4-4052-9741-c32ff87893b6	37c45168-6536-4cc2-b8d4-ceb3685b10d6	1adad5e3-5488-4831-9bbb-0a477c331ed9	5
f76ff9bf-1ce2-4f91-a521-10fa087699bf	b7138a53-f8ff-4592-af20-cc4d910e5e28	1adad5e3-5488-4831-9bbb-0a477c331ed9	5
c4c1bc7c-daad-4657-a892-11feb05b09d6	1bc43ea4-be76-49a4-b84a-38f93de2221e	a3d1e957-0028-46db-b765-de196ea6d0ed	5
839e863a-a87c-460a-824f-875f67216fd9	37060744-ab00-485b-9ae0-13e90db4d06e	a3d1e957-0028-46db-b765-de196ea6d0ed	5
652bd802-b0ac-42f6-899d-3a3cff074299	5503a631-fd9a-4237-a4e1-367f7d7bf038	a3d1e957-0028-46db-b765-de196ea6d0ed	5
780a16f7-fded-4b81-8d90-7f437d33d5f1	37060744-ab00-485b-9ae0-13e90db4d06e	3ca4daf5-1b80-4c9e-b29a-47dc1ab206a6	5
b0a14513-ea71-417f-8afe-cbfb3a46f1e5	ed415a92-0bbe-4543-81aa-bfc00c0b6266	3ca4daf5-1b80-4c9e-b29a-47dc1ab206a6	5
f03c606f-077d-4a1b-8d91-4f1c39ecdb5a	1bc43ea4-be76-49a4-b84a-38f93de2221e	d2071e73-bb5f-4dcd-86c2-a413ba5ad406	5
8715307f-8a23-4152-aef7-921a73277881	5503a631-fd9a-4237-a4e1-367f7d7bf038	d2071e73-bb5f-4dcd-86c2-a413ba5ad406	5
b52b5ece-d7a8-47a7-bd07-7b1c5a15502e	ed415a92-0bbe-4543-81aa-bfc00c0b6266	e455a99e-0499-4d68-8d73-b18384b11de0	5
a3d21034-bc30-4b10-a98b-901fc77bb115	b7138a53-f8ff-4592-af20-cc4d910e5e28	f4c987ae-cca8-41f5-a34f-4809a529dc03	5
8648c987-2693-419b-b605-5cf6ca650b6f	5503a631-fd9a-4237-a4e1-367f7d7bf038	f4c987ae-cca8-41f5-a34f-4809a529dc03	5
7b9747df-298b-4a75-9456-b8b7e09694c6	b7138a53-f8ff-4592-af20-cc4d910e5e28	12af5a3e-ddce-480c-8f1b-11fcaef3151a	5
455a7b7f-b3e6-4500-9020-c9565644259d	37060744-ab00-485b-9ae0-13e90db4d06e	7aa71d5e-a266-4f7c-86a8-887168c8e703	5
8d2d333c-e30f-478e-b83f-8bb720da384b	37060744-ab00-485b-9ae0-13e90db4d06e	6f6b5a23-c962-489f-a384-d33033e0d732	5
0acc56f2-497c-4468-8ccb-ec8d4c6cff4d	ed415a92-0bbe-4543-81aa-bfc00c0b6266	eda91190-2699-4339-a510-5d5b76fe85c9	5
c18d23f4-a03f-4ac0-b22b-f97097429522	ed415a92-0bbe-4543-81aa-bfc00c0b6266	f8cc3143-c278-47f3-a0e9-2de3c05cdcb0	5
285e5796-cce9-497f-a6cc-01e6cbdcc072	ed415a92-0bbe-4543-81aa-bfc00c0b6266	d6351bb6-23f2-4a06-97c7-c6db098cd8ed	5
\.


--
-- Data for Name: skill_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skill_lines (id, category, line_id, name, color, created_at) FROM stdin;
00000000-0000-0000-0000-000000000001	core	problem-solving	Problem Solving	#3b82f6	2025-03-30 19:38:22.951875+00
00000000-0000-0000-0000-000000000002	core	communication	Communication	#ef4444	2025-03-30 19:38:22.951875+00
00000000-0000-0000-0000-000000000003	technical	programming	Programming	#8b5cf6	2025-03-30 21:55:07.318836+00
00000000-0000-0000-0000-000000000004	technical	data-analysis	Data Analysis	#10b981	2025-03-30 21:55:07.318836+00
\.


--
-- Data for Name: skill_stations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.skill_stations (id, line_id, station_id, name, level, x_position, y_position, created_at) FROM stdin;
3159049f-65a7-4971-a2e9-416115ea3143	00000000-0000-0000-0000-000000000001	ps-1	Basic Analysis	1	20	30	2025-03-30 19:38:22.951875+00
406edef7-3126-482c-96c9-cf6ff33685a4	00000000-0000-0000-0000-000000000001	ps-2	Problem Framing	2	35	30	2025-03-30 19:38:22.951875+00
dfd668e4-3de3-4458-a8ac-29adc43a2bdf	00000000-0000-0000-0000-000000000001	ps-3	Advanced Analysis	3	50	40	2025-03-30 19:38:22.951875+00
732c55a0-348b-4738-a9e9-10633fb2a073	00000000-0000-0000-0000-000000000001	ps-4	Complex Problem Solving	4	65	50	2025-03-30 19:38:22.951875+00
7a29185c-92fd-48ef-badb-54c8e6e5f277	00000000-0000-0000-0000-000000000002	com-1	Basic Communication	1	20	70	2025-03-30 19:38:22.951875+00
0306ffde-5a1d-4211-a9f4-ccce322c56a7	00000000-0000-0000-0000-000000000002	com-2	Effective Messaging	2	35	70	2025-03-30 19:38:22.951875+00
b0a36de5-02d1-40f3-9ed5-1c800adfc3b9	00000000-0000-0000-0000-000000000002	com-3	Stakeholder Communication	3	50	60	2025-03-30 19:38:22.951875+00
1cd8487e-c8d2-4da0-bf7f-8c2312df040c	00000000-0000-0000-0000-000000000002	com-4	Strategic Communication	4	65	50	2025-03-30 19:38:22.951875+00
8a76ae9c-407e-4049-9261-21d6781eb3c8	00000000-0000-0000-0000-000000000001	ps-2	Problem Framing	2	35	30	2025-03-30 21:55:07.318836+00
020a633d-e3d1-4943-921a-a3ebb94fcc55	00000000-0000-0000-0000-000000000001	ps-3	Advanced Analysis	3	50	40	2025-03-30 21:55:07.318836+00
f92a011e-16a4-410d-bed6-319b69f85878	00000000-0000-0000-0000-000000000001	ps-4	Complex Problem Solving	4	65	50	2025-03-30 21:55:07.318836+00
f4f847b7-9eca-49a5-8925-9518362d338d	00000000-0000-0000-0000-000000000002	com-1	Basic Communication	1	20	70	2025-03-30 21:55:07.318836+00
e9dc6f3c-db56-40ff-9492-65e62d45d926	00000000-0000-0000-0000-000000000002	com-3	Stakeholder Communication	3	50	60	2025-03-30 21:55:07.318836+00
14574abd-32eb-484e-adb7-c399826fe99f	00000000-0000-0000-0000-000000000003	prog-1	Basic Coding	1	20	30	2025-03-30 21:55:07.318836+00
f589287f-d24a-4de4-862a-912e8bc7db2d	00000000-0000-0000-0000-000000000003	prog-2	Intermediate Coding	2	35	25	2025-03-30 21:55:07.318836+00
72a7ba42-b178-446c-b924-d22346715b03	00000000-0000-0000-0000-000000000003	prog-3	Advanced Programming	3	50	20	2025-03-30 21:55:07.318836+00
31981362-24b9-49be-aa68-7c06c0bb7ae3	00000000-0000-0000-0000-000000000003	prog-4	Architecture Design	4	65	15	2025-03-30 21:55:07.318836+00
9f7f9fc0-4313-4b98-b873-6a89570dd9d3	00000000-0000-0000-0000-000000000004	data-1	Data Collection	1	20	70	2025-03-30 21:55:07.318836+00
efb8d6cd-3ff5-4822-a7b6-0b1e793ae33d	00000000-0000-0000-0000-000000000004	data-2	Data Processing	2	35	65	2025-03-30 21:55:07.318836+00
498a1c7a-d812-46ee-87ef-2ac783080522	00000000-0000-0000-0000-000000000004	data-3	Statistical Analysis	3	50	60	2025-03-30 21:55:07.318836+00
466cc5c6-c9be-4892-9391-c5456bf186b6	00000000-0000-0000-0000-000000000004	data-4	Advanced Modeling	4	65	55	2025-03-30 21:55:07.318836+00
\.


--
-- Data for Name: user_competences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_competences (id, user_id, competence_id, current_level, target_level, last_assessed_at) FROM stdin;
4703bc6a-f020-48d2-9437-c360bdb6c8d5	0dd0a1a3-c887-43d1-af2c-b7069b4a7940	17411cab-b076-43b3-af3e-65db8468c041	75	85	2025-03-31 18:32:37.488953+00
43a98c0e-7df5-499e-8d3d-1cf37560eb51	0dd0a1a3-c887-43d1-af2c-b7069b4a7940	07a79c4d-61bf-4991-a4fb-641d2bd3f8cb	72	80	2025-03-31 18:32:37.488953+00
cf51023b-0383-46a6-9671-a0b5c12c2e19	0dd0a1a3-c887-43d1-af2c-b7069b4a7940	c649801e-6010-4810-a0e7-cc5be31a8e5a	79	85	2025-03-31 18:32:37.488953+00
30f150bf-8fdf-44b5-9c16-d23fed5aeea1	0dd0a1a3-c887-43d1-af2c-b7069b4a7940	1adad5e3-5488-4831-9bbb-0a477c331ed9	68	80	2025-03-31 18:32:37.488953+00
e9ae2101-4ad4-4f0e-a083-0a3a87b808bb	0dd0a1a3-c887-43d1-af2c-b7069b4a7940	a3d1e957-0028-46db-b765-de196ea6d0ed	65	75	2025-03-31 18:32:37.488953+00
0f039dcf-9f91-4728-aff0-7486b1fad33f	0dd0a1a3-c887-43d1-af2c-b7069b4a7940	3ca4daf5-1b80-4c9e-b29a-47dc1ab206a6	82	90	2025-03-31 18:32:37.488953+00
a1b43e85-442e-40e5-95eb-90945aa36d77	0dd0a1a3-c887-43d1-af2c-b7069b4a7940	f4c987ae-cca8-41f5-a34f-4809a529dc03	58	70	2025-03-31 18:32:37.488953+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, full_name, current_job_family_id, level, years_in_role, created_at) FROM stdin;
0dd0a1a3-c887-43d1-af2c-b7069b4a7940	alex.smith@example.com	Alex Smith	37c45168-6536-4cc2-b8d4-ceb3685b10d6	Medior	2.5	2025-03-31 18:32:37.488953+00
20536097-ef9a-4ef4-b586-c0747075909b	jamie.wong@example.com	Jamie Wong	b7138a53-f8ff-4592-af20-cc4d910e5e28	Senior	3.2	2025-03-31 18:32:37.488953+00
e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2	sam.taylor@example.com	Sam Taylor	1bc43ea4-be76-49a4-b84a-38f93de2221e	Junior	1.0	2025-03-31 18:32:37.488953+00
\.


--
-- Name: career_path_stations career_path_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_path_stations
    ADD CONSTRAINT career_path_stations_pkey PRIMARY KEY (id);


--
-- Name: career_paths career_paths_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_paths
    ADD CONSTRAINT career_paths_pkey PRIMARY KEY (id);


--
-- Name: competences competences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competences
    ADD CONSTRAINT competences_pkey PRIMARY KEY (id);


--
-- Name: development_activities development_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_activities
    ADD CONSTRAINT development_activities_pkey PRIMARY KEY (id);


--
-- Name: job_families job_families_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_families
    ADD CONSTRAINT job_families_pkey PRIMARY KEY (id);


--
-- Name: job_family_competences job_family_competences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_family_competences
    ADD CONSTRAINT job_family_competences_pkey PRIMARY KEY (id);


--
-- Name: skill_lines skill_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_lines
    ADD CONSTRAINT skill_lines_pkey PRIMARY KEY (id);


--
-- Name: skill_stations skill_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_stations
    ADD CONSTRAINT skill_stations_pkey PRIMARY KEY (id);


--
-- Name: user_competences user_competences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_competences
    ADD CONSTRAINT user_competences_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: skill_lines_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX skill_lines_category_idx ON public.skill_lines USING btree (category);


--
-- Name: skill_stations_line_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX skill_stations_line_id_idx ON public.skill_stations USING btree (line_id);


--
-- Name: career_path_stations career_path_stations_career_path_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_path_stations
    ADD CONSTRAINT career_path_stations_career_path_id_fkey FOREIGN KEY (career_path_id) REFERENCES public.career_paths(id);


--
-- Name: career_path_stations career_path_stations_job_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_path_stations
    ADD CONSTRAINT career_path_stations_job_family_id_fkey FOREIGN KEY (job_family_id) REFERENCES public.job_families(id);


--
-- Name: career_paths career_paths_from_job_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_paths
    ADD CONSTRAINT career_paths_from_job_family_id_fkey FOREIGN KEY (from_job_family_id) REFERENCES public.job_families(id);


--
-- Name: career_paths career_paths_to_job_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.career_paths
    ADD CONSTRAINT career_paths_to_job_family_id_fkey FOREIGN KEY (to_job_family_id) REFERENCES public.job_families(id);


--
-- Name: development_activities development_activities_competence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.development_activities
    ADD CONSTRAINT development_activities_competence_id_fkey FOREIGN KEY (competence_id) REFERENCES public.competences(id);


--
-- Name: job_family_competences job_family_competences_competence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_family_competences
    ADD CONSTRAINT job_family_competences_competence_id_fkey FOREIGN KEY (competence_id) REFERENCES public.competences(id);


--
-- Name: job_family_competences job_family_competences_job_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_family_competences
    ADD CONSTRAINT job_family_competences_job_family_id_fkey FOREIGN KEY (job_family_id) REFERENCES public.job_families(id);


--
-- Name: skill_stations skill_stations_line_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skill_stations
    ADD CONSTRAINT skill_stations_line_id_fkey FOREIGN KEY (line_id) REFERENCES public.skill_lines(id);


--
-- Name: user_competences user_competences_competence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_competences
    ADD CONSTRAINT user_competences_competence_id_fkey FOREIGN KEY (competence_id) REFERENCES public.competences(id);


--
-- Name: user_competences user_competences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_competences
    ADD CONSTRAINT user_competences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_current_job_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_current_job_family_id_fkey FOREIGN KEY (current_job_family_id) REFERENCES public.job_families(id);


--
-- PostgreSQL database dump complete
--

