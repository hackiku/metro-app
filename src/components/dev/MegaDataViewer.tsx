// src/components/dev/MegaDataViewer.tsx
"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CopyJsonButton } from "./CopyJsonButton";

interface MegaDataViewerProps {
	data: Record<string, any>;
	title: string;
	isOpen: boolean;
	onClose: () => void;
}

export function MegaDataViewer({ data, title, isOpen, onClose }: MegaDataViewerProps) {
	if (!isOpen) return null;

	// Group data by categories similar to DataCardEditor
	const categories: Record<string, { title: string; fields: string[] }> = {
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
			fields: ["user_id", "organization_id", "position_id", "career_path_id", "competence_id"]
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

	// Render field value based on type
	const renderFieldValue = (value: any) => {
		if (value === null || value === undefined) {
			return <span className="text-muted-foreground italic">null</span>;
		}

		if (typeof value === 'boolean') {
			return value ? 'true' : 'false';
		}

		if (typeof value === 'object') {
			if (Array.isArray(value)) {
				return (
					<div>
						<Badge variant="outline" className="mr-2">array ({value.length})</Badge>
						{value.length > 0 && <CopyJsonButton jsonData={value} tooltipText="Copy array" />}
					</div>
				);
			}

			// Object with name/id is likely a reference
			if (value.name && value.id) {
				return (
					<div className="flex items-center gap-2">
						<span className="font-medium">{value.name}</span>
						<span className="text-xs text-muted-foreground font-mono truncate">
							{value.id}
						</span>
						<CopyJsonButton jsonData={value} tooltipText="Copy object" />
					</div>
				);
			}

			return (
				<div className="flex items-center gap-2">
					<Badge variant="outline">object</Badge>
					<CopyJsonButton jsonData={value} tooltipText="Copy object" />
				</div>
			);
		}

		return String(value);
	};

	return (
		<div className="fixed inset-x-0 z-50 mt-2 border rounded-md shadow-lg bg-background" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
			<div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-semibold">{title}</h2>
					<CopyJsonButton jsonData={data} tooltipText="Copy all data" />
				</div>
				<button
					onClick={onClose}
					className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md"
				>
					Close
				</button>
			</div>

			<div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{Object.entries(categories).map(([categoryKey, category]) => {
					// Filter data keys that exist in this category
					const fieldsInCategory = category.fields.filter(field =>
						Object.keys(data).includes(field)
					);

					if (fieldsInCategory.length === 0) return null;

					return (
						<Card key={categoryKey} className="overflow-hidden">
							<CardHeader className="bg-primary/5 py-2 px-4">
								<CardTitle className="text-md font-medium">{category.title}</CardTitle>
							</CardHeader>
							<CardContent className="p-4">
								<div className="space-y-3">
									{fieldsInCategory.map(field => (
										<div key={field} className="space-y-1">
											<div className="flex items-center mb-1">
												<span className="text-xs font-medium text-muted-foreground">
													{field.replace(/_/g, ' ')}
												</span>
												{data[field] !== null && data[field] !== undefined && (
													<Badge variant="outline" className="ml-2 text-xs">
														{typeof data[field]}
													</Badge>
												)}
											</div>
											<div className="p-2 bg-muted/30 rounded-md text-sm break-all">
												{renderFieldValue(data[field])}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}