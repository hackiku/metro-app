// src/app/organization/components/OperationsCard.tsx
// Similar structure - you would parse and display data from the 'Operations' area row
// Example content: Gas volumes, LNG imports, terminal statuses
import {
	Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "~/components/ui/card";
import type { OrgDataRow } from "../services/orgDataService";
import { CopyJsonButton } from "./CopyJsonButton";
import { Badge } from "~/components/ui/badge";

interface OperationsCardProps {
	data: OrgDataRow | null | undefined;
}

export function OperationsCard({ data }: OperationsCardProps) {
	if (!data) return null;

	const { key_metrics, initiatives_policies, performance_notes, status_indicator, comparison_year } = data;
	const combinedJson = { key_metrics, initiatives_policies, performance_notes };

	let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";
	if (status_indicator?.toLowerCase().includes("declining")) {
		badgeVariant = "destructive";
	}

	return (
		<Card className="bg-background">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-lg">{data.area}</CardTitle>
					<CardDescription>Transmission & LNG Activities</CardDescription>
				</div>
				<CopyJsonButton jsonData={combinedJson} tooltipText="Copy Operations Data" />
			</CardHeader>
			<CardContent className="text-sm space-y-2">
				<div className="grid grid-cols-2 gap-x-4 gap-y-1">
					<p className="font-medium">GTS Volume (NL):</p>
					<p className="text-right">{key_metrics?.gts_volume_twh} TWh</p>
					<p className="font-medium">GUD Volume (DE):</p>
					<p className="text-right">{key_metrics?.gud_volume_twh} TWh</p>
					<p className="font-medium">LNG Import (NL):</p>
					<p className="text-right">{key_metrics?.lng_import_gts_bcm} bcm</p>
				</div>
				{performance_notes?.volume_trend && (
					<p className="text-xs text-muted-foreground pt-2">Note: Gas transmission volumes {performance_notes.volume_trend} vs {comparison_year}.</p>
				)}
				{initiatives_policies?.lng_terminals_operated_or_connected && (
					<div className="mt-2">
						<h4 className="font-semibold text-sm mb-1">Key LNG Terminals:</h4>
						<ul className="list-disc list-inside pl-2 text-muted-foreground text-xs">
							{initiatives_policies.lng_terminals_operated_or_connected.map((term: string, i: number) => <li key={i}>{term}</li>)}
						</ul>
					</div>
				)}
			</CardContent>
			<CardFooter className="pt-4">
				{status_indicator && <Badge variant={badgeVariant}>{status_indicator} Volumes</Badge>}
			</CardFooter>
		</Card>
	);
}