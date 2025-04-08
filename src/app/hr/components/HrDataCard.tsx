// src/app/hr/components/HrDataCard.tsx
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card"; // Assuming you have shadcn Card components available
import { Badge } from "~/components/ui/badge"; // Assuming Badge component
import type { HrDataRow } from "../services/hrDataService";
import { JsonDisplay } from "~/app/json-data/JsonDisplay"; // Reuse JsonDisplay if appropriate, or create simpler displays

// Helper to format JSONB data for display (simple version)
const SimpleJsonDisplay = ({ data, title }: { data: Record<string, any> | null, title: string }) => {
	if (!data || Object.keys(data).length === 0) return null;
	return (
		<div className="mt-2">
			<h4 className="font-semibold text-sm mb-1">{title}:</h4>
			<pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	);
};

interface HrDataCardProps {
	dataRow: HrDataRow;
}

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
		badgeVariant = "destructive"; // Or maybe an amber/yellow if you have one
	} else if (status_indicator?.toLowerCase().includes("progressing") || status_indicator?.toLowerCase().includes("growth")) {
		badgeVariant = "default"; // Green/positive
	}

	return (
		<Card className="bg-background shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg">{area}</CardTitle>
				{sub_area && (
					<CardDescription>{sub_area}</CardDescription>
				)}
			</CardHeader>
			<CardContent className="text-sm space-y-3">
				{/* Display Key Metrics */}
				<SimpleJsonDisplay data={key_metrics} title="Key Metrics" />

				{/* Display Initiatives/Policies */}
				<SimpleJsonDisplay data={initiatives_policies} title="Initiatives & Policies" />

				{/* Display Performance Notes */}
				<SimpleJsonDisplay data={performance_notes} title="Performance Notes" />

			</CardContent>
			<CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
				<div>
					{status_indicator && <Badge variant={badgeVariant}>{status_indicator}</Badge>}
					{comparison_year && <span className="ml-2">(vs {comparison_year})</span>}
				</div>
				{data_source && <span>Source: {data_source}</span>}
			</CardFooter>
		</Card>
	);
}