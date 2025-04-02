// src/app/job-family/[id]/JobFamilyHeader.tsx
"use client"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Code, BriefcaseBusiness, Users, Briefcase, ArrowRight, Star } from "lucide-react"
import Image from "next/image"

interface JobFamilyHeaderProps {
	name: string
	description: string
	department: string
	impactLevel?: string
	teamSize?: number
}

export function JobFamilyHeader({
	name,
	description,
	department,
	impactLevel = "Organization-wide",
	teamSize = 15
}: JobFamilyHeaderProps) {
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
				return <Briefcase className="h-5 w-5" />
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

	return (
		<div className="grid gap-6 md:grid-cols-2">
			<div className="flex flex-col justify-center">
				<div className="flex flex-wrap items-center gap-2">
					<h1 className="text-3xl font-bold tracking-tight">{name}</h1>
					<Badge variant="outline" className={`flex items-center gap-1 ${getDepartmentColor(department)}`}>
						{getDepartmentIcon(department)}
						{department}
					</Badge>
				</div>

				<p className="mt-2 text-muted-foreground">
					{description}
				</p>

				<div className="mt-4 flex flex-wrap gap-6 text-sm">
					<div className="flex items-center gap-2">
						<Star className="h-4 w-4 text-primary" />
						<span>Impact Level: <span className="font-medium">{impactLevel}</span></span>
					</div>
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-primary" />
						<span>Typical Team Size: <span className="font-medium">{teamSize}</span></span>
					</div>
				</div>

				<div className="mt-6 flex flex-wrap gap-3">
					<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
						View Development Path
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
					<Button variant="outline">
						Explore Competences
					</Button>
				</div>
			</div>

			<div className="flex items-center justify-center">
				<div className="aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-muted">
					<div className="relative h-full w-full">
						{/* Placeholder image - replace with actual image when available */}
						<div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
							{getDepartmentIcon(department)}
							<span className="ml-2">{department} Role Illustration</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}