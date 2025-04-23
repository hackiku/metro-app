// src/app/_components/dashboard/Dashboard.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { BarChart2, BookOpen, Award, Briefcase, ArrowRight } from "lucide-react";
import { SummaryCard } from "./SummaryCard";
import { SkillsOverview } from "./SkillsOverview";
import { CareerPreview } from "./CareerPreview";
import { ActionItems } from "./ActionItems";
import { useUserData } from "~/hooks/useUserData";

export function Dashboard() {
	const { userData, isLoading, error } = useUserData();
	const [activeTab, setActiveTab] = useState("overview");

	// Mock action items data
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

	if (error) {
		return (
			<div className="flex items-center justify-center h-64 text-center">
				<div>
					<h3 className="text-lg font-medium mb-2">Failed to load dashboard data</h3>
					<p className="text-muted-foreground mb-4">{error}</p>
					<Button onClick={() => window.location.reload()}>Retry</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome{userData ? `, ${userData.name.split(' ')[0]}` : ''} to your career development dashboard
					</p>
				</div>
				<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
					Start Assessment
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
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
							value={userData?.position || "Loading..."}
							description={userData?.department || ""}
							icon={Briefcase}
							isLoading={isLoading}
						/>

						<SummaryCard
							title="Competence Score"
							value={`${userData ? Math.round(userData.skills.reduce((sum, skill) => sum + skill.proficiency, 0) / userData.skills.length) : 0}%`}
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
							currentPosition={userData?.position || "Current Position"}
							nextPosition="Lead Developer"
							isLoading={isLoading}
						/>

						<SkillsOverview
							skills={userData?.skills || []}
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