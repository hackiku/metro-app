// src/app/development/data.ts

export interface Competence {
	id: string
	name: string
	description: string
	category?: string
	userRating?: number
}

export interface DevelopmentActivity {
	id: string
	competenceId: string
	activityType: 'job' | 'social' | 'formal'
	description: string
}

export const competences: Competence[] = [
	{
		id: "17411cab-b076-43b3-af3e-65db8468c041",
		name: "Problem Analysis",
		description: "The ability to detect problems, recognise important information, and link various data; to trace potential causes and look for relevant details.",
		category: "Cognitive",
		userRating: 72
	},
	{
		id: "1adad5e3-5488-4831-9bbb-0a477c331ed9",
		name: "Result-Orientedness",
		description: "The ability to take direct action in order to attain or exceed objectives.",
		category: "Execution",
		userRating: 68
	},
	{
		id: "c649801e-6010-4810-a0e7-cc5be31a8e5a",
		name: "Planning & Organising",
		description: "The ability to determine goals and priorities and to assess the actions, time and resources needed to achieve those goals.",
		category: "Execution",
		userRating: 79
	},
	{
		id: "8f4bc412-7ed4-4316-a4ba-8f5c61b83d6e",
		name: "Innovative Power",
		description: "The ability to direct one's inquisitive mind toward initiating new strategies, products, services, and markets.",
		category: "Cognitive",
		userRating: 58
	},
	{
		id: "ba38de35-6750-4ddc-a938-c0b482e9e9a4",
		name: "Cooperation",
		description: "The ability to work effectively with others in order to achieve a shared goal - even when the object at stake is of no direct personal interest.",
		category: "Interpersonal",
		userRating: 82
	},
	{
		id: "e7c26e01-0797-4997-99c9-b2968a86fd54",
		name: "Adaptability",
		description: "The ability to remain fully functional by adapting to changing circumstances (environment, procedures, people).",
		category: "Interpersonal",
		userRating: 75
	}
];

export const developmentActivities: DevelopmentActivity[] = [
	{
		id: "4d32223a-2db7-47df-9776-1c52e45618ed",
		competenceId: "17411cab-b076-43b3-af3e-65db8468c041",
		activityType: "formal",
		description: "Complete a course on data analysis or structured problem-solving techniques"
	},
	{
		id: "562b90ea-ac0b-4b73-986c-c2b7a60d4263",
		competenceId: "17411cab-b076-43b3-af3e-65db8468c041",
		activityType: "social",
		description: "Facilitate a problem-solving workshop for your team"
	},
	{
		id: "658650fa-407b-43a0-ae84-b3dbac77f952",
		competenceId: "17411cab-b076-43b3-af3e-65db8468c041",
		activityType: "social",
		description: "Shadow a senior analyst and observe their approach to complex problems"
	},
	{
		id: "4ec8ddaf-5516-4262-b5b0-c9c672d36eaa",
		competenceId: "1adad5e3-5488-4831-9bbb-0a477c331ed9",
		activityType: "formal",
		description: "Study performance improvement techniques"
	},
	{
		id: "5916d1c8-c2f0-4107-8240-3542729e92a6",
		competenceId: "1adad5e3-5488-4831-9bbb-0a477c331ed9",
		activityType: "social",
		description: "Seek mentoring from colleagues known for delivering results"
	},
	{
		id: "6bc6278c-db8c-4454-a71a-44811fb1be21",
		competenceId: "1adad5e3-5488-4831-9bbb-0a477c331ed9",
		activityType: "formal",
		description: "Take a course on OKR methodology"
	},
	{
		id: "6fcab679-1ed0-4208-9ac4-71b41fabb942",
		competenceId: "1adad5e3-5488-4831-9bbb-0a477c331ed9",
		activityType: "social",
		description: "Join a high-performing team and observe their working methods"
	},
	{
		id: "5b414fc8-6eda-42af-b13e-6389bb0a9068",
		competenceId: "c649801e-6010-4810-a0e7-cc5be31a8e5a",
		activityType: "social",
		description: "Seek feedback from colleagues on your planning approach"
	},
	{
		id: "64ac88d2-99ee-443c-bbbe-915c52c37378",
		competenceId: "c649801e-6010-4810-a0e7-cc5be31a8e5a",
		activityType: "job",
		description: "Take responsibility for planning a small project from start to finish"
	}
];