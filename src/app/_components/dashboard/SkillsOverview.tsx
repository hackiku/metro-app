// src/app/_components/dashboard/SkillsOverview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Brain, Shield, Zap, FileText } from "lucide-react";

interface UserSkill {
	id: string;
	name: string;
	category: string;
	proficiency: number;
}

interface SkillsOverviewProps {
	skills: UserSkill[];
	isLoading?: boolean;
}

// Group skills by category and calculate average proficiency
function groupSkillsByCategory(skills: UserSkill[]) {
	const categories: Record<string, {
		skills: UserSkill[],
		avgProficiency: number,
		icon: React.ReactNode
	}> = {};

	skills.forEach(skill => {
		if (!categories[skill.category]) {
			// Set default icon based on category
			let icon = <FileText className="h-4 w-4" />;

			if (skill.category.toLowerCase().includes('technical')) {
				icon = <Brain className="h-4 w-4" />;
			} else if (skill.category.toLowerCase().includes('leadership')) {
				icon = <Shield className="h-4 w-4" />;
			} else if (skill.category.toLowerCase().includes('soft')) {
				icon = <Zap className="h-4 w-4" />;
			}

			categories[skill.category] = { skills: [], avgProficiency: 0, icon };
		}

		categories[skill.category].skills.push(skill);
	});

	// Calculate average proficiency for each category
	Object.keys(categories).forEach(category => {
		const categorySkills = categories[category].skills;
		const sum = categorySkills.reduce((acc, skill) => acc + skill.proficiency, 0);
		categories[category].avgProficiency = Math.round(sum / categorySkills.length);
	});

	return categories;
}

export function SkillsOverview({ skills, isLoading = false }: SkillsOverviewProps) {
	if (isLoading) {
		return (
			<Card className="col-span-1 p-6">
				<CardHeader className="px-0 pt-0">
					<CardTitle className="text-xl font-semibold">Skills Overview</CardTitle>
				</CardHeader>
				<CardContent className="px-0 pb-0">
					<div className="space-y-4">
						{[1, 2, 3].map((n) => (
							<div key={n} className="space-y-2">
								<div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
								<div className="h-2 animate-pulse rounded-md bg-muted" />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	const skillCategories = groupSkillsByCategory(skills);

	return (
		<Card className="col-span-1 p-6">
			<CardHeader className="px-0 pt-0">
				<CardTitle className="text-xl font-semibold">Skills Overview</CardTitle>
			</CardHeader>
			<CardContent className="px-0 pb-0 space-y-6">
				{Object.entries(skillCategories).map(([category, data]) => (
					<div key={category} className="space-y-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="text-muted-foreground">{data.icon}</span>
								<h3 className="text-sm font-medium">{category}</h3>
							</div>
							<span className="text-sm font-medium">{data.avgProficiency}%</span>
						</div>
						<Progress value={data.avgProficiency} className="h-2" />
						<div className="grid grid-cols-2 gap-2 pt-2">
							{data.skills.map((skill) => (
								<div key={skill.id} className="flex items-center justify-between text-xs">
									<span className="text-muted-foreground">{skill.name}</span>
									<span>{skill.proficiency}%</span>
								</div>
							))}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}