// src/app/comparison/TransitionTimelineCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { comparisonData } from "./data";

export function TransitionTimelineCard() {
	const { transitionTimeline } = comparisonData;

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader>
				<CardTitle className="text-lg">Transition Timeline</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="mb-4 text-sm text-muted-foreground">
					{transitionTimeline.description}
				</p>
				<div className="mb-6 rounded-lg bg-primary/10 p-4 text-center dark:bg-primary/20">
					<p className="text-xl font-bold text-primary">
						{transitionTimeline.duration}
					</p>
					<p className="text-xs text-muted-foreground">
						{transitionTimeline.details}
					</p>
				</div>
				<h4 className="mb-2 text-sm font-medium text-foreground">
					Key Development Areas:
				</h4>
				<ul className="space-y-1.5 text-sm text-muted-foreground">
					{transitionTimeline.keyDevelopmentAreas.map((area, index) => (
						<li key={index} className="flex items-start gap-2">
							<Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
							<span>{area}</span>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter className="p-6 pt-2">
				<Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
					I Want To Go Here
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</CardFooter>
		</Card>
	);
}