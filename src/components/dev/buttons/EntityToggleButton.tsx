// src/components/dev/buttons/EditToggleButton.tsx
"use client";

import { Button } from "~/components/ui/button";
import { Edit, EyeOff } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

interface EditToggleButtonProps {
	isEditing: boolean;
	onChange: (isEditing: boolean) => void;
}

export function EditToggleButton({ isEditing, onChange }: EditToggleButtonProps) {
	return (
		<TooltipProvider delayDuration={300}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => onChange(!isEditing)}
					>
						{isEditing ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Edit className="h-4 w-4" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{isEditing ? 'Exit edit mode' : 'Edit fields'}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}