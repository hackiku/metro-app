// src/app/growth/UpcomingActionsCard.tsx
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CalendarDays, Bell } from "lucide-react";
import { growthDashboardData, type UpcomingAction } from "./data";
import { Separator } from "~/components/ui/separator";

export function UpcomingActionsCard() {
	const { upcomingActions } = growthDashboardData;

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-lg font-semibold">
					<CalendarDays className="h-5 w-5 text-primary" />
					Upcoming Actions
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-0">
				{upcomingActions.map((action, index) => (
					<div key={action.id}>
						<div>
							<h4 className="text-sm font-medium text-foreground">{action.title}</h4>
							<p className="text-xs capitalize text-muted-foreground">{action.category}</p>
						</div>
						{index < upcomingActions.length - 1 && <Separator className="my-3" />}
					</div>
				))}
			</CardContent>
			<CardFooter>
				<Button variant="outline" className="w-full">
					<Bell className="mr-2 h-4 w-4" />
					Set Reminder
				</Button>
			</CardFooter>
		</Card>
	);
}