// src/app/job-family/[id]/CareerProgressionSection.tsx
"use client"

import { Card } from "~/components/ui/card"
import { ArrowRight, TrendingUp, DollarSign, Landmark, Clock } from "lucide-react"

interface CareerLevel {
	name: string
	description: string
	yearsExperience: string
	impactScope: string
	salaryCap?: string
}

interface CareerProgressionSectionProps {
	levels?: CareerLevel[]
	jobFamilyName: string
}

// Default career levels if none provided
const DEFAULT_LEVELS: CareerLevel[] = [
	{
		name: "Junior",
		description: "Entry-level position focusing on learning and developing core skills",
		yearsExperience: "0-2 years",
		impactScope: "Team-level contributions",
		salaryCap: "Entry level compensation"
	},
	{
		name: "Medior",
		description: "Proficient in core responsibilities with growing autonomy",
		yearsExperience: "2-5 years",
		impactScope: "Department-level impact",
		salaryCap: "Mid-level compensation"
	},
	{
		name: "Senior",
		description: "Expert in the field with significant autonomy and responsibility",
		yearsExperience: "5+ years",
		impactScope: "Cross-functional impact",
		salaryCap: "Senior-level compensation"
	},
	{
		name: "Lead",
		description: "Strategic leadership role with organization-wide influence",
		yearsExperience: "8+ years",
		impactScope: "Organization-wide impact",
		salaryCap: "Leadership compensation"
	}
]

export function CareerProgressionSection({
	levels = DEFAULT_LEVELS,
	jobFamilyName
}: CareerProgressionSectionProps) {
	return (
		<Card className="p-6">
			<h2 className="text-xl font-semibold">Career Progression</h2>
			<p className="text-sm text-muted-foreground">
				Typical career path within the {jobFamilyName} job family
			</p>

			<div className="mt-6 space-y-8">
				<div className="flex flex-wrap items-center gap-2 text-sm">
					{levels.map((level, index) => (
						<div key={level.name} className="flex items-center">
							<span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
								{level.name}
							</span>
							{index < levels.length - 1 && (
								<ArrowRight className="mx-1 h-4 w-4 text-muted-foreground" />
							)}
						</div>
					))}
				</div>

				<div className="space-y-6">
					{levels.map(level => (
						<div
							key={level.name}
							className="relative rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
						>
							<div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-primary" />
							<h3 className="text-lg font-medium">{level.name}</h3>
							<p className="mt-1 text-sm text-muted-foreground">{level.description}</p>

							<div className="mt-3 grid gap-2 sm:grid-cols-3">
								<div className="flex items-center gap-2 text-xs">
									<Clock className="h-3.5 w-3.5 text-muted-foreground" />
									<span>{level.yearsExperience}</span>
								</div>
								<div className="flex items-center gap-2 text-xs">
									<TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
									<span>{level.impactScope}</span>
								</div>
								{level.salaryCap && (
									<div className="flex items-center gap-2 text-xs">
										<DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
										<span>{level.salaryCap}</span>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	)
}