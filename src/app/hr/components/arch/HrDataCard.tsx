// src/app/hr/components/HrDataCard.tsx
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { HrDataRow } from "../services/hrDataService";
// Assuming CopyJsonButton is placed in a shared or organization components folder
import { CopyJsonButton } from "~/components/CopyJsonButton"; // Adjust path if needed
import React from "react";

interface HrDataCardProps {
	dataRow: HrDataRow;
}

// Helper to render key-value pairs from a JSON object
const RenderJsonObject = ({ data }: { data: Record<string, any> | null | undefined }) => {
	if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
		return <p className="text-xs text-muted-foreground italic">No data available.</p>;
	}

	return (
		<div className="space-y-1">
			{Object.entries(data).map(([key, value]) => {
				let displayValue: React.ReactNode;

				// Simple rendering for different types
				if (value === null || value === undefined) {
					displayValue = <span className="text-muted-foreground italic">N/A</span>;
				} else if (typeof value === 'boolean') {
					displayValue = value ? 'Yes' : 'No';
				} else if (typeof value === 'object' && value !== null) {
					// Basic representation for nested objects/arrays for this demo
					displayValue = Array.isArray(value) ? `[Array (${value.length} items)]` : '[Object]';
					// For a real app, you might recursively render or flatten
				} else {
					displayValue = String(value);
				}

				// Format the key (e.g., camelCase to Title Case)
				const formattedKey = key
					.replace(/_/g, ' ') // Replace underscores with spaces
					.replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
					.replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
					.trim();

				return (
					<div key={key} className="flex justify-between items-start text-xs">
						<span className="font-medium mr-2 break-words">{formattedKey}:</span>
						<span className="text-right text-muted-foreground break-words">{displayValue}</span>
					</div>
				);
			})}
		</div>
	);
};


export function HrDataCard({ dataRow }: HrDataCardProps) {
	const {
		area,
		sub_area,
		key_metrics,
		initiatives_policies,
		performance_notes,
		status_indicator,
		comparison_year,
		data_source
	} = dataRow;

	// Determine status badge variant
	let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
	if (status_indicator?.toLowerCase().includes("target")) {
		badgeVariant = status_indicator.toLowerCase().includes("off") ? "destructive" : "default";
	} else if (status_indicator?.toLowerCase().includes("attention")) {
		badgeVariant = "destructive";
	} else if (status_indicator?.toLowerCase().includes("progressing") || status_indicator?.toLowerCase().includes("growth")) {
		badgeVariant = "default";
	} else if (status_indicator?.toLowerCase().includes("stable")) {
		badgeVariant = "outline";
	}


	return (
		<Card className="bg-background shadow-sm flex flex-col h-full"> {/* Ensure card takes full height if needed in grid */}
			<CardHeader>
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-lg">{area}</CardTitle>
						{sub_area && (
							<CardDescription>{sub_area}</CardDescription>
						)}
					</div>
					{/* Optionally add a copy button for the whole card data? Or keep per section */}
				</div>
			</CardHeader>
			<CardContent className="text-sm space-y-4 flex-grow"> {/* flex-grow makes content take available space */}

				{/* Key Metrics Section */}
				{key_metrics && Object.keys(key_metrics).length > 0 && (
					<div>
						<div className="flex justify-between items-center mb-1">
							<h4 className="font-semibold">Key Metrics</h4>
							<CopyJsonButton jsonData={key_metrics} tooltipText="Copy Key Metrics JSON" />
						</div>
						<RenderJsonObject data={key_metrics} />
					</div>
				)}

				{/* Initiatives & Policies Section */}
				{initiatives_policies && Object.keys(initiatives_policies).length > 0 && (
					<div className="pt-2 border-t border-border"> {/* Add separator */}
						<div className="flex justify-between items-center mb-1">
							<h4 className="font-semibold">Initiatives & Policies</h4>
							<CopyJsonButton jsonData={initiatives_policies} tooltipText="Copy Initiatives/Policies JSON" />
						</div>
						<RenderJsonObject data={initiatives_policies} />
					</div>
				)}

				{/* Performance Notes Section */}
				{performance_notes && Object.keys(performance_notes).length > 0 && (
					<div className="pt-2 border-t border-border"> {/* Add separator */}
						<div className="flex justify-between items-center mb-1">
							<h4 className="font-semibold">Performance Notes</h4>
							<CopyJsonButton jsonData={performance_notes} tooltipText="Copy Performance Notes JSON" />
						</div>
						<RenderJsonObject data={performance_notes} />
					</div>
				)}

			</CardContent>
			<CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border mt-auto"> {/* mt-auto pushes footer down */}
				<div>
					{status_indicator && <Badge variant={badgeVariant}>{status_indicator}</Badge>}
					{comparison_year && <span className="ml-2">(vs {comparison_year})</span>}
				</div>
				{data_source && <span className="truncate max-w-[150px]" title={data_source}>Source: {data_source}</span>}
			</CardFooter>
		</Card>
	);
}