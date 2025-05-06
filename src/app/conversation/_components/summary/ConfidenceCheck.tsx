// src/app/conversation/_components/summary/ConfidenceCheck.tsx
"use client";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { type ConfidenceCheckItemData } from "../../types";
interface ConfidenceCheckProps {
	items: ConfidenceCheckItemData[];
	checks: Record<string, boolean>;
	onToggle: (itemId: string) => void;
}

export function ConfidenceCheck({ items, checks, onToggle }: ConfidenceCheckProps) {
	return (
		<div>
			<h3 className="mb-3 text-lg font-semibold text-foreground">Final Confidence Check</h3>
			<div className="space-y-2 rounded-md border bg-amber-500/10 p-4 dark:bg-amber-900/20">
				{items.map(item => (
					<div key={item.id} className="flex items-center space-x-2">
						<Checkbox
							id={`confidence-${item.id}`}
							checked={checks[item.id] || false}
							onCheckedChange={() => onToggle(item.id)}
						/>
						<Label htmlFor={`confidence-${item.id}`} className="text-sm font-normal text-amber-700 dark:text-amber-300">
							{item.text}
						</Label>
					</div>
				))}
			</div>
		</div>
	);
}