// src/app/growth/WeeklyFocusCard.tsx
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MessageSquare } from "lucide-react";
import { growthDashboardData, type WeeklyFocusItem } from "./data";
import { cn } from "~/lib/utils";

export function WeeklyFocusCard() {
	const { weeklyFocus } = growthDashboardData;

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader>
				<CardTitle className="text-xl font-semibold">Weekly Focus</CardTitle> {/* Adjusted size */}
				<CardDescription>Your priority actions for this week</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{weeklyFocus.map((item) => (
					<div
						key={item.id}
						className={cn(
							"rounded-lg border p-3",
							item.isPrimary ? "bg-primary/10 border-primary/20 dark:bg-primary/20" : "bg-background border-border"
						)}
					>
						<h4 className="mb-1 font-medium text-foreground">{item.title}</h4>
						<p className="text-sm text-muted-foreground">{item.description}</p>
					</div>
				))}
			</CardContent>
			<CardFooter>
				<Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
					<MessageSquare className="mr-2 h-4 w-4" />
					Plan Career Conversation
				</Button>
			</CardFooter>
		</Card>
	);
}