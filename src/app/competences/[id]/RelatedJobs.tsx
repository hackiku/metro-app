// ~/app/competences/[id]/RelatedJobs.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { LineChart, BriefcaseBusiness, Users, Code, ArrowRight, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Competence {
	id: string
	name: string
	description?: string
	category?: string
	userRating?: number
}

interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

interface RelatedJobsProps {
	competence: Competence
	relatedJobs: JobFamily[]
}

export function RelatedJobs({ competence, relatedJobs }: RelatedJobsProps) {
	// Get department icon
	const getDepartmentIcon = (department: string) => {
		switch (department) {
			case "Product & Technology":
				return <Code className="h-5 w-5" />
			case "Commercial":
				return <BriefcaseBusiness className="h-5 w-5" />
			case "People&":
				return <Users className="h-5 w-5" />
			default:
				return <BriefcaseBusiness className="h-5 w-5" />
		}
	}

	// Get department color
	const getDepartmentColor = (department: string) => {
		switch (department) {
			case "Product & Technology":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
			case "Commercial":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
			case "People&":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
			default:
				return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300"
		}
	}

	// Generate importance levels for jobs (random but deterministic)
	const getImportanceLevel = (competenceId: string, jobId: string) => {
		// Simple hash function to create deterministic "random" values
		const combinedHash = competenceId.split('').reduce((acc, char, idx) => {
			return acc + char.charCodeAt(0) * (idx + 1);
		}, 0) + jobId.split('').reduce((acc, char, idx) => {
			return acc + char.charCodeAt(0) * (idx + 1);
		}, 0);

		// Map to importance levels
		const importanceLevels = ["Required", "Core", "Essential", "Key", "Critical"];
		return importanceLevels[combinedHash % importanceLevels.length];
	};

	return (
		<div className="space-y-6">
			<Card className="p-6">
				<h2 className="text-xl font-semibold">Career Relevance</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					How this competence is used across job families
				</p>

				<div className="mt-6 flex items-center justify-center">
					<div className="relative h-32 w-32">
						<LineChart className="h-full w-full text-muted" strokeWidth={1} />
						<div className="absolute inset-0 flex items-center justify-center flex-col">
							<span className="text-3xl font-bold text-primary">{relatedJobs.length}</span>
							<span className="text-xs text-muted-foreground">Job Families</span>
						</div>
					</div>
				</div>

				<div className="mt-4 text-center text-sm text-muted-foreground">
					{competence.name} is required in {relatedJobs.length} different job families across {new Set(relatedJobs.map(job => job.department)).size} departments
				</div>

				<div className="mt-4 text-center">
					<Button variant="outline" size="sm">
						View Career Map
						<ArrowRight className="ml-2 h-3 w-3" />
					</Button>
				</div>
			</Card>

			<Card className="p-6">
				<h2 className="mb-4 text-xl font-semibold">Related Job Families</h2>

				{relatedJobs.length > 0 ? (
					<div className="space-y-4">
						{relatedJobs.map((job) => (
							<Link href={`/job-family/${job.id}`} key={job.id}>
								<Card className="group p-4 transition-all hover:shadow-md">
									<div className="mb-2 flex items-start justify-between">
										<div className="flex gap-3">
											<div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getDepartmentColor(job.department)}`}>
												{getDepartmentIcon(job.department)}
											</div>
											<div>
												<h3 className="font-medium group-hover:text-primary">{job.name}</h3>
												<Badge
													variant="outline"
													className="mt-1 text-xs"
												>
													{job.department}
												</Badge>
											</div>
										</div>
										<Badge
											className="bg-primary/10 text-primary hover:bg-primary/20"
										>
											{getImportanceLevel(competence.id, job.id)}
										</Badge>
									</div>

									<p className="mt-1 pl-11 text-sm text-muted-foreground line-clamp-2">
										{job.description}
									</p>

									<div className="mt-2 pl-11 flex items-center justify-end text-xs text-primary">
										View job family details
										<ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
									</div>
								</Card>
							</Link>
						))}
					</div>
				) : (
					<div className="rounded-lg border p-6 text-center">
						<p className="text-muted-foreground">
							No job families currently require this competence.
						</p>
					</div>
				)}

				{relatedJobs.length > 5 && (
					<div className="mt-4 text-center">
						<Button variant="ghost" size="sm">
							Show all {relatedJobs.length} job families
							<ChevronRight className="ml-1 h-3 w-3" />
						</Button>
					</div>
				)}
			</Card>
		</div>
	)
}