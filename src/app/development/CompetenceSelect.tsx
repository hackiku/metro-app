// src/app/development/CompetenceSelect.tsx
"use client"

import { Competence } from "./data"
import { Brain, Target, Users, Zap, Star } from "lucide-react"
import { Progress } from "~/components/ui/progress"

interface CompetenceSelectProps {
	competences: Competence[]
	selectedId: string
	onSelect: (id: string) => void
}

export default function CompetenceSelect({
	competences,
	selectedId,
	onSelect
}: CompetenceSelectProps) {

	// Helper function to get icon based on category
	const getIcon = (category?: string) => {
		switch (category) {
			case "Cognitive":
				return <Brain className="h-4 w-4" />
			case "Execution":
				return <Target className="h-4 w-4" />
			case "Interpersonal":
				return <Users className="h-4 w-4" />
			default:
				return <Star className="h-4 w-4" />
		}
	}

	if (competences.length === 0) {
		return (
			<div className="rounded-lg border border-neutral-200 p-6 text-center dark:border-neutral-700">
				<p className="text-neutral-500 dark:text-neutral-400">
					No competences available for this job family.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			{competences.map(competence => (
				<div
					key={competence.id}
					className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700 ${selectedId === competence.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-neutral-200 dark:border-neutral-700'
						}`}
					onClick={() => onSelect(competence.id)}
				>
					<div className="flex items-center gap-3">
						<div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedId === competence.id
								? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
								: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
							}`}>
							{getIcon(competence.category)}
						</div>
						<div className="flex-1">
							<h3 className="font-medium">{competence.name}</h3>
							<div className="mt-1 flex items-center justify-between">
								<span className="text-xs text-neutral-500 dark:text-neutral-400">{competence.category || "General"}</span>
								<span className="text-xs font-medium">{competence.userRating || 0}%</span>
							</div>
							<Progress
								value={competence.userRating || 0}
								className="mt-1 h-1"
							/>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}