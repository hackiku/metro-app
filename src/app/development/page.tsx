// src/app/development/page.tsx
"use client"

import { useState } from "react"
import { Navbar } from "~/app/_components/layout/Navbar"
import { Sidebar } from "~/app/_components/layout/Sidebar"
import { Card } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { BookOpen, Target, Book, BookMarked, Brain } from "lucide-react"
import CompetenceSelect from "./CompetenceSelect"
import DevelopmentGuide from "./DevelopmentGuide"
import ActivityCard from "./ActivityCard"
import LearningTabs from "./LearningTabs"
import { competences, developmentActivities } from "./data"

export default function DevelopmentPage() {
	const [selectedCompetence, setSelectedCompetence] = useState(competences[0].id)

	// Filter activities for the selected competence
	const filteredActivities = developmentActivities.filter(
		activity => activity.competenceId === selectedCompetence
	)

	return (
		<div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
			<Sidebar />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar />

				<main className="flex-1 overflow-auto p-6">
					<div className="mb-8">
						<h1 className="text-3xl font-bold tracking-tight">Development Plan</h1>
						<p className="text-gray-500 dark:text-gray-400">
							Build your skills and competences with structured learning activities
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						<div className="md:col-span-1">
							<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
								<h2 className="mb-4 text-xl font-semibold">Competences</h2>
								<CompetenceSelect
									competences={competences}
									selectedId={selectedCompetence}
									onSelect={setSelectedCompetence}
								/>
							</Card>
						</div>

						<div className="md:col-span-2">
							<DevelopmentGuide
								competence={competences.find(c => c.id === selectedCompetence)}
							/>

							<div className="mt-6">
								<LearningTabs activities={filteredActivities} />
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}