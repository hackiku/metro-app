// src/app/conversation/_components/summary/CareerAspirationDisplay.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { type mockUser } from "../../_data"; // Adjust import path

interface CareerAspirationDisplayProps {
	userData: typeof mockUser; // Use the actual user type
}

export function CareerAspirationDisplay({ userData }: CareerAspirationDisplayProps) {
	return (
		<div>
			<h3 className="mb-2 text-lg font-semibold text-foreground">Current Position</h3>
			<div className="mb-6 rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground dark:bg-card/40">
				<p><strong>Role:</strong> {userData.currentRole}</p>
				<p><strong>Key Responsibilities:</strong> {userData.currentResponsibilities}</p>
				<p><strong>Key Strengths:</strong> {userData.currentStrengths}</p>
				<p><strong>Notable Achievements:</strong> {userData.notableAchievements}</p>
			</div>

			<h3 className="mb-2 text-lg font-semibold text-foreground">Career Aspiration</h3>
			<div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground dark:bg-card/40">
				<p><strong>Target Role:</strong> {userData.targetRole}</p>
				<p><strong>Timeframe:</strong> {userData.developmentPlanOverview.phases.reduce((acc, p) => acc + parseInt(p.duration), 0)} months (approx)</p>
				<div>
					<strong>Reasons for Interest:</strong>
					<ul className="list-disc pl-5">
						{userData.reasonsForInterestInTarget.map((reason, i) => <li key={i}>{reason}</li>)}
					</ul>
				</div>
			</div>
		</div>
	);
}