// src/components/dev/cards/DataCard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Save, RotateCcw, Edit, Eye } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { CopyJsonButton } from "../buttons/CopyJsonButton";

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
	const [editedData, setEditedData] = useState<Record<string, any>>({ ...data });

	// Handle field change
	const handleFieldChange = (field: string, value: any) => {
		setEditedData(prev => ({
			...prev,
			[field]: value
		}));
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
		setEditedData({ ...data });
		setHasChanges(false);
	};

	// Format field name for display
	const formatFieldName = (field: string) => {
		return field
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	// Render field based on its type
	const renderField = (field: string) => {
		const value = editedData[field];

		if (isEditing) {
			if (typeof value === 'boolean') {
				return (
					<select
						value={value ? 'true' : 'false'}
						onChange={(e) => handleFieldChange(field, e.target.value === 'true')}
						className="p-2 bg-muted/30 rounded-md text-sm w-full"
					>
						<option value="true">True</option>
						<option value="false">False</option>
					</select>
				);
			}

			if (typeof value === 'number') {
				return (
					<Input
						type="number"
						value={value}
						onChange={(e) => handleFieldChange(field, Number(e.target.value))}
						className="h-8 text-sm"
					/>
				);
			}

			return (
				<Input
					value={value !== null && value !== undefined ? String(value) : ''}
					onChange={(e) => handleFieldChange(field, e.target.value)}
					className="h-8 text-sm"
				/>
			);
		}

		return (
			<div className="p-2 bg-muted/30 rounded-md text-sm break-all">
				{value === null || value === undefined ? (
					<span className="text-muted-foreground italic">null</span>
				) : typeof value === 'object' ? (
					JSON.stringify(value)
				) : (
					String(value)
				)}
			</div>
		);
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
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setIsEditing(!isEditing)}
					>
						{isEditing ? (
							<Eye className="h-4 w-4" />
						) : (
							<Edit className="h-4 w-4" />
						)}
					</Button>
				</div>
			</CardHeader>

			<CardContent className="p-3">
				<div className="space-y-2">
					{fields.map(field => (
						<div key={field} className="space-y-1">
							<Label className="text-xs font-medium text-muted-foreground">
								{formatFieldName(field)}
							</Label>
							{renderField(field)}
						</div>
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