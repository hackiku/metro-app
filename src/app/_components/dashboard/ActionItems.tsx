// src/app/_components/dashboard/ActionItems.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle, PlusCircle, BookOpen, ArrowRight } from "lucide-react";

interface ActionItem {
	id: string;
	title: string;
	description: string;
	status: 'not_started' | 'in_progress' | 'completed';
	dueDate?: string;
}

interface ActionItemsProps {
	items: ActionItem[];
	isLoading?: boolean;
}

export function ActionItems({ items, isLoading = false }: ActionItemsProps) {
	if (isLoading) {
		return (
			<Card className="p-6">
				<CardHeader className="px-0 pt-0">
					<CardTitle className="text-xl font-semibold">Development Actions</CardTitle>
				</CardHeader>
				<CardContent className="px-0 pb-0">
					<div className="space-y-4">
						{[1, 2, 3].map((n) => (
							<div key={n} className="h-20 animate-pulse rounded-md bg-muted" />
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Calculate counts by status
	const counts = {
		not_started: items.filter(item => item.status === 'not_started').length,
		in_progress: items.filter(item => item.status === 'in_progress').length,
		completed: items.filter(item => item.status === 'completed').length,
	};

	// Take only the first 3 non-completed items for the preview
	const activeItems = items
		.filter(item => item.status !== 'completed')
		.slice(0, 3);

	return (
		<Card className="p-6">
			<CardHeader className="px-0 pt-0">
				<div className="flex items-center justify-between">
					<CardTitle className="text-xl font-semibold">Development Actions</CardTitle>
					<div className="flex items-center gap-1 text-sm text-muted-foreground">
						<CheckCircle className="h-4 w-4 text-green-500" />
						<span>{counts.completed} completed</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="px-0 pb-0">
				<p className="text-sm text-muted-foreground mb-4">
					{counts.in_progress} in progress, {counts.not_started} to start
				</p>

				<div className="space-y-4 mb-6">
					{activeItems.length > 0 ? (
						activeItems.map((item) => (
							<div key={item.id} className="rounded-md border p-3">
								<div className="flex items-start justify-between">
									<div>
										<h4 className="font-medium">{item.title}</h4>
										<p className="text-xs text-muted-foreground mt-1">{item.description}</p>
									</div>
									<div>
										<span className={`text-xs px-2 py-1 rounded-full ${item.status === 'in_progress'
												? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
												: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300'
											}`}>
											{item.status === 'in_progress' ? 'In Progress' : 'Not Started'}
										</span>
									</div>
								</div>
								{item.dueDate && (
									<p className="text-xs text-muted-foreground mt-2">Due: {item.dueDate}</p>
								)}
							</div>
						))
					) : (
						<div className="flex flex-col items-center justify-center py-6 text-center">
							<PlusCircle className="h-12 w-12 text-muted-foreground mb-2" />
							<p className="text-muted-foreground">No active development items</p>
						</div>
					)}
				</div>

				<div className="flex justify-between">
					<Button variant="outline" size="sm">
						<PlusCircle className="mr-2 h-4 w-4" />
						Add Item
					</Button>
					<Button size="sm" asChild>
						<a href="/development">
							<BookOpen className="mr-2 h-4 w-4" />
							View All
						</a>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}