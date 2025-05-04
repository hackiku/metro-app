// src/components/tables/DraggableTable.tsx
"use client";

import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export interface Column<T> {
	key: string;
	header: string;
	width?: string;
	render?: (item: T) => React.ReactNode;
}

interface DraggableTableProps<T> {
	data: T[];
	columns: Column<T>[];
	keyField?: keyof T;
	isLoading?: boolean;
	selectedId?: string | null;
	onRowClick?: (id: string) => void;
	onRowMove?: (sourceId: string, targetId: string) => void;
	onEdit?: (id: string) => void;
	onRemove?: (id: string) => void;
	primaryAction?: {
		label: string;
		onClick: () => void;
	};
	emptyState?: {
		title: string;
		description: string;
		action?: {
			label: string;
			onClick: () => void;
		};
	};
	className?: string;
}

export function DraggableTable<T extends { id: string }>({
	data,
	columns,
	keyField = "id" as keyof T,
	isLoading = false,
	selectedId = null,
	onRowClick,
	onRowMove,
	onEdit,
	onRemove,
	primaryAction,
	emptyState,
	className
}: DraggableTableProps<T>) {
	const [draggingId, setDraggingId] = useState<string | null>(null);

	// Handle drag events
	const handleDragStart = (e: React.DragEvent, id: string) => {
		setDraggingId(id);
		e.dataTransfer.setData("text/plain", id);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent, targetId: string) => {
		e.preventDefault();
		const sourceId = e.dataTransfer.getData("text/plain");

		if (sourceId === targetId) return;
		if (onRowMove) {
			onRowMove(sourceId, targetId);
		}
		setDraggingId(null);
	};

	const handleDragEnd = () => {
		setDraggingId(null);
	};

	// Prevent event bubbling for action buttons
	const handleButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	// Handle row click
	const handleRowClick = (id: string) => {
		if (onRowClick) {
			onRowClick(id);
		}
	};

	// Render loading state with skeletons
	if (isLoading) {
		return (
			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-10 w-28" />
				</div>
				{[1, 2, 3].map(i => (
					<Skeleton key={i} className="h-12 w-full" />
				))}
			</div>
		);
	}

	// Render empty state
	if (data.length === 0 && emptyState) {
		return (
			<div className="text-center py-10 border rounded-md bg-muted/20">
				<h3 className="text-lg font-medium mb-2">{emptyState.title}</h3>
				<p className="text-muted-foreground mb-6">{emptyState.description}</p>
				{emptyState.action && (
					<Button onClick={emptyState.action.onClick}>
						<Plus className="mr-2 h-4 w-4" />
						{emptyState.action.label}
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className={cn("rounded-md border", className)}>
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow>
						<TableHead className="w-[40px]"></TableHead>
						{columns.map((column) => (
							<TableHead
								key={column.key}
								className={column.width ? column.width : undefined}
							>
								{column.header}
							</TableHead>
						))}
						<TableHead className="w-[80px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((item) => {
						const id = String(item[keyField]);
						const isSelected = selectedId === id;
						const isDragging = draggingId === id;

						return (
							<TableRow
								key={id}
								className={cn(
									"relative",
									onRowClick ? "cursor-pointer" : "cursor-grab",
									isSelected ? "bg-muted" : "hover:bg-muted/50",
									isDragging ? "opacity-50" : ""
								)}
								onClick={() => onRowClick && handleRowClick(id)}
								draggable={!!onRowMove}
								onDragStart={(e) => handleDragStart(e, id)}
								onDragOver={handleDragOver}
								onDrop={(e) => handleDrop(e, id)}
								onDragEnd={handleDragEnd}
							>
								<TableCell className="w-[40px]">
									<GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
								</TableCell>

								{columns.map((column) => (
									<TableCell key={`${id}-${column.key}`}>
										{column.render
											? column.render(item)
											: (item as any)[column.key] || "-"}
									</TableCell>
								))}

								<TableCell className="text-right p-2">
									<div className="flex justify-end space-x-1">
										{onEdit && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={(e) => {
													handleButtonClick(e);
													onEdit(id);
												}}
											>
												<Pencil className="h-4 w-4" />
												<span className="sr-only">Edit</span>
											</Button>
										)}
										{onRemove && (
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive"
												onClick={(e) => {
													handleButtonClick(e);
													onRemove(id);
												}}
											>
												<Trash2 className="h-4 w-4" />
												<span className="sr-only">Remove</span>
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						);
					})}

					{/* Add new item row */}
					{primaryAction && (
						<TableRow className="hover:bg-muted/30 cursor-pointer border-t border-dashed" onClick={primaryAction.onClick}>
							<TableCell colSpan={columns.length + 2} className="h-12">
								<div className="flex items-center justify-center text-muted-foreground">
									<Plus className="h-4 w-4 mr-2" />
									<span>{primaryAction.label}</span>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}