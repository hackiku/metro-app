// src/app/hr/positions/PositionDialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { PositionForm } from "./PositionForm";

interface PositionDialogProps {
	open: boolean;
	mode: "create" | "edit";
	positionId?: string;
	onOpenChange: (open: boolean) => void;
	onComplete: () => void;
}

export function PositionDialog({
	open,
	mode,
	positionId,
	onOpenChange,
	onComplete
}: PositionDialogProps) {
	const title = mode === "create" ? "Create Position" : "Edit Position";
	const description = mode === "create"
		? "Add a new generic position title"
		: "Update position details";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				{(mode === "create" || (mode === "edit" && positionId)) && (
					<PositionForm
						positionId={positionId}
						onComplete={onComplete}
						mode={mode}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}