// src/components/tables/EnhancedExpandableTable.tsx
"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { ColorPreview } from "~/components/ui/color-preview";
import Link from "next/link";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

interface Column<T> {
	key: string;
	header: string;
	width?: string;
	render?: (item: T) => React.ReactNode;
}

interface EnhancedExpandableTableProps<T> {
	data: T[];
	columns: Column<T>[];
	keyField?: keyof T;
	isLoading?: boolean;
	selectedId?: string | null;
	renderExpanded: (item: T) => React.ReactNode;
	onRowClick?: (id: string) => void;
	onEditClick?: (id: string, e: React.MouseEvent) => void;
	onDeleteClick?: (id: string, e: React.MouseEvent) => void;
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
	getRowUrl?: (id: string) => string;
}

export function EnhancedExpandableTable<T extends { id: string }>({
	data,
	columns,
	keyField = "id" as keyof T,
	isLoading = false,
	selectedId = null,
	renderExpanded,
	onRowClick,
	onEditClick,
	onDeleteClick,
	primaryAction,
	emptyState,
	getRowUrl
}: EnhancedExpandableTableProps<T>) {
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

	// Handle toggle row expansion
	const toggleExpand = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const newExpanded = new Set(expandedIds);
		if (newExpanded.has(id)) {
			newExpanded.delete(id);
		} else {
			newExpanded.add(id);
		}
		setExpandedIds(newExpanded);
	};

	// Handle row click for selection
	const handleRowClick = (id: string) => {
		if (onRowClick) {
			onRowClick(id);
		}
	};

	// Prevent event bubbling for action buttons
	const handleButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	// Open the expanded section for the selected row
	useEffect(() => {
		if (selectedId && !expandedIds.has(selectedId)) {
			setExpandedIds(prev => new Set([...prev, selectedId]));
		}
	}, [selectedId]);

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
						<span className="mr-2">+</span>
						{emptyState.action.label}
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow>
						<TableHead className="w-[50px]"></TableHead>
						{columns.map((column) => (
							<TableHead
								key={column.key}
								className={column.width ? column.width : undefined}
							>
								{column.header}
							</TableHead>
						))}
						<TableHead className="w-[100px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((item) => {
						const id = String(item[keyField]);
						const isExpanded = expandedIds.has(id);
						const isSelected = selectedId === id;

						return (
							<>
								<TableRow
									key={`row-${id}`}
									className={cn(
										"cursor-pointer",
										isSelected ? "bg-muted" : "hover:bg-muted/50"
									)}
									onClick={() => handleRowClick(id)}
								>
									<TableCell>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											onClick={(e) => toggleExpand(id, e)}
										>
											{isExpanded ?
												<ChevronDown className="h-4 w-4" /> :
												<ChevronRight className="h-4 w-4" />
											}
										</Button>
									</TableCell>

									{columns.map((column) => (
										<TableCell key={`${id}-${column.key}`}>
											{column.render
												? column.render(item)
												: (item as any)[column.key] || "-"}
										</TableCell>
									))}

									<TableCell className="text-right">
										<div className="flex justify-end space-x-1">
											{getRowUrl && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													asChild
													onClick={handleButtonClick}
												>
													<Link href={getRowUrl(id)} target="_blank">
														<ExternalLink className="h-4 w-4" />
													</Link>
												</Button>
											)}

											{onEditClick && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={(e) => {
														handleButtonClick(e);
														onEditClick(id, e);
													}}
												>
													<Pencil className="h-4 w-4" />
												</Button>
											)}

											{onDeleteClick && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
													onClick={(e) => {
														handleButtonClick(e);
														onDeleteClick(id, e);
													}}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>

								{isExpanded && (
									<TableRow key={`expanded-${id}`}>
										<TableCell colSpan={columns.length + 2} className="p-0 border-t">
											<div className="py-4 px-6 bg-muted/10">
												{renderExpanded(item)}
											</div>
										</TableCell>
									</TableRow>
								)}
							</>
						);
					})}

					{/* Add new item row */}
					{primaryAction && (
						<TableRow
							className="hover:bg-muted/30 cursor-pointer border-t border-dashed"
							onClick={primaryAction.onClick}
						>
							<TableCell colSpan={columns.length + 2} className="h-12">
								<div className="flex items-center justify-center text-muted-foreground">
									<span className="mr-2">+</span>
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