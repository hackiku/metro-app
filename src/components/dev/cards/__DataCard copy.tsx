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

// src/components/dev/cards/EditableField.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

interface EditableFieldProps {
	field: string;
	value: any;
	isEditing: boolean;
	onChange: (value: any) => void;
}

export function EditableField({ field, value, isEditing, onChange }: EditableFieldProps) {
	const [fieldConfig, setFieldConfig] = useState<{
		type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'object' | 'array';
		options?: string[];
		editable: boolean;
	}>({
		type: 'string',
		editable: true
	});

	// Determine field configuration based on field name and value
	useEffect(() => {
		let config = {
			type: 'string' as const,
			editable: true
		};

		// Determine type based on value
		if (typeof value === 'number') {
			config.type = 'number';
		} else if (typeof value === 'boolean') {
			config.type = 'boolean';
		} else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			config.type = 'object';
		} else if (Array.isArray(value)) {
			config.type = 'array';
		}

		// Specific field configurations
		if (field === 'id' || field.endsWith('_id') || field === 'created_at' || field === 'updated_at') {
			config.editable = false;
		}

		// Long text fields should use textarea
		if (typeof value === 'string' && value.length > 100) {
			config.type = 'textarea';
		}

		// Field-specific configurations
		if (field === 'description' || field.includes('description')) {
			config.type = 'textarea';
		}

		if (field === 'status') {
			config.type = 'select';
			config = {
				...config,
				options: ['active', 'inactive', 'pending', 'completed', 'archived']
			};
		}

		if (field === 'level' && typeof value === 'string') {
			config.type = 'select';
			config = {
				...config,
				options: ['Junior', 'Medior', 'Senior', 'Lead']
			};
		}

		if (field === 'level' && typeof value === 'number') {
			config.type = 'select';
			config = {
				...config,
				options: ['1', '2', '3', '4', '5']
			};
		}

		setFieldConfig(config);
	}, [field, value]);

	// Format field label from snake_case to Title Case
	const getFieldLabel = (field: string) => {
		return field
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	};

	// Render complex objects
	const renderObjectValue = (value: any) => {
		if (value === null || value === undefined) {
			return <span className="text-muted-foreground italic">null</span>;
		}

		if (typeof value === 'object') {
			if (Array.isArray(value)) {
				return <Badge variant="outline">{value.length} items</Badge>;
			}

			// Object with name property is likely a reference
			if (value.name) {
				return (
					<div className="flex flex-col">
						<span className="font-medium">{value.name}</span>
						{value.id && (
							<span className="text-xs text-muted-foreground font-mono truncate">
								{value.id}
							</span>
						)}
					</div>
				);
			}

			return <Badge variant="outline">Object</Badge>;
		}

		return String(value);
	};

	return (
		<div className="space-y-1">
			<div className="flex items-center">
				<Label className="text-xs font-medium text-muted-foreground">
					{getFieldLabel(field)}
				</Label>
				{value !== null && value !== undefined && (
					<Badge variant="outline" className="ml-2 text-xs">
						{typeof value}
					</Badge>
				)}
			</div>

			{isEditing && fieldConfig.editable ? (
				<>
					{fieldConfig.type === 'string' && (
						<Input
							value={value || ''}
							onChange={(e) => onChange(e.target.value)}
							className="h-8 text-sm"
						/>
					)}

					{fieldConfig.type === 'number' && (
						<Input
							type="number"
							value={value || 0}
							onChange={(e) => onChange(parseFloat(e.target.value))}
							className="h-8 text-sm w-32"
						/>
					)}

					{fieldConfig.type === 'boolean' && (
						<Switch
							checked={Boolean(value)}
							onCheckedChange={(checked) => onChange(checked)}
						/>
					)}

					{fieldConfig.type === 'textarea' && (
						<Textarea
							value={value || ''}
							onChange={(e) => onChange(e.target.value)}
							className="text-sm min-h-[80px]"
						/>
					)}

					{fieldConfig.type === 'select' && fieldConfig.options && (
						<Select
							value={String(value)}
							onValueChange={(val) => {
								// Convert to number if the original value was a number
								const newValue = typeof value === 'number' ? parseFloat(val) : val;
								onChange(newValue);
							}}
						>
							<SelectTrigger className="w-full h-8 text-sm">
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								{fieldConfig.options.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</>
			) : (
				<div className="p-2 bg-muted/30 rounded-md text-sm break-all">
					{(fieldConfig.type === 'object' || fieldConfig.type === 'array')
						? renderObjectValue(value)
						: (value === null || value === undefined
							? <span className="text-muted-foreground italic">null</span>
							: String(value)
						)
					}
				</div>
			)}
		</div>
	);
}

