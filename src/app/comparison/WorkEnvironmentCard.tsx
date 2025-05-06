// src/app/comparison/WorkEnvironmentCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { comparisonData, type WorkEnvironmentDifference } from "./data";

export function WorkEnvironmentCard() {
	const { workEnvironmentDifferences, currentRole, targetRole } = comparisonData;

	return (
		<Card className="shadow-sm dark:bg-card">
			<CardHeader>
				<CardTitle className="text-lg">Work Environment Differences</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Optional: Add small labels for current/target role above the columns */}
				{/* <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground mb-2">
          <p>{currentRole}</p>
          <p>{targetRole}</p>
        </div> */}
				{workEnvironmentDifferences.map((diff) => (
					<div key={diff.id} className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
						<div className="rounded-md border bg-muted p-3 dark:bg-muted/50">
							<p className="text-muted-foreground">{diff.currentRoleText}</p>
						</div>
						<div className="rounded-md border bg-background p-3 dark:border-neutral-700">
							<p className="text-foreground">{diff.targetRoleText}</p>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}