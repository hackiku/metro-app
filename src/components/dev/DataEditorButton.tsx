// src/components/dev/DataEditorButton.tsx - Fixed version
"use client";

import { useState } from "react";
import { Database } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { DataEditor } from "./DataEditor";

interface DataEditorButtonProps {
	data?: Record<string, any>; // Make data optional
	title?: string;
	onSave?: (updatedData: any) => void;
	saveToApi?: boolean;
	entityType?: string;
}

export function DataEditorButton({
	data = {}, // Default to empty object
	title = "Data Editor",
	onSave,
	saveToApi = true,
	entityType
}: DataEditorButtonProps) {
	const [open, setOpen] = useState(false);

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
	};

	const handleSave = (updatedData: any) => {
		if (onSave) {
			onSave(updatedData);
		}

		// Close dialog after save
		setOpen(false);
	};

	return (
		<>
			<TooltipProvider delayDuration={100}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setOpen(true)}
							className="h-7 w-7 bg-primary/5 hover:bg-primary/10"
						>
							<Database className="h-4 w-4 text-primary" />
							<span className="sr-only">Open Data Editor</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Edit data (Developer Mode)</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<DataEditor
				data={data}
				title={title}
				open={open}
				onOpenChange={handleOpenChange}
				onSave={handleSave}
				saveToApi={saveToApi}
				entityType={entityType}
			/>
		</>
	);
}