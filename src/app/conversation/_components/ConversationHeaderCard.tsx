// src/app/conversation/_components/ConversationHeaderCard.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ColoredProgress } from "~/components/ui/colored-progress";
import { MessageSquare, Target, BarChartHorizontal } from "lucide-react"; // Target for goal

interface ConversationHeaderCardProps {
	targetRole: string;
	subtitle: string;
	overallProgress: number; // Calculated percentage 0-100
}

export function ConversationHeaderCard({
	targetRole,
	subtitle,
	overallProgress,
}: ConversationHeaderCardProps) {
	return (
		<Card className="mb-8 shadow-md dark:bg-card">
			<CardHeader className="flex flex-col items-start gap-4 space-y-0 pb-4 sm:flex-row sm:items-center">
				<div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<MessageSquare className="h-7 w-7" />
				</div>
				<div className="flex-1">
					<CardTitle className="text-2xl font-bold tracking-tight text-foreground">
						Career Conversation Guide
					</CardTitle>
					<CardDescription className="mt-1">
						{subtitle.replace("Product Analyst", targetRole)}
					</CardDescription>
				</div>
				<div className="flex w-full flex-col items-start pt-2 sm:w-auto sm:items-end sm:pt-0">
					<div className="mb-1 flex w-full items-center justify-between text-sm sm:w-auto sm:justify-end sm:gap-2">
						<span className="font-medium text-muted-foreground">Target Role:</span>
						<span className="font-semibold text-primary">{targetRole}</span>
					</div>
					<div className="flex w-full items-center justify-between text-sm sm:w-auto sm:justify-end sm:gap-2">
						<span className="font-medium text-muted-foreground">Preparation:</span>
						<span className="font-semibold text-primary">{overallProgress}%</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-6 pb-4 pt-0">
				{/* Optional: Add a progress bar visually tied to the preparation state */}
				<ColoredProgress value={overallProgress} className="h-1.5" indicatorColorClassName="bg-primary" />
			</CardContent>
		</Card>
	);
}