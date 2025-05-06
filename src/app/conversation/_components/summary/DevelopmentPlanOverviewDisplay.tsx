// src/app/conversation/_components/summary/DevelopmentPlanOverviewDisplay.tsx
import { type mockUser } from "../../_data"; // Adjust path

interface DevPlanProps {
	planOverview: typeof mockUser.developmentPlanOverview;
}

export function DevelopmentPlanOverviewDisplay({ planOverview }: DevPlanProps) {
	return (
		<div>
			<h3 className="mb-2 text-lg font-semibold text-foreground">Development Plan Overview</h3>
			<div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground dark:bg-card/40">
				<p className="mb-1 font-medium">Phases:</p>
				<ul className="mb-3 list-disc pl-5">
					{planOverview.phases.map((phase, i) => <li key={i}>{phase.name} ({phase.duration})</li>)}
				</ul>
				<p className="mb-1 font-medium">Key Skills to Develop:</p>
				<ul className="list-disc pl-5">
					{planOverview.keySkillsToDevelop.map((skill, i) => <li key={i}>{skill}</li>)}
				</ul>
			</div>
		</div>
	);
}