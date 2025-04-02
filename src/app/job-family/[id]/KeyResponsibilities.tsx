// src/app/job-family/[id]/KeyResponsibilities.tsx
"use client"

import { Card } from "~/components/ui/card"
import { CheckCircle2, HelpCircle } from "lucide-react"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip"

interface Responsibility {
	title: string
	description: string
}

interface KeyResponsibilitiesSectionProps {
	responsibilities?: Responsibility[]
}

// Default responsibilities if none provided
const DEFAULT_RESPONSIBILITIES: Responsibility[] = [
	{
		title: "Strategic Planning",
		description: "Develop and implement strategic plans and initiatives aligned with organizational goals."
	},
	{
		title: "Stakeholder Management",
		description: "Build and maintain relationships with key stakeholders across the organization."
	},
	{
		title: "Analysis & Reporting",
		description: "Analyze data and prepare reports to inform decision-making and track performance."
	},
	{
		title: "Process Optimization",
		description: "Identify opportunities for process improvement and implement solutions to enhance efficiency."
	},
	{
		title: "Team Collaboration",
		description: "Work effectively with cross-functional teams to achieve shared objectives."
	}
]

export function KeyResponsibilitiesSection({
	responsibilities = DEFAULT_RESPONSIBILITIES
}: KeyResponsibilitiesSectionProps) {
	return (
		<Card className="p-6">
			<h2 className="text-xl font-semibold">Key Responsibilities</h2>
			<p className="text-sm text-muted-foreground">
				Core responsibilities and expectations for this job family
			</p>

			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				{responsibilities.map((resp, index) => (
					<TooltipProvider key={index}>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex cursor-help items-start gap-2 rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
									<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
									<div>
										<h3 className="font-medium">{resp.title}</h3>
									</div>
								</div>
							</TooltipTrigger>
							<TooltipContent className="max-w-sm p-3">
								<p>{resp.description}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				))}
			</div>

			<div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
				<HelpCircle className="h-3 w-3" />
				<span>Hover over each responsibility for more details</span>
			</div>
		</Card>
	)
}