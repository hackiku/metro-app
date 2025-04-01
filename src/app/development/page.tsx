// src/app/development/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Navbar } from "~/app/_components/layout/Navbar"
import { Sidebar } from "~/app/_components/layout/Sidebar"
import { Card } from "~/components/ui/card"
import JobFamiliesSlider from "./families/JobFamiliesSlider"
import CompetenceSelect from "./CompetenceSelect"
import DevelopmentGuide from "./activities/DevelopmentGuide"
import LearningTabs from "./activities/LearningTabs"
import { supabase } from "~/server/db/supabase"
import { Competence, DevelopmentActivity } from "./data" // Keep the interfaces

export default function DevelopmentPage() {
	const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
	const [selectedCompetence, setSelectedCompetence] = useState<string | null>(null)
	const [competences, setCompetences] = useState<Competence[]>([])
	const [activities, setActivities] = useState<DevelopmentActivity[]>([])
	const [isLoading, setIsLoading] = useState(true)

	// Fetch competences based on selected job family
	useEffect(() => {
		async function fetchCompetences() {
			if (!selectedFamily) return

			try {
				setIsLoading(true)

				// First approach - using a join (if your job_family_competences table is ready)
				const { data, error } = await supabase
					.from('job_family_competences')
					.select(`
            competence_id,
            competences:competence_id (
              id, name, description, category, user_rating
            )
          `)
					.eq('job_family_id', selectedFamily)

				if (error) {
					console.error("Error fetching competences:", error)

					// Fallback - if the join table isn't working, just get all competences
					const { data: allCompetences, error: allError } = await supabase
						.from('competences')
						.select('*')

					if (allError) {
						console.error("Error fetching all competences:", allError)
						return
					}

					setCompetences(allCompetences || [])
					if (allCompetences && allCompetences.length > 0) {
						setSelectedCompetence(allCompetences[0].id)
					}
					return
				}

				// Transform the joined data to match our Competence interface
				const transformedData: Competence[] = data.map(item => ({
					...item.competences,
					// Add any default values or transformations needed
					category: item.competences.category || "General",
					userRating: item.competences.user_rating || 50
				}))

				setCompetences(transformedData)
				if (transformedData.length > 0) {
					setSelectedCompetence(transformedData[0].id)
				}
			} catch (error) {
				console.error("Error in competences fetch:", error)
				// Fallback to local data if needed
			} finally {
				setIsLoading(false)
			}
		}

		fetchCompetences()
	}, [selectedFamily])

	// Fetch activities based on selected competence
	useEffect(() => {
		async function fetchActivities() {
			if (!selectedCompetence) return

			try {
				const { data, error } = await supabase
					.from('development_activities')
					.select('*')
					.eq('competence_id', selectedCompetence)

				if (error) {
					console.error("Error fetching activities:", error)
					return
				}

				setActivities(data || [])
			} catch (error) {
				console.error("Error in activities fetch:", error)
			}
		}

		fetchActivities()
	}, [selectedCompetence])

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

					{/* Job Families Slider */}
					<JobFamiliesSlider
						selectedFamily={selectedFamily}
						onSelectFamily={setSelectedFamily}
					/>

					<div className="grid gap-6 md:grid-cols-3">
						<div className="md:col-span-1">
							<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
								<h2 className="mb-4 text-xl font-semibold">Competences</h2>
								{isLoading ? (
									<div className="space-y-3">
										{Array.from({ length: 4 }).map((_, i) => (
											<div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
										))}
									</div>
								) : (
									<CompetenceSelect
										competences={competences}
										selectedId={selectedCompetence || ''}
										onSelect={setSelectedCompetence}
									/>
								)}
							</Card>
						</div>

						<div className="md:col-span-2">
							<DevelopmentGuide
								competence={competences.find(c => c.id === selectedCompetence)}
							/>

							<div className="mt-6">
								<LearningTabs activities={activities} />
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}