// src/app/route/PhaseStepItem.tsx
"use client";

import { cn } from "~/lib/utils";

interface PhaseStepItemProps {
	number: number;
	title: string;
	duration: string;
	isActive: boolean;
	isCompleted?: boolean; // Optional: if you want to show completed steps differently
	onClick: () => void;
}

export function PhaseStepItem({
	number,
	title,
	duration,
	isActive,
	isCompleted,
	onClick,
}: PhaseStepItemProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center text-center cursor-pointer group flex-shrink-0 px-3 py-2 md:px-4", // Added padding for touch targets
				isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
			)}
			onClick={onClick}
		>
			<div
				className={cn(
					"mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium md:h-12 md:w-12 md:text-base",
					isActive
						? "border-primary bg-primary text-primary-foreground"
						: isCompleted
							? "border-green-500 bg-green-500 text-white" // Example completed style
							: "border-primary bg-card text-primary group-hover:bg-primary/10"
				)}
			>
				{number}
			</div>
			<p className="whitespace-nowrap text-xs font-medium text-foreground md:text-sm">
				{title}
			</p>
			<p className="whitespace-nowrap text-xs text-muted-foreground">
				{duration}
			</p>
		</div>
	);
}