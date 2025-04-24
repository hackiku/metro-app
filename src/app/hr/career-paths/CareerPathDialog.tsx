// src/app/hr/career-paths/CareerPathDialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { CareerPathForm } from "./CareerPathForm";

interface CareerPathDialogProps {
	open: boolean;
	mode: "create" | "edit";
	pathId?: string;
	onOpenChange: (open: boolean) => void;
	onComplete: () => void;
}

export function CareerPathDialog({
	open,
	mode,
	pathId,
	onOpenChange,
	onComplete
}: CareerPathDialogProps) {
	const title = mode === "create" ? "Create Career Path" : "Edit Career Path";
	const description = mode === "create"
		? "Add a new career path to your organization"
		: "Update career path details";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{(mode === "create" || (mode === "edit" && pathId)) && (
					<CareerPathForm
						pathId={pathId}
						onComplete={onComplete}
						mode={mode}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}