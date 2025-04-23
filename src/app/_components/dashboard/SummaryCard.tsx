// src/app/_components/dashboard/SummaryCard.tsx
"use client";

import { Card } from "~/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon: LucideIcon;
	isLoading?: boolean;
	trend?: {
		value: string | number;
		positive?: boolean;
	};
}

export function SummaryCard({
	title,
	value,
	description,
	icon: Icon,
	isLoading = false,
	trend
}: SummaryCardProps) {
	if (isLoading) {
		return (
			<Card className="p-6">
				<div className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
					<div className="h-4 w-4 animate-pulse rounded-md bg-muted" />
				</div>
				<div className="h-8 w-16 animate-pulse rounded-md bg-muted my-2" />
				{description && (
					<div className="h-3 w-32 animate-pulse rounded-md bg-muted mt-2" />
				)}
			</Card>
		);
	}

	return (
		<Card className="p-6">
			<div className="flex flex-row items-center justify-between space-y-0 pb-2">
				<h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</div>
			<div className="text-2xl font-bold">{value}</div>
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
			{trend && (
				<p className={`text-xs mt-2 ${trend.positive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
					{trend.positive ? '↑ ' : '↓ '}{trend.value}
				</p>
			)}
		</Card>
	);
}