// src/app/route/ActionListItem.tsx
"use client";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { CheckCircle2, Circle, Zap, PlayCircle } from "lucide-react";
// Remove import of local type: import { type ActionItem } from "./data"; // Or from ./types
import type { PlanAction } from "~/contexts/CareerPlanContext"; // Import the type from the context
import { cn } from "~/lib/utils";

interface ActionListItemProps {
	// Use the type from the context
	action: PlanAction;
	// Define the possible statuses based on the PlanAction type in the context
	onToggleStatus: (actionId: string, newStatus: 'todo' | 'in-progress' | 'completed') => void;
}

export function ActionListItem({ action, onToggleStatus }: ActionListItemProps) {
	const handleStart = () => {
		// Use the status values defined in PlanAction type
		if (action.status === 'todo') {
			onToggleStatus(action.id, 'in-progress');
		}
		console.log("Start action:", action.title);
	};

	const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
		if (checked === true) {
			onToggleStatus(action.id, 'completed');
		} else if (action.status === 'completed') {
			onToggleStatus(action.id, 'todo');
		}
	};

	// Logic remains the same, relies on action.status which exists on PlanAction
	const Icon = action.status === 'completed' ? CheckCircle2 : Circle;
	const iconColor = action.status === 'completed' ? "text-green-500" : "text-muted-foreground";

	return (
		<div className={cn(
			"flex items-start gap-3 rounded-md border bg-card p-3 transition-all",
			action.status === 'completed' && "bg-green-500/10 border-green-500/30",
			action.status === 'in-progress' && "border-blue-500/30"
		)}>
			<Checkbox
				id={`action-${action.id}`}
				checked={action.status === 'completed'}
				onCheckedChange={handleCheckboxChange}
				className="mt-1 h-5 w-5 flex-shrink-0 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
			/>
			<div className="flex-1">
				{/* Access action.title (exists on PlanAction) */}
				<label htmlFor={`action-${action.id}`} className={cn("text-sm font-medium text-foreground", action.status === 'completed' && "line-through text-muted-foreground")}>
					{action.title}
				</label>
				{/* Access action.category (exists on PlanAction) */}
				<p className="text-xs text-muted-foreground">{action.category}</p>
			</div>
			{action.status !== 'completed' && (
				<Button
					variant={action.status === 'in-progress' ? "default" : "outline"}
					size="sm"
					onClick={handleStart}
					className={cn(action.status === 'in-progress' && "bg-blue-600 hover:bg-blue-700 text-white")}
				>
					{action.status === 'in-progress' ? <Zap className="mr-1.5 h-3.5 w-3.5" /> : <PlayCircle className="mr-1.5 h-3.5 w-3.5" />}
					{action.status === 'in-progress' ? "In Progress" : "Start"}
				</Button>
			)}
		</div>
	);
}