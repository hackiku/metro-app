// src/components/dev/cards/DataCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { EditableField } from "./EditableField";
import { EditToggleButton } from "../buttons/EditToggleButton";
import { CopyJsonButton } from "../buttons/CopyJsonButton";
import { Button } from "~/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

interface DataCardProps {
	title: string;
	data: Record<string, any>;
	fields: string[];
	onChange: (field: string, value: any) => void;
	onSave: () => Promise<void>;
	category?: string;
	loading?: boolean;
}

export function DataCard({
	title,
	data,
	fields,
	onChange,
	onSave,
	category = "primary",
	loading = false
}: DataCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Handle field change
	const handleFieldChange = (field: string, value: any) => {
		onChange(field, value);
		setHasChanges(true);
	};

	// Handle save
	const handleSave = async () => {
		if (!hasChanges) return;

		setIsSaving(true);
		try {
			await onSave();
			setHasChanges(false);
			toast.success(`${title} updated successfully`);
		} catch (error) {
			toast.error(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsSaving(false);
		}
	};

	// Handle reset
	const handleReset = () => {
		// This will trigger a re-render with original data
		window.location.reload();
		setHasChanges(false);
	};

	// Get background color based on category
	const getCategoryColor = () => {
		switch (category) {
			case "primary":
				return "bg-primary/5";
			case "details":
				return "bg-blue-500/5";
			case "relations":
				return "bg-amber-500/5";
			case "metadata":
				return "bg-slate-500/5";
			default:
				return "bg-gray-500/5";
		}
	};

	return (
		<Card className="overflow-hidden transition-all hover:shadow-md">
			<CardHeader className={`flex flex-row items-center justify-between p-3 ${getCategoryColor()}`}>
				<CardTitle className="text-md font-medium">{title}</CardTitle>
				<div className="flex items-center gap-1">
					<CopyJsonButton
						jsonData={Object.fromEntries(
							fields.map(field => [field, data[field]])
						)}
						tooltipText={`Copy ${title} as JSON`}
					/>
					<EditToggleButton isEditing={isEditing} onChange={setIsEditing} />
				</div>
			</CardHeader>

			<CardContent className="p-3">
				<div className="space-y-2">
					{fields.map(field => (
						<EditableField
							key={field}
							field={field}
							value={data[field]}
							isEditing={isEditing}
							onChange={(value) => handleFieldChange(field, value)}
						/>
					))}

					{fields.length === 0 && (
						<div className="text-sm text-muted-foreground italic">No fields to display</div>
					)}
				</div>
			</CardContent>

			{hasChanges && (
				<CardFooter className="flex justify-end gap-2 py-2 px-3 bg-muted/30">
					<Button
						variant="outline"
						size="sm"
						className="h-7 px-2"
						onClick={handleReset}
						disabled={isSaving}
					>
						<RotateCcw className="mr-1 h-3.5 w-3.5" />
						Reset
					</Button>
					<Button
						variant="default"
						size="sm"
						className="h-7 px-2"
						onClick={handleSave}
						disabled={isSaving}
					>
						{isSaving ? (
							<div className="h-3.5 w-3.5 border-2 border-t-transparent border-white rounded-full animate-spin mr-1" />
						) : (
							<Save className="mr-1 h-3.5 w-3.5" />
						)}
						Save
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}

