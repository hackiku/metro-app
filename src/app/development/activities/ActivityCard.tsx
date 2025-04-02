// src/app/development/ActivityCard.tsx
"use client"

import { DevelopmentActivity } from "../data"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { BookOpen, Users, Briefcase, PlusCircle, CheckCircle } from "lucide-react"
import { useState } from "react"

interface ActivityCardProps {
	activity: DevelopmentActivity
}

export default function ActivityCard({ activity }: ActivityCardProps) {
	const [isAdded, setIsAdded] = useState(false)

	// Helper function to get icon based on activity type
	const getIcon = () => {
		switch (activity.activityType) {
			case "job":
				return <Briefcase className="h-5 w-5" />
			case "social":
				return <Users className="h-5 w-5" />
			case "formal":
				return <BookOpen className="h-5 w-5" />
			default:
				return <BookOpen className="h-5 w-5" />
		}
	}

	// Helper function to get background color based on activity type
	const getColor = () => {
		switch (activity.activityType) {
			case "job":
				return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
			case "social":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
			case "formal":
				return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
			default:
				return "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
		}
	}

	// Helper function to get activity type label
	const getTypeLabel = () => {
		switch (activity.activityType) {
			case "job":
				return "On the Job"
			case "social":
				return "Social Learning"
			case "formal":
				return "Formal Learning"
			default:
				return "Learning Activity"
		}
	}

	return (
		<Card className="flex h-full flex-col justify-between bg-white p-5 shadow-md dark:bg-neutral-800">
			<div>
				<div className="mb-3 flex items-center gap-3">
					<div className={`flex h-10 w-10 items-center justify-center rounded-full ${getColor()}`}>
						{getIcon()}
					</div>
					<span className={`rounded-full px-2 py-1 text-xs font-medium ${getColor()}`}>
						{getTypeLabel()}
					</span>
				</div>

				<p className="mb-4">{activity.description}</p>
			</div>

			<Button
				variant={isAdded ? "default" : "outline"}
				className="w-full"
				onClick={() => setIsAdded(!isAdded)}
			>
				{isAdded ? (
					<>
						<CheckCircle className="mr-2 h-4 w-4" />
						Added to Plan
					</>
				) : (
					<>
						<PlusCircle className="mr-2 h-4 w-4" />
						Add to Development Plan
					</>
				)}
			</Button>
		</Card>
	)
}