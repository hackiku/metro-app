// src/app/route/CareerRoutePlanPage.tsx
"use client";

// Remove useState import if not needed for other things
import { useState, useEffect, useMemo } from "react";
import { MapPinned, Download, PlusSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { ColoredProgress } from "~/components/ui/colored-progress";
// Remove import of static data: import { careerRoutePlanData } from "./data";
import { PhaseStepItem } from "./PhaseStepItem";
import { ActionListItem } from "./ActionListItem";
import { cn } from "~/lib/utils";
import { useCareerPlan } from "~/contexts/CareerPlanContext"; // Import the context hook
import { Skeleton } from "~/components/ui/skeleton"; // Import Skeleton
import { type ActionItem, type RoutePhase } from "./types"; // Import types locally if needed

export function CareerRoutePlanPage() {
	// Get the active plan and actions from the context
	const { activePlan, updatePlanAction, isLoading, error } = useCareerPlan();
	const [activePhaseId, setActivePhaseId] = useState<string | null>(null);

	// Effect to set the initial active phase when the plan loads
	useEffect(() => {
		if (activePlan?.phases && activePlan.phases.length > 0 && !activePhaseId) {
			setActivePhaseId(activePlan.phases[0].id);
		}
		// Reset active phase if activePlan changes (e.g., becomes null)
		else if (!activePlan && activePhaseId) {
			setActivePhaseId(null);
		}
	}, [activePlan, activePhaseId]);

	// Find the currently selected phase object
	const activePhase = useMemo(() => {
		return activePlan?.phases?.find(p => p.id === activePhaseId);
	}, [activePlan, activePhaseId]);

	// Calculate progress for the active phase (example)
	const calculatePhaseProgress = (phase: RoutePhase | undefined): number => {
		if (!phase?.actions || phase.actions.length === 0) return 0;
		const completedActions = phase.actions.filter(a => a.status === 'completed').length;
		return Math.round((completedActions / phase.actions.length) * 100);
	};

	const currentPhaseProgress = calculatePhaseProgress(activePhase);

	const handlePhaseClick = (phaseId: string) => {
		setActivePhaseId(phaseId);
	};

	// Use the action update function from the context
	const handleActionToggle = (actionId: string, newStatus: ActionItem['status']) => {
		updatePlanAction(actionId, newStatus);
		// Note: Progress calculation now happens based on updated activePlan data from context
	};

	// --- Loading and Error States ---
	if (isLoading) {
		return (
			<div className="animate-pulse space-y-6">
				{/* Header Skeleton */}
				<div className="mb-6 flex items-start gap-4">
					<Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
					<div className="flex-1">
						<Skeleton className="h-8 w-1/3 mb-2" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</div>
				<Skeleton className="h-6 w-full mb-8" /> {/* Subtitle Skeleton */}

				{/* Card Skeleton */}
				<Card className="shadow-sm">
					<CardHeader className="p-6">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<Skeleton className="h-10 w-48" />
							<Skeleton className="h-10 w-32" />
						</div>
					</CardHeader>
					<CardContent className="p-6 space-y-8">
						<Skeleton className="h-24 w-full" /> {/* Stepper Skeleton */}
						<Skeleton className="h-32 w-full" /> {/* Active Phase Details Skeleton */}
						<Skeleton className="h-48 w-full" /> {/* Actions Skeleton */}
					</CardContent>
					<CardFooter className="p-6">
						<Skeleton className="h-10 w-full" />
					</CardFooter>
				</Card>
			</div>
		);
	}

	if (error) {
		return <div className="p-4 text-red-600">Error loading career plan: {error}</div>;
	}

	if (!activePlan) {
		return <div className="p-6 text-center text-muted-foreground">No active career plan found for this user.</div>;
	}

	// --- Render actual content ---
	// Extract data from activePlan for clarity
	const planTitle = "Career Route Plan"; // Or derive if needed
	const planSubtitle = `Your personalized development path to become ${activePlan.target_position_details?.positions?.name || 'your target role'}`;
	const planDescription = activePlan.notes || "Follow the phases and actions below to achieve your career goal."; // Use plan notes or default
	const targetRoleName = activePlan.target_position_details?.positions?.name || 'Target Role';
	const totalDuration = activePlan.estimated_total_duration || 'N/A';

	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-6 flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<MapPinned className="h-6 w-6" />
				</div>
				<div>
					<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
						{planTitle}
					</h1>
					<p className="text-muted-foreground">
						{planSubtitle}
					</p>
				</div>
			</div>

			<p className="mb-8 text-muted-foreground">
				{planDescription}
			</p>

			<Card className="shadow-sm dark:bg-card">
				<CardHeader className="p-6">
					<div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
						<div>
							<h3 className="text-sm text-muted-foreground">Destination</h3>
							<h2 className="text-xl font-semibold text-foreground">
								{targetRoleName}
							</h2>
						</div>
						<div className="text-left sm:text-right">
							<h3 className="text-sm text-muted-foreground">Est. Total Duration</h3>
							<p className="text-lg font-medium text-foreground">
								{totalDuration}
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className="p-6">
					{/* Phase Stepper */}
					<div className="mb-8 flex items-start overflow-x-auto pb-2">
						{activePlan.phases && activePlan.phases.map((phase, index) => (
							<div key={phase.id} className="flex items-start">
								<PhaseStepItem
									number={phase.sequence} // Use sequence for numbering
									title={phase.title}
									duration={phase.duration ?? ""}
									isActive={phase.id === activePhaseId}
									onClick={() => handlePhaseClick(phase.id)}
									isCompleted={calculatePhaseProgress(phase) === 100} // Optional: mark completed phases
								/>
								{index < activePlan.phases!.length - 1 && (
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
								<span className="font-medium text-foreground">Phase Progress</span>
								<span className="font-medium text-primary">{currentPhaseProgress}%</span>
							</div>
							<ColoredProgress
								value={currentPhaseProgress}
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
							{activePhase.actions && activePhase.actions.length > 0 ? (
								activePhase.actions.map((action) => (
									// Ensure ActionListItem receives the correct type
									<ActionListItem
										key={action.id}
										action={action as ActionItem} // Cast if types mismatch slightly
										onToggleStatus={handleActionToggle}
									/>
								))
							) : (
								<p className="text-sm text-muted-foreground">No actions defined for this phase yet.</p>
							)}
						</div>
					)}
				</CardContent>

				<CardFooter className="flex flex-col gap-2 border-t bg-muted/50 p-6 dark:bg-card/30 sm:flex-row sm:justify-between">
					<Button variant="outline" disabled> {/* Disable buttons for now */}
						<Download className="mr-2 h-4 w-4" /> Download Plan
					</Button>
					<Button className="w-full sm:w-auto" disabled> {/* Disable buttons for now */}
						<PlusSquare className="mr-2 h-4 w-4" /> Add to Dashboard
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}