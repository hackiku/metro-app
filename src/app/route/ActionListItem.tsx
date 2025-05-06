// src/app/route/ActionListItem.tsx
"use client";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox"; // Using Checkbox for a more interactive feel
import { CheckCircle2, Circle, Zap, PlayCircle } from "lucide-react"; // Added PlayCircle for "Start"
import { type ActionItem } from "./data";
import { cn } from "~/lib/utils";

interface ActionListItemProps {
	action: ActionItem;
	onToggleStatus: (actionId: string, newStatus: ActionItem['status']) => void;
}

export function ActionListItem({ action, onToggleStatus }: ActionListItemProps) {
	const handleStart = () => {
		if (action.status === 'todo') {
			onToggleStatus(action.id, 'in-progress');
		}
		// Potentially navigate or open a modal
		console.log("Start action:", action.title);
	};

	const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
		if (checked === true) {
			onToggleStatus(action.id, 'completed');
		} else if (action.status === 'completed') { // Unchecking a completed item
			onToggleStatus(action.id, 'todo');
		}
	};

	const Icon = action.status === 'completed' ? CheckCircle2 : Circle;
	const iconColor = action.status === 'completed' ? "text-green-500" : "text-muted-foreground";

	return (
		<div className={cn(
			"flex items-start gap-3 rounded-md border bg-card p-3 transition-all",
			action.status === 'completed' && "bg-green-500/10 border-green-500/30",
			action.status === 'in-progress' && "border-blue-500/30" // Example: visual cue for in-progress
		)}>
			{/* Using Checkbox for better UX if actions are truly completable */}
			<Checkbox
				id={`action-${action.id}`}
				checked={action.status === 'completed'}
				onCheckedChange={handleCheckboxChange}
				className="mt-1 h-5 w-5 flex-shrink-0 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
			/>
			{/* Or using simple icon if checkbox is too much: */}
			{/* <Icon className={cn("mt-1 h-5 w-5 flex-shrink-0", iconColor)} /> */}

			<div className="flex-1">
				<label htmlFor={`action-${action.id}`} className={cn("text-sm font-medium text-foreground", action.status === 'completed' && "line-through text-muted-foreground")}>
					{action.title}
				</label>
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