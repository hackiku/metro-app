// ~/app/competences/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { supabase } from "~/server/db/supabase"
import { Search } from "lucide-react"
import { Input } from "~/components/ui/input"
import { CompetenceProfile } from "./CompetenceProfile"
import { CompetenceGrid } from "./CompetenceGrid"
import { DevelopmentRecommendations } from "./DevelopmentRecommendations"

// Type definitions
export interface Competence {
	id: string
	name: string
	description: string
	category?: string
	userRating?: number
}

// Filter categories
const CATEGORIES = ["All", "Cognitive", "Interpersonal", "Execution"];

export default function CompetencesPage() {
	const [competences, setCompetences] = useState<Competence[]>([])
	const [filteredCompetences, setFilteredCompetences] = useState<Competence[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [searchQuery, setSearchQuery] = useState("")
	const [activeCategory, setActiveCategory] = useState("All")

	// Fetch competences from Supabase
	useEffect(() => {
		async function fetchCompetences() {
			try {
				setIsLoading(true)

				const { data, error } = await supabase
					.from('competences')
					.select('*')

				if (error) {
					console.error("Error fetching competences:", error)
					return
				}

				// Add random user ratings and categories for demo purposes
				// In a real app, these would come from the user's profile/assessment
				const enhancedData = data.map(comp => ({
					...comp,
					userRating: Math.floor(Math.random() * 40) + 40, // Random rating between 40-80%
					category: assignRandomCategory(comp.id) // Assign a random category
				}));

				setCompetences(enhancedData)
				setFilteredCompetences(enhancedData)
			} catch (error) {
				console.error("Error in competences fetch:", error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchCompetences()
	}, [])

	// Helper function to assign random categories
	function assignRandomCategory(id: string): string {
		// Use a deterministic approach based on ID to ensure consistency
		const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		const categories = ["Cognitive", "Interpersonal", "Execution"];
		return categories[hash % categories.length];
	}

	// Filter competences based on search query and category
	useEffect(() => {
		let filtered = competences;

		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(comp =>
				comp.name.toLowerCase().includes(query) ||
				comp.description.toLowerCase().includes(query)
			);
		}

		// Filter by category
		if (activeCategory !== "All") {
			filtered = filtered.filter(comp => comp.category === activeCategory);
		}

		setFilteredCompetences(filtered);
	}, [searchQuery, activeCategory, competences]);

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Competences</h1>
					<p className="text-muted-foreground">
						Explore and develop key competences for your career growth
					</p>
				</div>

				{/* Search bar */}
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search competences..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Your Competence Profile */}
			<CompetenceProfile
				competences={competences}
				isLoading={isLoading}
			/>

			{/* Competences List */}
			<Tabs
				defaultValue="All"
				value={activeCategory}
				onValueChange={setActiveCategory}
				className="space-y-4"
			>
				<TabsList>
					{CATEGORIES.map((category) => (
						<TabsTrigger key={category} value={category}>
							{category}
						</TabsTrigger>
					))}
				</TabsList>

				{CATEGORIES.map((category) => (
					<TabsContent key={category} value={category} className="space-y-4">
						<CompetenceGrid
							competences={filteredCompetences}
							isLoading={isLoading}
						/>
					</TabsContent>
				))}
			</Tabs>

			{/* Development Recommendations */}
			<DevelopmentRecommendations
				competences={competences}
				isLoading={isLoading}
			/>
		</div>
	)
}