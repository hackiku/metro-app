// src/components/dev/editors/DataEditor.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, AlertOctagon, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { CopyJsonButton } from "../buttons/CopyJsonButton";
import { DataCardEditor } from "./DataCardEditor";
import { JsonEditor } from "./JsonEditor";
import { EditorTabs } from "./EditorTabs";

interface DataEditorProps {
	data?: Record<string, any>;
	title: string;
	onSave?: (updatedData: any) => void;
	saveToApi?: boolean;
	entityType?: string;
	onClose?: () => void;
}

export function DataEditor({
	data = {},
	title,
	onSave,
	saveToApi = true,
	entityType,
	onClose
}: DataEditorProps) {
	const [editedData, setEditedData] = useState<Record<string, any>>(data || {});
	const [activeTab, setActiveTab] = useState<string>("card");
	const [hasChanges, setHasChanges] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// tRPC utils for cache invalidation and mutations
	const utils = api.useUtils();

	// Reset edited data when the input data changes
	useEffect(() => {
		setEditedData(data || {});
		setHasChanges(false);
	}, [data]);

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

					case "organization":
						await api.organization.update.mutate({
							id: editedData.id,
							...editedData
						});
						utils.organization.getAll.invalidate();
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
				if (onClose) onClose();
			}
		} else {
			if (onClose) onClose();
		}
	};

	return (
		<div className="p-4 flex flex-col h-full">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-semibold">{title}</h2>
					<CopyJsonButton jsonData={editedData} tooltipText="Copy data as JSON" />
					{hasChanges && (
						<div className="flex items-center">
							<AlertOctagon className="h-4 w-4 text-amber-500 mr-1" />
							<span className="text-xs text-amber-500">Unsaved changes</span>
						</div>
					)}
				</div>

				{onClose && (
					<Button variant="ghost" size="icon" onClick={handleClose}>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>

			<EditorTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				cardView={
					<DataCardEditor
						data={editedData}
						onFieldChange={handleFieldChange}
						entityType={entityType}
					/>
				}
				jsonView={
					<JsonEditor
						data={editedData}
						onChange={handleJsonChange}
					/>
				}
			/>

			<div className="flex justify-between items-center mt-4">
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
			</div>
		</div>
	);
}