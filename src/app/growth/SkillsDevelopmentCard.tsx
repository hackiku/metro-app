// src/app/growth/SkillsDevelopmentCard.tsx
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ColoredProgress } from "~/components/ui/colored-progress";
import { UploadCloud } from "lucide-react";
import { growthDashboardData, getSkillProgressPercentage, type SkillDevelopmentItem } from "./data";

export function SkillsDevelopmentCard() {
	const { skillsDevelopment } = growthDashboardData;

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Skills Development</CardTitle> {/* Adjusted size */}
				<CardDescription>Track your improvement in key skill areas</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{skillsDevelopment.map((skill) => (
					<div key={skill.id}>
						<div className="mb-1 flex justify-between">
							<span className="text-sm font-medium text-foreground">{skill.name}</span>
							<span className="text-sm text-muted-foreground">
								{skill.currentLevel}/{skill.targetLevel}
							</span>
						</div>
						<ColoredProgress
							value={getSkillProgressPercentage(skill.currentLevel, skill.targetLevel)}
							className="h-2"
							indicatorColorClassName="bg-primary" // Or dynamically color if needed
						/>
					</div>
				))}
			</CardContent>
			<CardFooter>
				<Button variant="outline" className="w-full">
					<UploadCloud className="mr-2 h-4 w-4" />
					Upload Feedback
				</Button>
			</CardFooter>
		</Card>
	);
}