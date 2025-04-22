"use client"

// src/app/_components/metro/ui/details/RoleDetails.tsx
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
	Briefcase,
	GraduationCap,
	Calendar,
	ArrowRight,
	CheckCircle,
	AlertCircle,
	Star
} from "lucide-react";
import type { Role, SkillGap, Transition } from "../../types";

interface RoleDetailsProps {
	role: Role;
	pathColor: string;
	skillGaps: SkillGap[];
	transitions: Transition[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isCurrentRole?: boolean;
	isTargetRole?: boolean;
	onSetAsTarget?: (roleId: string) => void;
}

export default function RoleDetails({
	role,
	pathColor,
	skillGaps,
	transitions,
	open,
	onOpenChange,
	isCurrentRole = false,
	isTargetRole = false,
	onSetAsTarget
}: RoleDetailsProps) {
	// Group skill gaps by their size
	const noGapSkills = skillGaps.filter(gap => gap.gap === 0);
	const smallGapSkills = skillGaps.filter(gap => gap.gap > 0 && gap.gap <= 1);
	const mediumGapSkills = skillGaps.filter(gap => gap.gap > 1 && gap.gap <= 2);
	const largeGapSkills = skillGaps.filter(gap => gap.gap > 2);

	// Get outgoing transitions (possible paths from this role)
	const outgoingTransitions = transitions.filter(t => t.fromRoleId === role.id);

	// Calculate total development time (in weeks)
	const totalDevelopmentTime = outgoingTransitions.reduce((total, transition) => {
		const stepsTotalWeeks = transition.developmentSteps.reduce(
			(sum, step) => sum + step.durationWeeks, 0
		);
		return total + stepsTotalWeeks;
	}, 0);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-2xl">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="flex items-center text-xl font-semibold">
								{role.name}
								<Badge className="ml-2" variant="outline">Level {role.level}</Badge>

								{isCurrentRole && (
									<Badge className="ml-2 bg-indigo-600">Current Role</Badge>
								)}

								{isTargetRole && (
									<Badge className="ml-2 bg-amber-600">Target Role</Badge>
								)}
							</DialogTitle>
							<DialogDescription className="mt-1">
								{role.description}
							</DialogDescription>
						</div>

						<div
							className="h-6 w-6 rounded-full"
							style={{ backgroundColor: pathColor }}
						/>
					</div>
				</DialogHeader>

				<div className="mt-4 space-y-6">
					{/* Required Skills Section */}
					<div>
						<h3 className="mb-2 flex items-center font-medium">
							<Briefcase className="mr-2 h-4 w-4" />
							Required Skills
						</h3>

						<div className="space-y-4">
							{role.requiredSkills.length > 0 ? (
								<div className="grid gap-3">
									{role.requiredSkills.map((skill) => {
										// Find the corresponding gap
										const gap = skillGaps.find(g => g.skillId === skill.skillId);
										const gapValue = gap?.gap || 0;
										const currentLevel = gap?.currentLevel || 0;

										return (
											<div key={skill.skillId} className="space-y-1">
												<div className="flex items-center justify-between">
													<span className="text-sm font-medium">{skill.skillName}</span>
													<div className="flex items-center">
														<span className="text-xs text-muted-foreground">
															{currentLevel} / {skill.requiredLevel}
														</span>
														{gapValue > 0 ? (
															<AlertCircle className="ml-1 h-3 w-3 text-amber-500" />
														) : (
															<CheckCircle className="ml-1 h-3 w-3 text-green-500" />
														)}
													</div>
												</div>
												<Progress value={(currentLevel / skill.requiredLevel) * 100} className="h-1.5" />
											</div>
										);
									})}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">No specific skills required.</p>
							)}
						</div>
					</div>

					{/* Skill Gap Analysis */}
					{skillGaps.length > 0 && (skillGaps.some(gap => gap.gap > 0)) && (
						<div>
							<h3 className="mb-2 flex items-center font-medium">
								<GraduationCap className="mr-2 h-4 w-4" />
								Skill Gap Analysis
							</h3>

							<div className="rounded-md bg-muted/40 p-3">
								{largeGapSkills.length > 0 && (
									<div className="mb-3">
										<h4 className="text-sm font-medium text-amber-600">Significant Gaps</h4>
										<p className="mt-1 text-sm text-muted-foreground">
											These skills need substantial development:
										</p>
										<div className="mt-2 flex flex-wrap gap-2">
											{largeGapSkills.map(gap => (
												<Badge key={gap.skillId} variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
													{gap.skillName} (+{gap.gap})
												</Badge>
											))}
										</div>
									</div>
								)}

								{mediumGapSkills.length > 0 && (
									<div className="mb-3">
										<h4 className="text-sm font-medium text-blue-600">Moderate Gaps</h4>
										<div className="mt-2 flex flex-wrap gap-2">
											{mediumGapSkills.map(gap => (
												<Badge key={gap.skillId} variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
													{gap.skillName} (+{gap.gap})
												</Badge>
											))}
										</div>
									</div>
								)}

								{smallGapSkills.length > 0 && (
									<div className="mb-3">
										<h4 className="text-sm font-medium text-green-600">Minor Gaps</h4>
										<div className="mt-2 flex flex-wrap gap-2">
											{smallGapSkills.map(gap => (
												<Badge key={gap.skillId} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
													{gap.skillName} (+{gap.gap})
												</Badge>
											))}
										</div>
									</div>
								)}

								{noGapSkills.length > 0 && (
									<div>
										<h4 className="text-sm font-medium text-green-600">Skills You Have</h4>
										<div className="mt-2 flex flex-wrap gap-2">
											{noGapSkills.map(gap => (
												<Badge key={gap.skillId} variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
													{gap.skillName}
												</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Development Opportunities */}
					{outgoingTransitions.length > 0 && (
						<div>
							<h3 className="mb-2 flex items-center font-medium">
								<Calendar className="mr-2 h-4 w-4" />
								Development Path
							</h3>

							<div className="space-y-3">
								{outgoingTransitions.map(transition => {
									const totalWeeks = transition.developmentSteps.reduce(
										(sum, step) => sum + step.durationWeeks, 0
									);
									const months = Math.round(totalWeeks / 4);

									return (
										<div
											key={transition.id}
											className="rounded-md border border-border p-3"
										>
											<div className="flex items-center justify-between">
												<h4 className="font-medium">{transition.toRoleId}</h4>
												<Badge variant={transition.isRecommended ? "default" : "outline"}>
													{transition.isRecommended ? "Recommended" : "Optional"}
												</Badge>
											</div>

											<p className="mt-1 text-sm text-muted-foreground">
												Estimated time: {months} months
											</p>

											<div className="mt-3 space-y-2">
												<h5 className="text-xs font-medium uppercase text-muted-foreground">
													Development Steps
												</h5>
												{transition.developmentSteps.map((step, index) => (
													<div key={step.id} className="flex items-start gap-2">
														<div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
															{index + 1}
														</div>
														<div>
															<p className="text-sm font-medium">{step.name}</p>
															<p className="text-xs text-muted-foreground">
																{step.description}
															</p>
															<div className="mt-1 flex items-center gap-2">
																<Badge variant="outline" className="text-xs">
																	{step.type}
																</Badge>
																<span className="text-xs text-muted-foreground">
																	{step.durationWeeks} weeks
																</span>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Action buttons */}
				<div className="mt-4 flex justify-between">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>

					{!isCurrentRole && !isTargetRole && onSetAsTarget && (
						<Button onClick={() => onSetAsTarget(role.id)}>
							Set as Target
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}