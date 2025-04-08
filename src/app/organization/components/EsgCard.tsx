// src/app/organization/components/EsgCard.tsx
// Similar structure - parsing and displaying ESG data
// Example content: Climate targets, emission performance, Taxonomy eligibility
import {
	Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "~/components/ui/card";
import type { OrgDataRow } from "../services/orgDataService";
import { CopyJsonButton } from "./CopyJsonButton";
import { Badge } from "~/components/ui/badge";

interface EsgCardProps {
	data: OrgDataRow | null | undefined;
}

export function EsgCard({ data }: EsgCardProps) {
	if (!data) return null;

	const { key_metrics, initiatives_policies, performance_notes, status_indicator, comparison_year } = data;
	const combinedJson = { key_metrics, initiatives_policies, performance_notes };

	let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
	if (status_indicator?.toLowerCase().includes("mixed")) {
		badgeVariant = "outline"; // Or another appropriate color
	}

	return (
		<Card className="bg-background">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-lg">{data.area}</CardTitle>
					<CardDescription>Sustainability Performance & Goals</CardDescription>
				</div>
				<CopyJsonButton jsonData={combinedJson} tooltipText="Copy ESG Data" />
			</CardHeader>
			<CardContent className="text-sm space-y-3">
				<div>
					<h4 className="font-semibold text-sm mb-1">Climate Ambition:</h4>
					<p className="text-muted-foreground">Net-Zero by {key_metrics?.net_zero_ambition_year || 'N/A'} (Scopes 1, 2, 3)</p>
				</div>
				<div>
					<h4 className="font-semibold text-sm mb-1">Key 2024 Emissions (kt CO₂e):</h4>
					<ul className="list-disc list-inside pl-2 text-muted-foreground text-xs">
						<li>Methane (Scope 1): {key_metrics?.methane_target_2030_kt_co2e ? `${key_metrics?.methane_emissions_kt_co2e || 'N/A'} (Target: <${key_metrics.methane_target_2030_kt_co2e})` : key_metrics?.methane_emissions_kt_co2e || 'N/A'} <Badge variant={performance_notes?.methane_status === 'On track' ? 'default' : 'destructive'} className="ml-1 h-4 px-1 text-[10px]">{performance_notes?.methane_status || 'Status N/A'}</Badge></li>
						<li>Scope 1+2 (Market): {key_metrics?.scope1_2_market_kt_co2e || 'N/A'} <Badge variant={performance_notes?.scope1_2_status === 'Off track' ? 'destructive' : 'default'} className="ml-1 h-4 px-1 text-[10px]">{performance_notes?.scope1_2_status || 'Status N/A'}</Badge></li>
						<li>Scope 3: {key_metrics?.scope3_emissions_kt_co2e || 'N/A'}</li>
					</ul>
				</div>
				<div>
					<h4 className="font-semibold text-sm mb-1">EU Taxonomy (2024):</h4>
					<p className="text-muted-foreground text-xs">Eligible CAPEX: {key_metrics?.capex_taxonomy_eligible_pct || 'N/A'}%</p>
				</div>
				{initiatives_policies?.material_topics && (
					<p className="text-xs text-muted-foreground pt-2">Material Topics: {initiatives_policies.material_topics.join(', ')}.</p>
				)}
			</CardContent>
			<CardFooter className="pt-4">
				{status_indicator && <Badge variant={badgeVariant}>{status_indicator} Performance</Badge>}
			</CardFooter>
		</Card>
	);
}