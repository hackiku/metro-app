// src/app/development/DevelopmentGuide.tsx
"use client"

import { Competence } from "./data"
import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { BookOpen } from "lucide-react"

interface DevelopmentGuideProps {
	competence?: Competence
}

export default function DevelopmentGuide({ competence }: DevelopmentGuideProps) {
	if (!competence) return null

	return (
		<Card className="bg-white shadow-md dark:bg-gray-800">
			<div className="border-b border-gray-200 p-6 dark:border-gray-700">
				<h2 className="text-xl font-semibold">{competence.name}</h2>
				<p className="mt-2 text-gray-600 dark:text-gray-300">
					{competence.description}
				</p>
			</div>

			<div className="p-6">
				<div className="mb-6">
					<div className="mb-2 flex items-center justify-between">
						<span className="text-sm font-medium">Your proficiency</span>
						<span className="text-sm font-medium">{competence.userRating}%</span>
					</div>
					<Progress
						value={competence.userRating}
						className="h-2 w-full"
					/>
				</div>

				<div className="space-y-4">
					<div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
						<h3 className="mb-2 font-medium text-blue-800 dark:text-blue-300">Development Tips</h3>
						<p className="text-sm text-blue-800 dark:text-blue-300">
							Select learning activities below that align with your development goals. Follow the 70-20-10 approach:
							70% on-the-job learning, 20% social learning, and 10% formal training.
						</p>
					</div>

					<Button variant="outline" className="w-full">
						<BookOpen className="mr-2 h-4 w-4" />
						Download Full Development Guide
					</Button>
				</div>
			</div>
		</Card>
	)
}