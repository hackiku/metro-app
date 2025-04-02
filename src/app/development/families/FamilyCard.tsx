// src/app/development/families/FamilyCard.tsx
"use client"

import { Card } from "~/components/ui/card"
import { MessageCircleQuestion } from "lucide-react"
import { Button } from "~/components/ui/button"

interface JobFamily {
	id: string
	name: string
	description: string
	department: string
}

interface FamilyCardProps {
	family: JobFamily
	isSelected: boolean
	onSelect: (id: string) => void
	onShowDetails: (family: JobFamily) => void
}

export default function FamilyCard({
	family,
	isSelected,
	onSelect,
	onShowDetails
}: FamilyCardProps) {
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

	// Prevent text selection (which interferes with dragging)
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
	}

	return (
		<Card
			className={`relative flex h-40 w-72 min-w-[18rem] flex-col p-5 transition-all hover:shadow-md ${isSelected
					? 'border-2 border-indigo-500 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/20'
					: 'bg-card'
				}`}
			onClick={() => onSelect(family.id)}
			onMouseDown={handleMouseDown}
		>
			{isSelected && (
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-2 top-2 h-8 w-8 rounded-full"
					onClick={(e) => {
						e.stopPropagation()
						onShowDetails(family)
					}}
				>
					<MessageCircleQuestion className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
				</Button>
			)}

			<div className="mb-3 flex flex-col">
				<h3 className="font-semibold">{family.name}</h3>
				<span className={`mt-1 self-start rounded-full px-2 py-0.5 text-xs ${getDepartmentColor(family.department)}`}>
					{family.department}
				</span>
			</div>

			<p className="text-sm text-card-foreground line-clamp-3">
				{family.description}
			</p>
		</Card>
	)
}