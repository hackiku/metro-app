// src/app/_components/metro/development/JourneyCard.tsx
"use client"

import { useState } from "react"
import {
	MapPin,
	Flag,
	ArrowRight,
	Clock,
	Layers,
	Circle,
	CheckCircle2,
	ChevronDown,
	ChevronUp
} from "lucide-react"
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent
} from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from "~/components/ui/collapsible"

interface DevelopmentStep {
	title: string
	type: "onTheJob" | "socialLearning" | "formalLearning"
	description: string
	durationInWeeks: number
	completed: boolean
}

interface JourneyCardProps {
	currentPosition: {
		name: string
		level: number
	}
	targetPosition: {
		name: string
		level: number
	}
	estimatedMonths: number
	progressPercentage: number
	steps: DevelopmentStep[]
}

export function JourneyCard({
	currentPosition,
	targetPosition,
	estimatedMonths,
	progressPercentage,
	steps
}: JourneyCardProps) {
	const [isExpanded, setIsExpanded] = useState(true)

	const completedSteps = steps.filter(step => step.completed).length
	const totalSteps = steps.length

	const getStepTypeColor = (type: string) => {
		switch (type) {
			case "onTheJob": return "bg-blue-500"
			case "socialLearning": return "bg-purple-500"
			case "formalLearning": return "bg-amber-500"
			default: return "bg-gray-500"
		}
	}

	const getStepTypeLabel = (type: string) => {
		switch (type) {
			case "onTheJob": return "On-the-job"
			case "socialLearning": return "Social learning"
			case "formalLearning": return "Formal learning"
			default: return "Learning"
		}
	}

	if (!isExpanded) {
		return (
			<Button
				variant="outline"
				className="flex items-center gap-2 fixed bottom-4 right-4 z-10 bg-background/90 backdrop-blur-sm"
				onClick={() => setIsExpanded(true)}
			>
				<MapPin className="h-4 w-4 text-primary" />
				<span>View Journey</span>
			</Button>
		)
	}

	return (
		<Card className="w-80 fixed bottom-4 right-4 z-10 shadow-lg bg-background/95 backdrop-blur-sm border-primary/10">
			<CardHeader className="pb-2">
				<div className="flex justify-between items-center">
					<CardTitle className="text-base">Your Development Journey</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0"
						onClick={() => setIsExpanded(false)}
					>
						<ChevronDown className="h-4 w-4" />
					</Button>
				</div>
				<CardDescription>
					<div className="flex items-center text-xs">
						<Badge variant="outline" className="font-normal mr-2">
							{completedSteps}/{totalSteps} steps
						</Badge>
						<Progress value={progressPercentage} className="h-1.5 flex-1" />
					</div>
				</CardDescription>
			</CardHeader>

			<CardContent className="pt-0">
				{/* From-To Section */}
				<div className="flex items-center gap-1 mb-3 text-sm">
					<div className="flex items-center gap-1.5">
						<MapPin className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium">{currentPosition.name}</span>
						<Badge variant="outline" className="h-5 px-1.5 rounded-sm text-xs">
							L{currentPosition.level}
						</Badge>
					</div>

					<ArrowRight className="h-3.5 w-3.5 mx-1 text-muted-foreground" />

					<div className="flex items-center gap-1.5">
						<Flag className="h-4 w-4 text-primary" />
						<span className="font-medium">{targetPosition.name}</span>
						<Badge variant="outline" className="h-5 px-1.5 rounded-sm text-xs">
							L{targetPosition.level}
						</Badge>
					</div>
				</div>

				{/* Estimated time */}
				<div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
					<Clock className="h-3.5 w-3.5" />
					<span>Estimated time: {estimatedMonths} months</span>
				</div>

				{/* Steps List */}
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<Layers className="h-4 w-4 text-primary" />
						<h3 className="text-sm font-medium">Development Steps</h3>
					</div>

					<div className="space-y-2 pl-1">
						{steps.map((step, index) => (
							<Collapsible key={index} className="border rounded-md">
								<div className="flex items-center p-2">
									<div className="flex-shrink-0 mr-2">
										{step.completed ? (
											<CheckCircle2 className="h-5 w-5 text-primary" />
										) : (
											<Circle className="h-5 w-5 text-muted-foreground" />
										)}
									</div>

									<div className="flex-grow min-w-0">
										<div className="flex items-center justify-between">
											<h4 className="text-sm font-medium truncate">
												{step.title}
											</h4>
											<div className="flex items-center gap-1.5">
												<Badge
													className={`px-1.5 py-0 text-xs h-5 text-white ${getStepTypeColor(step.type)}`}
												>
													{getStepTypeLabel(step.type)}
												</Badge>
												<CollapsibleTrigger asChild>
													<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
														<ChevronDown className="h-3.5 w-3.5" />
													</Button>
												</CollapsibleTrigger>
											</div>
										</div>
									</div>
								</div>

								<CollapsibleContent>
									<div className="px-9 pb-2.5 text-xs text-muted-foreground">
										<p className="mb-1.5">{step.description}</p>
										<div className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											<span>{step.durationInWeeks} weeks</span>
										</div>
									</div>
								</CollapsibleContent>
							</Collapsible>
						))}
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end mt-4">
					<Button size="sm" className="gap-1">
						<Flag className="h-3.5 w-3.5" />
						<span>Change Destination</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}