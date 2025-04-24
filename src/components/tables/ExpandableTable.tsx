// src/components/tables/ExpandableTable.tsx
"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExpandableTableProps<T> {
	data: T[];
	columns: { key: string; header: string }[];
	renderExpanded: (item: T) => React.ReactNode;
	keyField?: string;
}

export function ExpandableTable<T extends Record<string, any>>({
	data,
	columns,
	renderExpanded,
	keyField = "id"
}: ExpandableTableProps<T>) {
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

	const toggleExpand = (id: string) => {
		const newExpanded = new Set(expandedIds);
		if (newExpanded.has(id)) {
			newExpanded.delete(id);
		} else {
			newExpanded.add(id);
		}
		setExpandedIds(newExpanded);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[50px]"></TableHead>
					{columns.map(column => (
						<TableHead key={column.key}>{column.header}</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.length === 0 ? (
					<TableRow>
						<TableCell colSpan={columns.length + 1} className="text-center h-24 text-muted-foreground">
							No data available
						</TableCell>
					</TableRow>
				) : (
					data.map(item => (
						// Use an array fragment with keys for both rows
						[
							<TableRow
								key={`row-${item[keyField]}`}
								className="cursor-pointer hover:bg-muted/50"
								onClick={() => toggleExpand(item[keyField])}
							>
								<TableCell>
									{expandedIds.has(item[keyField]) ?
										<ChevronDown size={16} /> :
										<ChevronRight size={16} />
									}
								</TableCell>
								{columns.map(column => (
									<TableCell key={`${item[keyField]}-${column.key}`}>
										{column.key === "color" ? (
											<div className="flex items-center gap-2">
												<div
													className="w-6 h-6 rounded-full border"
													style={{ backgroundColor: item[column.key] || "#cccccc" }}
												/>
												<span>{item[column.key]}</span>
											</div>
										) : (
											item[column.key] || "-"
										)}
									</TableCell>
								))}
							</TableRow>,
							// Only include expanded row if expanded
							expandedIds.has(item[keyField]) && (
								<TableRow key={`expanded-${item[keyField]}`}>
									<TableCell colSpan={columns.length + 1} className="bg-muted/20 p-0">
										<div className="p-4 border-t">
											{renderExpanded(item)}
										</div>
									</TableCell>
								</TableRow>
							)
						].filter(Boolean) // Filter out false values
					)).flat() // Flatten the array of arrays
				)}
			</TableBody>
		</Table>
	);
}