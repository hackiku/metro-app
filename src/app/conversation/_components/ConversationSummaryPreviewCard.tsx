// src/app/conversation/_components/ConversationSummaryPreviewCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"; // Import Collapsible
import { Download, Copy, FileText, FolderClosed, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { mockUser } from "../_data"; // For demo structure
import { type ConfidenceCheckItemData } from "../types";
import { ConfidenceCheck } from "./summary/ConfidenceCheck";
import { cn } from "~/lib/utils";

interface ConversationSummaryPreviewCardProps {
	userData: typeof mockUser;
	preparationNotes: Record<string, string>; // Need notes for full summary
	talkingPointNotes: Record<string, string>; // Need notes for full summary
	confidenceChecks: Record<string, boolean>;
	confidenceCheckItems: ConfidenceCheckItemData[];
	onToggleConfidenceCheck: (itemId: string) => void;
	onDownload: () => void;
	onCopy: () => void;
	generateSummaryText: () => string; // Pass the generator function
}

export function ConversationSummaryPreviewCard({
	userData,
	preparationNotes, // Receive notes
	talkingPointNotes, // Receive notes
	confidenceChecks,
	confidenceCheckItems,
	onToggleConfidenceCheck,
	onDownload,
	onCopy,
	generateSummaryText // Receive generator
}: ConversationSummaryPreviewCardProps) {

	const [isPreviewOpen, setIsPreviewOpen] = useState(false);

	// Function to create truncated preview strings
	const truncate = (str: string | undefined, len = 80): string => {
		if (!str) return "N/A";
		return str.length > len ? str.substring(0, len) + "..." : str;
	}

	return (
		<Card className="mt-8 shadow-sm dark:bg-card">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-xl font-semibold">
					<FileText className="h-5 w-5 text-primary" />
					Conversation Summary & Actions
				</CardTitle>
				<CardDescription>
					Quick reference of key points and final actions. Expand sections above to edit notes.
				</CardDescription>
			</CardHeader>

			{/* Content: 2 Columns - Preview Sections (Left), Confidence Check (Right) */}
			<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{/* Left Column: Preview Sections (takes 2/3 width on md+) */}
				<div className="space-y-4 md:col-span-2">
					{/* Mini-Card: Current Position */}
					<div className="rounded-md border bg-background p-3 dark:bg-neutral-800/50">
						<h4 className="mb-1 text-sm font-medium text-foreground">Current Position</h4>
						<p className="text-xs text-muted-foreground">{truncate(userData.currentResponsibilities)}</p>
					</div>
					{/* Mini-Card: Career Aspiration */}
					<div className="rounded-md border bg-background p-3 dark:bg-neutral-800/50">
						<h4 className="mb-1 text-sm font-medium text-foreground">Aspiration: {userData.targetRole}</h4>
						<p className="text-xs text-muted-foreground">{truncate(userData.reasonsForInterestInTarget.join(' • '))}</p>
					</div>
					{/* Mini-Card: Development Plan */}
					<div className="rounded-md border bg-background p-3 dark:bg-neutral-800/50">
						<h4 className="mb-1 text-sm font-medium text-foreground">Development Plan</h4>
						<p className="text-xs text-muted-foreground">
							{userData.developmentPlanOverview.phases.length} phases focusing on {truncate(userData.developmentPlanOverview.keySkillsToDevelop.join(', '), 40)}.
						</p>
					</div>
				</div>

				{/* Right Column: Confidence Check (takes 1/3 width on md+) */}
				<div className="h-full rounded-md bg-amber-500/5 p-4 dark:bg-amber-900/10">
					<ConfidenceCheck
						items={confidenceCheckItems}
						checks={confidenceChecks}
						onToggle={onToggleConfidenceCheck}
					/>
				</div>
			</CardContent>

			<Separator className="my-4" />

			{/* Footer: Actions + Expandable Preview */}
			<CardFooter className="flex flex-col items-start p-4 pt-0 sm:p-6 sm:pt-0">
				<Collapsible open={isPreviewOpen} onOpenChange={setIsPreviewOpen} className="w-full">
					<div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						{/* Folder Trigger (Left) */}
						<CollapsibleTrigger asChild>
							<Button variant="ghost" className="group gap-2 px-2 py-1 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground">
								{isPreviewOpen ? <FolderOpen className="h-4 w-4" /> : <FolderClosed className="h-4 w-4" />}
								{isPreviewOpen ? "Hide" : "Show"} Full Summary Preview
								{isPreviewOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
							</Button>
						</CollapsibleTrigger>

						{/* Action Buttons (Right) */}
						<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
							<Button variant="outline" size="sm" onClick={onCopy} className="w-full sm:w-auto">
								<Copy className="mr-2 h-4 w-4" /> Copy Summary
							</Button>
							<Button size="sm" onClick={onDownload} className="w-full sm:w-auto">
								<Download className="mr-2 h-4 w-4" /> Download Summary
							</Button>
						</div>
					</div>

					{/* Expandable Content */}
					<CollapsibleContent className="mt-4 w-full">
						<pre className="max-h-60 w-full overflow-auto rounded-md border bg-muted p-4 text-xs font-mono dark:bg-neutral-800/60">
							{generateSummaryText()}
						</pre>
					</CollapsibleContent>
				</Collapsible>
			</CardFooter>
		</Card>
	);
}