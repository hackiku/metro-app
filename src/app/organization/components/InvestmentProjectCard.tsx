// src/app/organization/components/InvestmentProjectCard.tsx
import {
	Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "~/components/ui/card";
import type { OrgDataRow } from "../services/orgDataService";
import { CopyJsonButton } from "./CopyJsonButton";

interface InvestmentProjectCardProps {
	data: OrgDataRow | null | undefined;
}

export function InvestmentProjectCard({ data }: InvestmentProjectCardProps) {
	if (!data) return null;

	const { key_metrics, initiatives_policies, performance_notes } = data;
	const combinedJson = { key_metrics, initiatives_policies, performance_notes };

	return (
		<Card className="bg-background">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-lg">{data.area}</CardTitle>
					<CardDescription>Investment Plan & Key Projects</CardDescription>
				</div>
				<CopyJsonButton jsonData={combinedJson} tooltipText="Copy Investment Data" />
			</CardHeader>
			<CardContent className="text-sm space-y-3">
				{key_metrics?.plan_total_2025_2030_b_eur && (
					<p><strong className="font-medium">Investment Plan (2025-30):</strong> €{key_metrics.plan_total_2025_2030_b_eur} Billion</p>
				)}
				{key_metrics?.split_transition_pct !== undefined && (
					<p><strong className="font-medium">Split:</strong> {key_metrics.split_transition_pct}% Transition / {100 - key_metrics.split_transition_pct}% Security of Supply</p>
				)}
				{key_metrics?.capex_taxonomy_eligible_pct_2024 && (
					<p><strong className="font-medium">EU Taxonomy Eligible CAPEX (2024):</strong> {key_metrics.capex_taxonomy_eligible_pct_2024}%</p>
				)}

				{initiatives_policies?.key_projects && (
					<div className="mt-2">
						<h4 className="font-semibold text-sm mb-1">Key Project Status:</h4>
						<ul className="list-disc list-inside pl-2 text-muted-foreground space-y-1 text-xs">
							{Object.entries(initiatives_policies.key_projects).map(([key, value]) => (
								<li key={key}><strong>{key}:</strong> {typeof value === 'string' ? value : JSON.stringify(value)}</li>
							))}
						</ul>
					</div>
				)}
				{performance_notes?.hynetwork_timeline && (
					<p className="text-xs text-muted-foreground pt-2">Note: Hynetwork NL timeline delayed, cost estimate increased to €{performance_notes?.hynetwork_cost_b || 'N/A'}bn.</p>
				)}
			</CardContent>
			{/* Optional Footer */}
		</Card>
	);
}