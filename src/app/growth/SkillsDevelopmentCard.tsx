// src/app/growth/SkillsDevelopmentCard.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ColoredProgress } from "~/components/ui/colored-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { ArrowUpRight, CheckCircle } from "lucide-react";
import { useCompetences } from "~/contexts/CompetencesContext";
import { useUser } from "~/contexts/UserContext";
import { cn } from "~/lib/utils";
import Link from "next/link";

export function SkillsDevelopmentCard() {
	// Use real context data
	const { userCompetences, isLoading: competencesLoading } = useCompetences();
	const { currentUser } = useUser();
	const [activeTab, setActiveTab] = useState("all");

	// Prepare data based on competences
	const competenceGroups = useMemo(() => {
		if (!userCompetences || !Array.isArray(userCompetences)) {
			return { all: [], technical: [], soft: [], domain: [] };
		}

		// Group competences by category
		const grouped = userCompetences.reduce((acc, comp) => {
			// Skip invalid competences
			if (!comp.competence) return acc;

			// Get category or default to "other"
			const category = (comp.competence.category || "other").toLowerCase();

			// Map categories to our display groups
			let group = "other";
			if (category.includes("tech") || category.includes("programming")) {
				group = "technical";
			} else if (category.includes("soft") || category.includes("communication") || category.includes("interpersonal")) {
				group = "soft";
			} else if (category.includes("domain") || category.includes("industry")) {
				group = "domain";
			}

			// Add to the appropriate group
			if (!acc[group]) acc[group] = [];
			acc[group].push({
				id: comp.id,
				name: comp.competence.name,
				category: comp.competence.category,
				currentLevel: comp.current_level || 0,
				targetLevel: comp.target_level || comp.current_level + 1,
				progress: Math.min(100, ((comp.current_level || 0) / (comp.target_level || 5)) * 100)
			});

			// Also add to "all" group
			if (!acc.all) acc.all = [];
			acc.all.push({
				id: comp.id,
				name: comp.competence.name,
				category: comp.competence.category,
				currentLevel: comp.current_level || 0,
				targetLevel: comp.target_level || comp.current_level + 1,
				progress: Math.min(100, ((comp.current_level || 0) / (comp.target_level || 5)) * 100)
			});

			return acc;
		}, { all: [], technical: [], soft: [], domain: [] });

		// Sort each group by progress (ascending, so skills with lowest progress first)
		Object.keys(grouped).forEach(key => {
			grouped[key].sort((a, b) => a.progress - b.progress);
		});

		return grouped;
	}, [userCompetences]);

	// Get skills for current tab
	const displaySkills = competenceGroups[activeTab] || [];

	// Calculate overall progress
	const overallProgress = useMemo(() => {
		if (displaySkills.length === 0) return 0;
		const total = displaySkills.reduce((sum, skill) => sum + skill.progress, 0);
		return Math.round(total / displaySkills.length);
	}, [displaySkills]);

	// Handle loading state
	if (competencesLoading) {
		return (
			<Card className="shadow-sm">
				<CardHeader className="p-4">
					<CardTitle className="text-lg">Skills Development</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded-md"></div>
						<div className="space-y-2">
							<div className="h-4 bg-muted rounded-md"></div>
							<div className="h-4 bg-muted rounded-md w-5/6"></div>
							<div className="h-4 bg-muted rounded-md w-4/6"></div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Empty state
	if (displaySkills.length === 0) {
		return (
			<Card className="shadow-sm">
				<CardHeader className="p-4">
					<CardTitle className="text-lg">Skills Development</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 text-center">
					<p className="text-muted-foreground py-6">
						No competences set. Visit the competences page to add skills.
					</p>
					<Link href="/competences">
						<Button>
							Add Competences
							<ArrowUpRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="shadow-sm">
			<CardHeader className="p-4">
				<CardTitle className="text-lg">Skills Development</CardTitle>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
					<div className="flex items-center justify-between">
						<TabsList>
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="technical">Technical</TabsTrigger>
							<TabsTrigger value="soft">Soft Skills</TabsTrigger>
							<TabsTrigger value="domain">Domain</TabsTrigger>
						</TabsList>
						<div className="text-sm font-medium">{overallProgress}% Complete</div>
					</div>

					{/* All skills tab content */}
					<TabsContent value="all" className="space-y-4 mt-2">
						{renderSkills(displaySkills)}
					</TabsContent>

					{/* Technical skills tab content */}
					<TabsContent value="technical" className="space-y-4 mt-2">
						{renderSkills(displaySkills)}
					</TabsContent>

					{/* Soft skills tab content */}
					<TabsContent value="soft" className="space-y-4 mt-2">
						{renderSkills(displaySkills)}
					</TabsContent>

					{/* Domain knowledge tab content */}
					<TabsContent value="domain" className="space-y-4 mt-2">
						{renderSkills(displaySkills)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

// Helper function to render skills list
function renderSkills(skills) {
	return skills.map((skill) => (
		<div key={skill.id} className="space-y-1">
			<div className="flex items-center justify-between text-sm">
				<div className="flex items-center gap-2">
					{skill.progress >= 100 ? (
						<CheckCircle className="h-4 w-4 text-green-500" />
					) : null}
					<span className={cn(
						"font-medium",
						skill.progress >= 100 ? "text-green-600 dark:text-green-400" : "text-foreground"
					)}>
						{skill.name}
					</span>
				</div>
				<span className="text-xs text-muted-foreground">
					Level {skill.currentLevel}/{skill.targetLevel}
				</span>
			</div>
			<ColoredProgress
				value={skill.progress}
				indicatorColorClassName={
					skill.progress >= 100
						? "bg-green-500"
						: skill.progress >= 75
							? "bg-blue-500"
							: skill.progress >= 50
								? "bg-amber-500"
								: "bg-primary"
				}
				className="h-2"
			/>
		</div>
	));
}