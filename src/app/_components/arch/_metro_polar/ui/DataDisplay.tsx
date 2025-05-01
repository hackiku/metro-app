// src/app/_components/metro/ui/DataDisplay.tsx

"use client";

import React from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table"; // Adjust path if needed
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "~/components/ui/card"; // Adjust path if needed
import type {
	Organization,
	CareerPath,
	Position,
	PositionDetail
} from '~/types/compass';

interface DataDisplayProps {
	organization: Organization | null;
	careerPaths: CareerPath[];
	positions: Position[];
	positionDetails: PositionDetail[];
	// Add other data arrays here later (transitions, skills) if needed
}

// Reusable Table component specifically for this display
const InfoTable: React.FC<{ title: string; data: any[] }> = ({ title, data }) => {
	if (!data || data.length === 0) {
		return (
			<Card className="mb-6 bg-card text-card-foreground border-border">
				<CardHeader>
					<CardTitle className="text-lg">{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">No data available.</p>
				</CardContent>
			</Card>
		);
	}

	// Dynamically get columns from the first data row
	const columns = Object.keys(data[0] || {});
	// Prioritize 'name', 'level', 'sequence_in_path', 'organization_id' if they exist
	const prioritizedCols = ['name', 'level', 'sequence_in_path', 'organization_id'];
	const sortedColumns = [
		...prioritizedCols.filter(col => columns.includes(col)),
		...columns.filter(col => !prioritizedCols.includes(col) && col !== 'id' && col !== 'created_at' && col !== 'organization_id') // Hide some common ones initially
	];

	return (
		<Card className="mb-6 bg-card text-card-foreground border-border shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto rounded-md border border-border">
					<Table>
						<TableHeader className="bg-muted/50">
							<TableRow className="border-border">
								{sortedColumns.map((col) => (
									<TableHead key={col} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap h-10">
										{col.replace(/_/g, ' ')}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((row, index) => (
								<TableRow key={row.id || index} className="border-border hover:bg-muted/50">
									{sortedColumns.map((col) => (
										<TableCell key={col} className="px-4 py-2 whitespace-nowrap text-xs text-foreground align-top h-10">
											{/* Improved rendering */}
											{typeof row[col] === 'boolean'
												? row[col] ? 'Yes' : 'No'
												: (typeof row[col] === 'string' && row[col].length > 60)
													? <span title={row[col]}>{`${row[col].substring(0, 57)}...`}</span>
													: (row[col] === null || row[col] === undefined)
														? <span className="text-muted-foreground italic">null</span>
														: String(row[col])
											}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
};


export default function DataDisplay({
	organization,
	careerPaths,
	positions,
	positionDetails
}: DataDisplayProps) {
	return (
		<div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto bg-background">
			<h1 className="text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">
				Career Framework Inspector
			</h1>

			{organization && (
				<Card className="mb-6 bg-primary/10 border-primary/20">
					<CardHeader>
						<CardTitle className="text-lg text-primary">Organization Context</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-primary/90">
							Displaying data for: <span className="font-semibold">{organization.name}</span> ({organization.id})
						</p>
					</CardContent>
				</Card>
			)}

			{/* Display fetched data using the InfoTable component */}
			<InfoTable title="Career Paths" data={careerPaths} />
			<InfoTable title="Generic Positions" data={positions} />
			<InfoTable title="Position Details (Roles in Paths)" data={positionDetails} />
			{/* Add other tables here later */}

			{/* Raw JSON for quick inspection */}
			<details className="mt-6">
				<summary className="cursor-pointer text-sm text-muted-foreground font-medium hover:text-foreground">Show Raw Context Data (JSON)</summary>
				<pre className="mt-2 p-3 bg-muted/30 text-muted-foreground rounded text-xs overflow-x-auto border border-border">
					{JSON.stringify({
						organization,
						careerPaths,
						positions,
						positionDetails,
					}, null, 2)}
				</pre>
			</details>
		</div>
	);
}