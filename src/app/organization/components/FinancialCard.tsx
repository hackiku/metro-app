// src/app/organization/components/FinancialCard.tsx
import {
	Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "~/components/ui/card";
import type { OrgDataRow } from "../services/orgDataService";
import { CopyJsonButton } from "./CopyJsonButton";
import { Badge } from "~/components/ui/badge";

interface FinancialCardProps {
	data: OrgDataRow | null | undefined;
}

// Helper to format currency
const formatCurrency = (value: number | null | undefined, unit: string) => {
	if (value === null || value === undefined) return 'N/A';
	return `${value.toLocaleString()} ${unit}`;
};

export function FinancialCard({ data }: FinancialCardProps) {
	if (!data) return null;

	const { key_metrics, performance_notes, status_indicator, comparison_year } = data;
	const combinedJson = { key_metrics, performance_notes };

	// Determine badge variant
	let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
	if (status_indicator?.toLowerCase().includes("declining")) {
		badgeVariant = "destructive";
	} else if (status_indicator?.toLowerCase().includes("stable")) {
		badgeVariant = "default";
	}

	return (
		<Card className="bg-background">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-lg">{data.area}</CardTitle>
					<CardDescription>Key Performance Indicators</CardDescription>
				</div>
				<CopyJsonButton jsonData={combinedJson} tooltipText="Copy Financial Data" />
			</CardHeader>
			<CardContent className="text-sm space-y-2">
				<div className="grid grid-cols-2 gap-x-4 gap-y-1">
					<p className="font-medium">Net Profit (Reported):</p>
					<p className="text-right">{formatCurrency(key_metrics?.net_profit_reported_m_eur, 'M EUR')}</p>

					<p className="font-medium">Net Profit (Underlying):</p>
					<p className="text-right">{formatCurrency(key_metrics?.net_profit_underlying_m_eur, 'M EUR')}</p>

					<p className="font-medium">Total Assets:</p>
					<p className="text-right">{formatCurrency(key_metrics?.total_assets_b_eur, 'B EUR')}</p>

					<p className="font-medium">Equity:</p>
					<p className="text-right">{formatCurrency(key_metrics?.equity_b_eur, 'B EUR')}</p>
				</div>
				{performance_notes?.main_reason && (
					<p className="text-xs text-muted-foreground pt-2">
						Note: {performance_notes.main_reason} {comparison_year ? `(vs ${comparison_year})` : ''}.
					</p>
				)}
				{performance_notes?.moodys_rating_change_july_2024 && (
					<p className="text-xs text-muted-foreground pt-1">
						Credit Rating: {performance_notes.moodys_rating_change_july_2024}
					</p>
				)}
			</CardContent>
			<CardFooter className="pt-4">
				{status_indicator && <Badge variant={badgeVariant}>{status_indicator} (Underlying)</Badge>}
			</CardFooter>
		</Card>
	);
}