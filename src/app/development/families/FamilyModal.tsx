// src/app/development/families/FamilyModal.tsx
"use client"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import { BriefcaseBusiness, Users, Code } from "lucide-react"

interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

interface FamilyModalProps {
	family: JobFamily | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export default function FamilyModal({ family, open, onOpenChange }: FamilyModalProps) {
	if (!family) return null

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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center justify-between">
						{family.name}
						<Badge variant="outline" className={`flex items-center gap-1 ${getDepartmentColor(family.department)}`}>
							{getDepartmentIcon(family.department)}
							{family.department}
						</Badge>
					</DialogTitle>
					<DialogDescription>
						{family.description}
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-4">
					<div>
						<h4 className="mb-2 font-medium">Key Responsibilities</h4>
						<ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
							<li>Strategic planning and roadmap development</li>
							<li>Stakeholder management and communication</li>
							<li>Feature prioritization and backlog management</li>
							<li>Cross-functional team coordination</li>
							<li>Market research and competitive analysis</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-2 font-medium">Core Competences</h4>
						<div className="flex flex-wrap gap-2">
							<Badge variant="secondary">Problem Analysis</Badge>
							<Badge variant="secondary">Planning & Organizing</Badge>
							<Badge variant="secondary">Result-Orientedness</Badge>
							<Badge variant="secondary">Persuasiveness</Badge>
							<Badge variant="secondary">Innovative Power</Badge>
						</div>
					</div>

					<div>
						<h4 className="mb-2 font-medium">Career Path</h4>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span className="rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/20">Junior</span>
							<span>→</span>
							<span className="rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/20">Medior</span>
							<span>→</span>
							<span className="rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/20">Senior</span>
							<span>→</span>
							<span className="rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/20">Lead</span>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}