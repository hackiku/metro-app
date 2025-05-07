// src/components/dev/DataEditor.tsx - Tabs issue fixed
"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Save, RotateCcw, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { CopyJsonButton } from "./CopyJsonButton";
import { DataCardEditor } from "./DataCardEditor";
import { JsonEditor } from "./JsonEditor";

interface DataEditorProps {
	data?: Record<string, any>;
	title: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: (updatedData: any) => void;
	saveToApi?: boolean;
	entityType?: string;
}

export function DataEditor({
	data = {}, // Provide default empty object
	title,
	open,
	onOpenChange,
	onSave,
	saveToApi = true,
	entityType
}: DataEditorProps) {
	const [editedData, setEditedData] = useState<Record<string, any>>(data || {});
	const [activeTab, setActiveTab] = useState<string>("card");
	const [hasChanges, setHasChanges] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// tRPC utils for cache invalidation and mutations
	const utils = api.useUtils();

	// Reset edited data when the input data changes or dialog opens
	useEffect(() => {
		if (open) {
			setEditedData(data || {});
			setHasChanges(false);
		}
	}, [data, open]);

	// Handle field change from card editor
	const handleFieldChange = (fieldPath: string[], value: any) => {
		setEditedData(prev => {
			// Create a deep copy of the previous state
			const newState = JSON.parse(JSON.stringify(prev));

			// Navigate to the nested field
			let target = newState;
			for (let i = 0; i < fieldPath.length - 1; i++) {
				if (target[fieldPath[i]] === undefined) {
					target[fieldPath[i]] = {};
				}
				target = target[fieldPath[i]];
			}

			// Set the value at the final path
			const lastKey = fieldPath[fieldPath.length - 1];
			target[lastKey] = value;

			return newState;
		});

		setHasChanges(true);
	};

	// Handle JSON editor change (for the whole object)
	const handleJsonChange = (json: Record<string, any>) => {
		setEditedData(json);
		setHasChanges(true);
	};

	// Reset changes
	const handleReset = () => {
		setEditedData(data || {});
		setHasChanges(false);
	};

	// Save changes
	const handleSave = async () => {
		if (!hasChanges) return;

		try {
			setIsUpdating(true);

			if (saveToApi && entityType && editedData.id) {
				// Based on entity type, call the appropriate API
				switch (entityType) {
					case "user":
						await api.user.update.mutate({
							id: editedData.id,
							...editedData
						});
						utils.user.getAll.invalidate();
						utils.user.getById.invalidate({ id: editedData.id });
						break;

					case "position":
						await api.position.update.mutate({
							id: editedData.id,
							...editedData
						});
						utils.position.getAll.invalidate();
						break;

					case "competence":
						await api.competence.update.mutate({
							id: editedData.id,
							...editedData
						});
						utils.competence.getAll.invalidate();
						break;

					case "career_path":
						await api.career.updatePath.mutate({
							id: editedData.id,
							...editedData
						});
						utils.career.getPaths.invalidate();
						break;

					// Add more entity types as needed

					default:
						console.warn(`No API handler for entity type: ${entityType}`);
						// Fall back to custom save handler
						if (onSave) {
							onSave(editedData);
						}
				}
			} else if (onSave) {
				// Use custom save handler if provided
				onSave(editedData);
			}

			toast.success("Changes saved successfully");
			setHasChanges(false);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to save changes:", error);
			toast.error("Failed to save changes");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleClose = () => {
		// Confirm if there are unsaved changes
		if (hasChanges) {
			if (confirm("You have unsaved changes. Are you sure you want to close?")) {
				onOpenChange(false);
			}
		} else {
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl h-[80vh] max-h-[80vh] flex flex-col">
				<DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<div className="flex items-center gap-2">
						<DialogTitle>{title}</DialogTitle>
						<CopyJsonButton jsonData={editedData} tooltipText="Copy data as JSON" />
					</div>
					<div className="flex items-center gap-1">
						{hasChanges && (
							<AlertOctagon className="h-4 w-4 text-amber-500" />
						)}
						{/* Tabs component wrapping all TabsContent elements */}
						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
							<TabsList>
								<TabsTrigger value="card">Card View</TabsTrigger>
								<TabsTrigger value="json">JSON View</TabsTrigger>
							</TabsList>

							{/* Move the content inside the Tabs component */}
							<div className="mt-2 flex-1 overflow-auto border rounded-md p-1">
								<TabsContent value="card" className="h-full m-0 p-2 data-[state=active]:block">
									<DataCardEditor
										data={editedData}
										onFieldChange={handleFieldChange}
										entityType={entityType}
									/>
								</TabsContent>

								<TabsContent value="json" className="h-full m-0 p-2 data-[state=active]:block">
									<JsonEditor
										data={editedData}
										onChange={handleJsonChange}
									/>
								</TabsContent>
							</div>
						</Tabs>
					</div>
				</DialogHeader>

				<DialogFooter className="flex justify-between items-center pt-2">
					<div className="text-xs text-muted-foreground">
						{entityType && <span className="font-mono">Entity: {entityType}</span>}
						{editedData && editedData.id && <span className="ml-2 font-mono">ID: {editedData.id}</span>}
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleReset}
							disabled={!hasChanges || isUpdating}
						>
							<RotateCcw className="mr-2 h-3.5 w-3.5" />
							Reset
						</Button>

						<Button
							variant="default"
							size="sm"
							onClick={handleSave}
							disabled={!hasChanges || isUpdating}
						>
							{isUpdating ? (
								<div className="h-3.5 w-3.5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
							) : (
								<Save className="mr-2 h-3.5 w-3.5" />
							)}
							Save Changes
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}