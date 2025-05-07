// src/components/dev/DataCardEditor.tsx
"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter
} from "~/components/ui/card";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "~/components/ui/accordion";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Edit, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CopyJsonButton } from "./CopyJsonButton";

interface DataCardEditorProps {
	data: Record<string, any>;
	onFieldChange: (path: string[], value: any) => void;
	entityType?: string;
}

type FieldConfig = {
	type: 'string' | 'number' | 'boolean' | 'select' | 'textarea' | 'object' | 'array';
	label?: string;
	options?: string[];
	editable?: boolean;
};

export function DataCardEditor({ data, onFieldChange, entityType }: DataCardEditorProps) {
	const [editableFields, setEditableFields] = useState<Record<string, boolean>>({});

	// Toggle editable state for a field
	const toggleEditable = (path: string) => {
		setEditableFields(prev => ({
			...prev,
			[path]: !prev[path]
		}));
	};

	// Get field configuration based on entity type and field name
	const getFieldConfig = (path: string[], key: string, value: any): FieldConfig => {
		const fullPath = [...path, key].join('.');

		// Default configuration based on value type
		let config: FieldConfig = {
			type: 'string',
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

		// Specific field configurations based on common field names
		if (key === 'id' || key.endsWith('_id') || key === 'created_at' || key === 'updated_at') {
			config.editable = false;
		}

		// Long text fields should use textarea
		if (typeof value === 'string' && value.length > 100) {
			config.type = 'textarea';
		}

		// Field-specific configurations
		if (key === 'description' || key.includes('description')) {
			config.type = 'textarea';
		}

		if (key === 'status') {
			config.type = 'select';
			// Common status options
			config.options = ['active', 'inactive', 'pending', 'completed', 'archived'];
		}

		if (key === 'level' && typeof value === 'number') {
			config.type = 'select';
			config.options = ['1', '2', '3', '4', '5'];
		}

		if (key === 'color' && typeof value === 'string') {
			config.type = 'string';
			// Add color picker in the future
		}

		// Entity-specific configurations
		if (entityType === 'user') {
			if (key === 'role') {
				config.type = 'select';
				config.options = ['employee', 'manager', 'admin'];
			}

			if (key === 'level' && typeof value === 'string') {
				config.type = 'select';
				config.options = ['Junior', 'Medior', 'Senior', 'Lead'];
			}
		}

		return config;
	};

	// Render an input field based on type and configuration
	const renderInputField = (path: string[], key: string, value: any) => {
		const fullPath = [...path, key].join('.');
		const isEditable = editableFields[fullPath] === true;
		const config = getFieldConfig(path, key, value);

		// If object or array type, render nested fields instead
		if (config.type === 'object' && value !== null) {
			return renderObjectFields(path, key, value);
		}

		if (config.type === 'array') {
			return renderArrayFields(path, key, value);
		}

		// Render appropriate input based on field configuration
		return (
			<div key={fullPath} className="flex items-start space-x-2 mb-2">
				<div className="flex-1">
					<div className="flex items-center mb-1">
						<Label className="text-xs font-medium text-muted-foreground">
							{config.label || key.replace(/_/g, ' ')}
						</Label>
						{value !== null && typeof value !== 'undefined' && (
							<Badge variant="outline" className="ml-2 text-xs">
								{typeof value}
							</Badge>
						)}
					</div>

					{isEditable ? (
						<>
							{config.type === 'string' && (
								<Input
									value={value || ''}
									onChange={(e) => onFieldChange([...path, key], e.target.value)}
									className="h-8 text-sm"
								/>
							)}

							{config.type === 'number' && (
								<Input
									type="number"
									value={value || 0}
									onChange={(e) => onFieldChange([...path, key], parseFloat(e.target.value))}
									className="h-8 text-sm w-32"
								/>
							)}

							{config.type === 'boolean' && (
								<Switch
									checked={Boolean(value)}
									onCheckedChange={(checked) => onFieldChange([...path, key], checked)}
								/>
							)}

							{config.type === 'textarea' && (
								<Textarea
									value={value || ''}
									onChange={(e) => onFieldChange([...path, key], e.target.value)}
									className="text-sm min-h-[80px]"
								/>
							)}

							{config.type === 'select' && config.options && (
								<Select
									value={String(value)}
									onValueChange={(val) => {
										// Convert to number if the original value was a number
										const newValue = typeof value === 'number' ? parseFloat(val) : val;
										onFieldChange([...path, key], newValue);
									}}
								>
									<SelectTrigger className="w-full h-8 text-sm">
										<SelectValue placeholder="Select" />
									</SelectTrigger>
									<SelectContent>
										{config.options.map((option) => (
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
							{value === null || value === undefined ? (
								<span className="text-muted-foreground italic">null</span>
							) : typeof value === 'boolean' ? (
								value ? 'true' : 'false'
							) : (
								String(value)
							)}
						</div>
					)}
				</div>

				{config.editable && (
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 mt-6"
						onClick={() => toggleEditable(fullPath)}
					>
						{isEditable ? (
							<EyeOff className="h-4 w-4" />
						) : (
							<Edit className="h-4 w-4" />
						)}
					</Button>
				)}
			</div>
		);
	};

	// Render fields for an object
	const renderObjectFields = (parentPath: string[], key: string, obj: Record<string, any>) => {
		const currentPath = [...parentPath, key];
		const pathString = currentPath.join('.');

		if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
			return renderInputField(parentPath, key, obj);
		}

		// Handle special cases like nested objects with name/id fields
		const hasNameField = obj.name !== undefined;
		const hasIdField = obj.id !== undefined;
		const isSimpleObject = Object.keys(obj).length <= 3 && (hasNameField || hasIdField);

		if (isSimpleObject) {
			// Render a simplified version for foreign key references
			return (
				<div key={pathString} className="mb-3">
					<Label className="text-xs font-medium mb-1 text-muted-foreground">
						{key.replace(/_/g, ' ')}
						{hasIdField && (
							<Badge variant="outline" className="ml-2 text-xs">reference</Badge>
						)}
					</Label>
					<div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md text-sm">
						{hasNameField && (
							<span className="font-medium">{obj.name}</span>
						)}
						{hasIdField && (
							<span className="text-xs text-muted-foreground font-mono truncate">
								{obj.id}
							</span>
						)}
						<CopyJsonButton jsonData={obj} tooltipText="Copy object" />
					</div>
				</div>
			);
		}

		// For more complex objects, use an accordion
		return (
			<Accordion
				type="single"
				collapsible
				className="w-full mb-2"
				key={pathString}
			>
				<AccordionItem value={pathString} className="border rounded-md">
					<AccordionTrigger className="px-3 py-1 text-sm hover:no-underline">
						<div className="flex items-center">
							<span className="font-medium">{key.replace(/_/g, ' ')}</span>
							<Badge variant="outline" className="ml-2 text-xs">object</Badge>
							{Object.keys(obj).length > 0 && (
								<Badge variant="outline" className="ml-1 text-xs">
									{Object.keys(obj).length} fields
								</Badge>
							)}
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-3 py-2">
						{Object.entries(obj).map(([nestedKey, nestedValue]) => (
							renderInputField(currentPath, nestedKey, nestedValue)
						))}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		);
	};

	// Render fields for an array
	const renderArrayFields = (parentPath: string[], key: string, array: any[]) => {
		const currentPath = [...parentPath, key];
		const pathString = currentPath.join('.');

		return (
			<Accordion
				type="single"
				collapsible
				className="w-full mb-2"
				key={pathString}
			>
				<AccordionItem value={pathString} className="border rounded-md">
					<AccordionTrigger className="px-3 py-1 text-sm hover:no-underline">
						<div className="flex items-center">
							<span className="font-medium">{key.replace(/_/g, ' ')}</span>
							<Badge variant="outline" className="ml-2 text-xs">array</Badge>
							<Badge variant="outline" className="ml-1 text-xs">
								{array.length} items
							</Badge>
						</div>
					</AccordionTrigger>
					<AccordionContent className="px-3 py-2">
						{array.length === 0 ? (
							<div className="text-sm text-muted-foreground italic">Empty array</div>
						) : (
							array.map((item, index) => (
								<div key={`${pathString}-${index}`} className="mb-2 border-l-2 pl-3 py-1">
									<div className="flex items-center mb-1">
										<Badge variant="outline" className="text-xs">
											{index}
										</Badge>
									</div>
									{typeof item === 'object' && item !== null ? (
										Object.entries(item).map(([itemKey, itemValue]) => (
											renderInputField([...currentPath, index.toString()], itemKey, itemValue)
										))
									) : (
										renderInputField(currentPath, index.toString(), item)
									)}
								</div>
							))
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		);
	};

	// Group top-level fields into cards by category
	const renderFieldsInCards = () => {
		// Define categories and their fields
		const categories: Record<string, { title: string, fields: string[] }> = {
			primary: {
				title: "Primary Information",
				fields: ["id", "name", "title", "description"]
			},
			details: {
				title: "Details",
				fields: ["level", "status", "role", "sequence_in_path", "path_specific_description"]
			},
			relations: {
				title: "Relations",
				fields: ["user_id", "organization_id", "position_id", "career_path_id", "competence_id", "target_position_details_id"]
			},
			metadata: {
				title: "Metadata",
				fields: ["created_at", "updated_at"]
			}
		};

		// Add fields to "other" category if they don't match any predefined category
		const otherFields = Object.keys(data).filter(key => {
			return !Object.values(categories).some(category =>
				category.fields.includes(key)
			);
		});

		if (otherFields.length > 0) {
			categories.other = {
				title: "Other Fields",
				fields: otherFields
			};
		}

		return (
			<div className="space-y-4">
				{Object.entries(categories).map(([categoryKey, category]) => {
					// Filter data keys that exist in this category
					const fieldsInCategory = category.fields.filter(field =>
						Object.keys(data).includes(field)
					);

					if (fieldsInCategory.length === 0) return null;

					return (
						<Card key={categoryKey} className="bg-card/50">
							<CardHeader className="px-4 py-2">
								<CardTitle className="text-md font-medium">{category.title}</CardTitle>
							</CardHeader>
							<CardContent className="px-4 py-2 space-y-1">
								{fieldsInCategory.map(field =>
									renderInputField([], field, data[field])
								)}
							</CardContent>
						</Card>
					);
				})}
			</div>
		);
	};

	return (
		<div className="space-y-4 overflow-y-auto">
			{renderFieldsInCards()}
		</div>
	);
}