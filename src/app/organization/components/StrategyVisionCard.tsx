// src/app/organization/components/StrategyVisionCard.tsx
import {
	Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "~/components/ui/card";
import type { OrgDataRow } from "../services/orgDataService";
import { CopyJsonButton } from "./CopyJsonButton";

interface StrategyVisionCardProps {
	data: OrgDataRow | null | undefined;
}

export function StrategyVisionCard({ data }: StrategyVisionCardProps) {
	if (!data) return null;

	const { key_metrics, initiatives_policies, performance_notes } = data;
	const combinedJson = { key_metrics, initiatives_policies, performance_notes }; // Combine for copy button

	return (
		<Card className="bg-background">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-lg">{data.area}</CardTitle>
					{data.sub_area && <CardDescription>{data.sub_area}</CardDescription>}
				</div>
				<CopyJsonButton jsonData={combinedJson} tooltipText="Copy Strategy/Vision Data" />
			</CardHeader>
			<CardContent className="text-sm space-y-3">
				{initiatives_policies?.mission && (
					<p><strong className="font-medium">Mission:</strong> {initiatives_policies.mission}</p>
				)}
				{initiatives_policies?.vision_2040_summary && (
					<p><strong className="font-medium">Vision 2040:</strong> {initiatives_policies.vision_2040_summary}</p>
				)}
				{performance_notes?.core_challenge && (
					<p><strong className="font-medium">Core Challenge:</strong> {performance_notes.core_challenge}</p>
				)}
				{initiatives_policies?.vision_2040_elements && initiatives_policies?.vision_2040_elements.length > 0 && (
					<div>
						<h4 className="font-semibold text-sm mt-2">Vision 2040 Elements:</h4>
						<ul className="list-disc list-inside pl-2 text-muted-foreground">
							{initiatives_policies.vision_2040_elements.map((item: string, index: number) => (
								<li key={index}>{item}</li>
							))}
						</ul>
					</div>
				)}
				{initiatives_policies?.priorities && initiatives_policies?.priorities.length > 0 && (
					<div>
						<h4 className="font-semibold text-sm mt-2">Strategic Priorities (2025-30):</h4>
						<ul className="list-disc list-inside pl-2 text-muted-foreground">
							{initiatives_policies.priorities.map((item: { name: string, projects?: string[] }, index: number) => (
								<li key={index}>{item.name}{item.projects ? ` (${item.projects.join(', ')})` : ''}</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
			{/* Optional Footer */}
			{/* <CardFooter className="text-xs text-muted-foreground pt-4">
                <p>Strategy effective from {initiatives_policies?.new_strategy_effective_date || 'N/A'}</p>
            </CardFooter> */}
		</Card>
	);
}