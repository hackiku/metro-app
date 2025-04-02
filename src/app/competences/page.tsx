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
// Explicitly type the expected data from Supabase for competence
// Adjust if your actual schema differs (e.g., if columns can be null)
interface SupabaseCompetence {
	id: string; // Assuming id is always a non-null string from DB
	name: string;
	description: string;
	// Add other fields selected by '*' if needed for typing
}

// Type definition used within the component
export interface Competence extends SupabaseCompetence {
	category?: string // Optional because it's added client-side
	userRating?: number // Optional because it's added client-side
}

// Filter categories
const CATEGORIES = ["All", "Cognitive", "Interpersonal", "Execution"];
const BASE_CATEGORIES = ["Cognitive", "Interpersonal", "Execution"]; // For assignment

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

				// Add type hint for Supabase fetch
				const { data, error } = await supabase
					.from('competences')
					.select('*') // Consider selecting only necessary columns
					.returns<SupabaseCompetence[]>() // Helps TS understand the expected data shape

				if (error) {
					console.error("Error fetching competences:", error)
					// Set loading to false on error before returning
					setIsLoading(false);
					return
				}

				// Ensure data is not null/undefined before proceeding
				if (!data) {
					console.error("No competence data received from Supabase.");
					setCompetences([]);
					setFilteredCompetences([]);
					setIsLoading(false);
					return;
				}

				// Add random user ratings and categories for demo purposes
				const enhancedData: Competence[] = data.map(comp => {
					// Ensure comp.id exists and is a string before calling assignRandomCategory
					const category = comp.id ? assignRandomCategory(comp.id) : "General"; // Assign default if id is missing/falsy
					return {
						...comp,
						userRating: Math.floor(Math.random() * 40) + 40, // Random rating 40-80%
						category: category
					};
				});

				setCompetences(enhancedData)
				// Initialize filtered competences with the full fetched & enhanced list
				setFilteredCompetences(enhancedData)

			} catch (error) {
				console.error("Error in competences fetch:", error)
				// Ensure loading state is updated even if an unexpected error occurs
				setCompetences([]);
				setFilteredCompetences([]);
			} finally {
				setIsLoading(false)
			}
		}

		fetchCompetences()
	}, []) // Empty dependency array means this runs once on mount

	// Helper function to assign random categories
	function assignRandomCategory(id: string): string {
		// Use a deterministic approach based on ID to ensure consistency
		// Check for empty string just in case, although handled before calling now
		if (!id) {
			return "General";
		}
		const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
		// Use the base categories for assignment logic
		// --- FIX STARTS HERE ---
		// Add non-null assertion `!` because BASE_CATEGORIES is guaranteed non-empty
		// and the modulo result will always be a valid index.
		return BASE_CATEGORIES.length > 0
			? BASE_CATEGORIES[hash % BASE_CATEGORIES.length]!
			: "General"; // Fallback if BASE_CATEGORIES was empty (defensive)
		// --- FIX ENDS HERE ---
	}

	// Filter competences based on search query and category
	useEffect(() => {
		let filtered = competences; // Start with the full list

		// Filter by search query (case-insensitive)
		if (searchQuery) {
			const query = searchQuery.toLowerCase().trim(); // Trim whitespace
			if (query) { // Only filter if query is non-empty after trimming
				filtered = filtered.filter(comp =>
					comp.name.toLowerCase().includes(query) ||
					comp.description.toLowerCase().includes(query)
				);
			}
		}

		// Filter by category (ensure category exists on competence)
		if (activeCategory !== "All") {
			filtered = filtered.filter(comp => comp.category === activeCategory);
		}

		setFilteredCompetences(filtered);
	}, [searchQuery, activeCategory, competences]); // Re-run whenever these change

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
			{/* Pass only necessary props or consider if this component needs all competences */}
			<CompetenceProfile
				competences={competences} // Maybe pass filteredCompetences or specific user profile data?
				isLoading={isLoading}
			/>

			{/* Competences List */}
			<Tabs
				defaultValue="All" // Sets the initially selected tab
				value={activeCategory} // Controlled component value
				onValueChange={setActiveCategory} // Update state when tab changes
				className="space-y-4"
			>
				<TabsList>
					{/* Use the CATEGORIES constant for rendering tabs */}
					{CATEGORIES.map((category) => (
						<TabsTrigger key={category} value={category}>
							{category}
						</TabsTrigger>
					))}
				</TabsList>

				{/* Render content based on the filtered list, no need to map TabsContent */}
				{/* The active tab is controlled by the Tabs component value */}
				{/* We only need one TabsContent area that displays the filtered data */}
				<TabsContent value={activeCategory} className="mt-4 space-y-4"> {/* Added mt-4 for spacing */}
					<CompetenceGrid
						competences={filteredCompetences} // Display the filtered competences
						isLoading={isLoading}
					/>
				</TabsContent>

				{/* Note: Removed the loop for TabsContent. */}
				{/* You typically only render the content for the *active* tab, */}
				{/* or let the Tabs component handle showing/hiding content based on its value. */}
				{/* Rendering a grid for *every* category inside its own TabsContent is redundant */}
				{/* if the filtering logic already updates `filteredCompetences` based on `activeCategory`. */}

			</Tabs>

			{/* Development Recommendations */}
			{/* Similar consideration as CompetenceProfile: does it need all competences? */}
			<DevelopmentRecommendations
				competences={competences}
				isLoading={isLoading}
			/>
		</div>
	)
}