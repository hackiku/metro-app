// src/app/development/page.tsx
"use client"

import { useState, useEffect } from "react"
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

				// Simplified approach - just fetch all competences for now
				const { data, error } = await supabase
					.from('competences')
					.select('*')

				if (error) {
					console.error("Error fetching competences:", error)
					return
				}

				// Transform the data to match our Competence interface
				const transformedData: Competence[] = data.map(item => ({
					id: item.id,
					name: item.name,
					description: item.description,
					// Add default values for potentially missing fields
					category: item.category || "General",
					userRating: item.user_rating || 50 // Note the snake_case to camelCase conversion
				}))

				setCompetences(transformedData)
				if (transformedData.length > 0) {
					setSelectedCompetence(transformedData[0].id)
				}
			} catch (error) {
				console.error("Error in competences fetch:", error)
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
		<div className="space-y-6 p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Development Plan</h1>
				<p className="text-muted-foreground">
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
					<Card className="p-6">
						<h2 className="mb-4 text-xl font-semibold">Competences</h2>
						{isLoading ? (
							<div className="space-y-3">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
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
		</div>
	)
}