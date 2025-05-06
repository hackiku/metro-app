// src/app/_components/dashboard/Dashboard.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { BarChart2, BookOpen, Award, Briefcase, ArrowRight, Target } from "lucide-react";
import { SummaryCard } from "./SummaryCard";
import { SkillsOverview } from "./SkillsOverview";
import { CareerPreview } from "./CareerPreview";
import { ActionItems } from "./ActionItems";
import { useUser } from "~/contexts/UserContext";
import { api } from "~/trpc/react";
import { Avatar } from "~/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "~/components/ui/avatar";

// Helper to generate avatar fallback from name
function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function Dashboard() {
	const { currentUser } = useUser();
	const [activeTab, setActiveTab] = useState("overview");

	// Fetch user skills (competences) using our new endpoint
	const userCompetencesQuery = api.user.getUserCompetences.useQuery(
		{ userId: currentUser?.id || "" },
		{
			enabled: !!currentUser?.id,
			// Fallback silently if the endpoint doesn't exist
			onError: () => console.log("User competences query not implemented yet")
		}
	);

	// Determine if we're loading
	const isLoading = !currentUser || userCompetencesQuery.isLoading;

	// Process competences or use fallback skills
	const skills = userCompetencesQuery.data ?
		userCompetencesQuery.data.map(comp => ({
			id: comp.id,
			name: comp.name,
			category: comp.category,
			proficiency: comp.current_level
		})) :
		[
			{ id: '1', name: 'Technical Expertise', category: 'technical', proficiency: 75 },
			{ id: '2', name: 'Leadership', category: 'leadership', proficiency: 58 },
			{ id: '3', name: 'Communication', category: 'soft', proficiency: 82 },
			{ id: '4', name: 'Domain Knowledge', category: 'domain', proficiency: 68 },
		];

	// Mock action items data (keeping as is since no DB items yet)
	const actionItems = [
		{
			id: "1",
			title: "Complete React Advanced Course",
			description: "Finish remaining modules of the advanced React training",
			status: "in_progress" as const,
			dueDate: "May 15, 2025",
		},
		{
			id: "2",
			title: "Leadership Workshop",
			description: "Attend the quarterly leadership workshop",
			status: "not_started" as const,
			dueDate: "June 5, 2025",
		},
		{
			id: "3",
			title: "Project Documentation",
			description: "Create documentation for the current project",
			status: "in_progress" as const,
			dueDate: "April 30, 2025",
		},
		{
			id: "4",
			title: "Mentor Junior Developer",
			description: "Weekly mentoring sessions with new team member",
			status: "not_started" as const,
		},
		{
			id: "5",
			title: "TypeScript Certification",
			description: "Complete certification exam",
			status: "completed" as const,
		},
	];

	// Get current position (hardcoded mapping for now)
	const positionMap: Record<string, { name: string, level: string }> = {
		'37c45168-6536-4cc2-b8d4-ceb3685b10d6': { name: 'Frontend Developer', level: 'Medior' },
		'b7138a53-f8ff-4592-af20-cc4d910e5e28': { name: 'Project Manager', level: 'Senior' },
		'1bc43ea4-be76-49a4-b84a-38f93de2221e': { name: 'UX Designer', level: 'Junior' }
	};

	const currentPosition = currentUser?.current_job_family_id
		? positionMap[currentUser.current_job_family_id]?.name || 'Unknown Position'
		: 'Position not set';

	// Calculate average skill proficiency
	const avgProficiency = skills.length > 0
		? Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length)
		: 0;

	if (userCompetencesQuery.error) {
		console.log("Error fetching competences:", userCompetencesQuery.error);
	}

	return (
		<div className="space-y-6">
			{/* Header with user info */}
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div className="flex items-center gap-4">
					<Avatar className="h-16 w-16 border-2 border-primary/20">
						<AvatarImage src={`https://avatars.dicebear.com/api/initials/${currentUser?.full_name.replace(/\s+/g, '_')}.svg`} />
						<AvatarFallback>{currentUser ? getInitials(currentUser.full_name) : 'U'}</AvatarFallback>
					</Avatar>

					<div>
						<h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
							{currentUser?.full_name || 'Welcome'}
							{currentUser?.level && (
								<span className="text-sm font-normal bg-primary/10 text-primary px-2 py-0.5 rounded">
									{currentUser.level}
								</span>
							)}
						</h1>
						<p className="text-muted-foreground">
							{currentPosition} • {currentUser?.years_in_role} years experience
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" className="flex items-center">
						<Target className="mr-2 h-4 w-4" />
						Set Goal
					</Button>
					<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
						Start Assessment
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>

			<Tabs
				defaultValue="overview"
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4"
			>
				<TabsList className="bg-muted">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="jobFamilies">Job Families</TabsTrigger>
					<TabsTrigger value="development">Development</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<SummaryCard
							title="Your Position"
							value={currentPosition}
							description={currentUser?.level || ""}
							icon={Briefcase}
							isLoading={isLoading}
						/>

						<SummaryCard
							title="Competence Score"
							value={`${avgProficiency}%`}
							description="+4% from last assessment"
							icon={Award}
							trend={{ value: "+4%", positive: true }}
							isLoading={isLoading}
						/>

						<SummaryCard
							title="Development Activities"
							value={actionItems.length}
							description={`${actionItems.filter(i => i.status === 'in_progress').length} in progress, ${actionItems.filter(i => i.status === 'completed').length} completed`}
							icon={BookOpen}
							isLoading={isLoading}
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<CareerPreview
							currentPosition={currentPosition}
							nextPosition="Senior Developer"
							isLoading={isLoading}
						/>

						<SkillsOverview
							skills={skills}
							isLoading={isLoading}
						/>
					</div>

					<ActionItems items={actionItems} isLoading={isLoading} />
				</TabsContent>

				<TabsContent value="jobFamilies" className="space-y-4">
					<div className="flex h-64 items-center justify-center border rounded-lg">
						<div className="flex flex-col items-center">
							<BarChart2 className="h-16 w-16 text-muted" />
							<p className="mt-4 text-center text-muted-foreground">Job Families Content Coming Soon</p>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="development" className="space-y-4">
					<div className="flex h-64 items-center justify-center border rounded-lg">
						<div className="flex flex-col items-center">
							<BookOpen className="h-16 w-16 text-muted" />
							<p className="mt-4 text-center text-muted-foreground">Development Plan Content Coming Soon</p>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}