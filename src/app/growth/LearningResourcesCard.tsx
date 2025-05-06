// src/app/growth/LearningResourcesCard.tsx
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DownloadCloud, BookOpenCheck } from "lucide-react"; // DownloadCloud or BookOpenCheck
import { growthDashboardData, type LearningResource } from "./data";
import { Separator } from "~/components/ui/separator";

export function LearningResourcesCard() {
	const { learningResources } = growthDashboardData;

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg font-semibold">
					<BookOpenCheck className="h-5 w-5 text-primary" /> {/* Changed icon */}
					Learning Resources
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				{learningResources.map((resource, index) => (
					<div key={resource.id}>
						<div>
							<h4 className="text-sm font-medium text-foreground">{resource.title}</h4>
							<div className="flex justify-between text-xs text-muted-foreground">
								<span>{resource.type}</span>
								<span>{resource.duration}</span>
							</div>
						</div>
						{index < learningResources.length - 1 && <Separator className="my-3" />}
					</div>
				))}
			</CardContent>
			<CardFooter>
				<Button variant="outline" className="w-full">
					View All Resources
				</Button>
			</CardFooter>
		</Card>
	);
}