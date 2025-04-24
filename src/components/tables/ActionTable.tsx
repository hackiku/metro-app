// src/components/tables/ActionTable.tsx
"use client";

import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { useMediaQuery } from "~/hooks/use-media-query";
import { cn } from "~/lib/utils";

export interface Column<T> {
	key: string;
	header: string;
	width?: string;
	render?: (item: T) => React.ReactNode;
}

export interface ActionTableProps<T> {
	data: T[];
	columns: Column<T>[];
	keyField?: keyof T;
	isLoading?: boolean;
	selectedId?: string | null;
	primaryAction?: {
		icon?: React.ReactNode;
		label: string;
		onClick: () => void;
	};
	rowActions?: {
		edit?: {
			label: string;
			onClick: (id: string) => void;
		};
		delete?: {
			label: string;
			onClick: (id: string) => void;
		};
		other?: Array<{
			label: string;
			icon?: React.ReactNode;
			onClick: (id: string) => void;
		}>;
	};
	onRowClick?: (id: string) => void;
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

export function ActionTable<T extends { id: string }>({
	data,
	columns,
	keyField = "id" as keyof T,
	isLoading = false,
	selectedId = null,
	primaryAction,
	rowActions,
	onRowClick,
	emptyState,
	className
}: ActionTableProps<T>) {
	const isMobile = useMediaQuery("(max-width: 640px)");

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

	// Handle row click
	const handleRowClick = (id: string) => {
		if (onRowClick) {
			onRowClick(id);
		}
	};

	// Prevent event bubbling for action buttons
	const handleButtonClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	return (
		<div className={cn("rounded-md border", className)}>
			<Table>
				<TableHeader className="bg-muted/50">
					<TableRow>
						{columns.map((column) => (
							<TableHead
								key={column.key}
								className={column.width ? column.width : undefined}
							>
								{column.header}
							</TableHead>
						))}
						{(rowActions?.edit || rowActions?.delete || rowActions?.other) && (
							<TableHead className="w-[80px] text-right">Actions</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((item) => {
						const id = String(item[keyField]);
						const isSelected = selectedId === id;

						return (
							<TableRow
								key={id}
								className={cn(
									onRowClick ? "cursor-pointer" : "",
									isSelected ? "bg-muted" : "hover:bg-muted/50"
								)}
								onClick={() => onRowClick && handleRowClick(id)}
							>
								{columns.map((column) => (
									<TableCell key={`${id}-${column.key}`}>
										{column.render
											? column.render(item)
											: (item as any)[column.key] || "-"}
									</TableCell>
								))}

								{(rowActions?.edit || rowActions?.delete || rowActions?.other) && (
									<TableCell className="text-right p-2">
										{isMobile ? (
											<DropdownMenu>
												<DropdownMenuTrigger asChild onClick={handleButtonClick}>
													<Button variant="ghost" size="icon" className="h-8 w-8">
														<span className="sr-only">Open menu</span>
														<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
															<path d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
														</svg>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													{rowActions.edit && (
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																rowActions.edit?.onClick(id);
															}}
														>
															<Pencil className="h-4 w-4 mr-2" />
															{rowActions.edit.label}
														</DropdownMenuItem>
													)}
													{rowActions.delete && (
														<DropdownMenuItem
															className="text-destructive focus:text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																rowActions.delete?.onClick(id);
															}}
														>
															<Trash2 className="h-4 w-4 mr-2" />
															{rowActions.delete.label}
														</DropdownMenuItem>
													)}
													{rowActions.other && rowActions.other.map((action, idx) => (
														<DropdownMenuItem
															key={idx}
															onClick={(e) => {
																e.stopPropagation();
																action.onClick(id);
															}}
														>
															{action.icon && (
																<span className="mr-2">{action.icon}</span>
															)}
															{action.label}
														</DropdownMenuItem>
													))}
												</DropdownMenuContent>
											</DropdownMenu>
										) : (
											<div className="flex justify-end space-x-1">
												{rowActions.edit && (
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={(e) => {
															handleButtonClick(e);
															rowActions.edit?.onClick(id);
														}}
													>
														<Pencil className="h-4 w-4" />
														<span className="sr-only">{rowActions.edit.label}</span>
													</Button>
												)}
												{rowActions.delete && (
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-destructive"
														onClick={(e) => {
															handleButtonClick(e);
															rowActions.delete?.onClick(id);
														}}
													>
														<Trash2 className="h-4 w-4" />
														<span className="sr-only">{rowActions.delete.label}</span>
													</Button>
												)}
												{rowActions.other && rowActions.other.map((action, idx) => (
													<Button
														key={idx}
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={(e) => {
															handleButtonClick(e);
															action.onClick(id);
														}}
													>
														{action.icon || <span>•</span>}
														<span className="sr-only">{action.label}</span>
													</Button>
												))}
											</div>
										)}
									</TableCell>
								)}
							</TableRow>
						);
					})}

					{/* Add new item row */}
					{primaryAction && (
						<TableRow className="hover:bg-muted/30 cursor-pointer border-t border-dashed" onClick={primaryAction.onClick}>
							<TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="h-12">
								<div className="flex items-center justify-center text-muted-foreground">
									{primaryAction.icon || <Plus className="h-4 w-4 mr-2" />}
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