// src/app/route/CareerRoutePlanPage.tsx
"use client";

import { useState } from "react";
import { MapPinned, Download, PlusSquare } from "lucide-react"; // MapPinned is a bit more "route" like
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { ColoredProgress } from "~/components/ui/colored-progress"; // Using our custom progress
import { careerRoutePlanData, type ActionItem, type RoutePhase } from "./data";
import { PhaseStepItem } from "./PhaseStepItem";
import { ActionListItem } from "./ActionListItem";
import { cn } from "~/lib/utils";

export function CareerRoutePlanPage() {
	const [planData, setPlanData] = useState(careerRoutePlanData);
	const [activePhaseId, setActivePhaseId] = useState<string>(
		planData.phases[0]?.id ?? ""
	);

	const activePhase = planData.phases.find(p => p.id === activePhaseId) || planData.phases[0];

	const handlePhaseClick = (phaseId: string) => {
		setActivePhaseId(phaseId);
	};

	const handleActionToggle = (actionId: string, newStatus: ActionItem['status']) => {
		setPlanData(prevData => {
			const newPhases = prevData.phases.map(phase => {
				if (phase.id === activePhaseId) {
					const newActions = phase.actions.map(action =>
						action.id === actionId ? { ...action, status: newStatus } : action
					);
					// Recalculate phase progress
					const completedActions = newActions.filter(a => a.status === 'completed').length;
					const totalActions = newActions.length;
					const newProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
					return { ...phase, actions: newActions, progress: newProgress };
				}
				return phase;
			});
			return { ...prevData, phases: newPhases };
		});
	};


	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-6 flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<MapPinned className="h-6 w-6" />
				</div>
				<div>
					<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
						{planData.title}
					</h1>
					<p className="text-muted-foreground">
						{planData.subtitle.replace("Product Analyst", planData.targetRole)}
					</p>
				</div>
			</div>

			<p className="mb-8 text-muted-foreground">
				{planData.description}
			</p>

			<Card className="shadow-sm dark:bg-card">
				<CardHeader className="p-6">
					<div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
						<div>
							<h3 className="text-sm text-muted-foreground">Destination</h3>
							<h2 className="text-xl font-semibold text-foreground">
								{planData.targetRole}
							</h2>
						</div>
						<div className="text-left sm:text-right">
							<h3 className="text-sm text-muted-foreground">Total Duration</h3>
							<p className="text-lg font-medium text-foreground">
								{planData.totalDuration}
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-6">
					{/* Phase Stepper */}
					<div className="mb-8 flex items-start overflow-x-auto pb-2">
						{planData.phases.map((phase, index) => (
							<div key={phase.id} className="flex items-start">
								<PhaseStepItem
									number={phase.number}
									title={phase.title}
									duration={phase.duration}
									isActive={phase.id === activePhaseId}
									onClick={() => handlePhaseClick(phase.id)}
								// isCompleted={phase.progress === 100} // Example for completed visual
								/>
								{index < planData.phases.length - 1 && (
									<div className="mx-1 h-0.5 min-w-[20px] flex-1 self-center bg-border md:mx-2 md:mt-[-18px] lg:min-w-[40px]" />
								)}
							</div>
						))}
					</div>

					{/* Active Phase Details */}
					{activePhase && (
						<div className="mb-6 rounded-lg bg-primary/5 p-4 dark:bg-primary/10">
							<h3 className="mb-1 text-lg font-semibold text-foreground">
								{activePhase.title}
							</h3>
							<p className="mb-3 text-sm text-muted-foreground">
								{activePhase.description}
							</p>
							<div className="mb-1 flex items-center justify-between text-sm">
								<span className="font-medium text-foreground">Progress</span>
								<span className="font-medium text-primary">{activePhase.progress}%</span>
							</div>
							<ColoredProgress
								value={activePhase.progress}
								indicatorColorClassName="bg-primary"
								className="h-2"
							/>
						</div>
					)}

					{/* Actions to complete */}
					{activePhase && (
						<div className="space-y-3">
							<h3 className="text-md font-semibold text-foreground">
								Actions to complete
							</h3>
							{activePhase.actions.length > 0 ? (
								activePhase.actions.map((action) => (
									<ActionListItem key={action.id} action={action} onToggleStatus={handleActionToggle} />
								))
							) : (
								<p className="text-sm text-muted-foreground">No actions defined for this phase yet.</p>
							)}
						</div>
					)}
				</CardContent>

				<CardFooter className="flex flex-col gap-2 border-t bg-muted/50 p-6 dark:bg-card/30 sm:flex-row sm:justify-between">
					<Button variant="outline">
						<Download className="mr-2 h-4 w-4" /> Download Plan
					</Button>
					<Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
						<PlusSquare className="mr-2 h-4 w-4" /> Add to Dashboard
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}