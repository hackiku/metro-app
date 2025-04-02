// src/app/development/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "~/components/ui/card"
import JobFamiliesSlider from "./families/JobFamiliesSlider" // Assuming this component exists and works
import CompetenceSelect from "./CompetenceSelect" // Assuming this component exists and works
import DevelopmentGuide from "./activities/DevelopmentGuide"
import LearningTabs from "./activities/LearningTabs" // Assuming this component exists and works
import { supabase } from "~/server/db/supabase"

// --- Type Definitions ---

// Represents the raw data structure from the 'competences' table
interface SupabaseCompetence {
	id: string;
	name: string;
	description: string;
	category: string | null; // From DB schema (assuming nullable)
	// Add other fields if selected, e.g., user_rating if it existed in DB
	// For demo, we'll add userRating client-side
}

// Represents the Competence data structure used within this page/component
// Includes client-side additions like userRating
export interface Competence {
	id: string;
	name: string;
	description: string;
	category?: string; // Make optional as it might be null from DB or added later
	userRating?: number; // Added client-side for demo
}

// Represents the raw data structure from the 'development_activities' table
interface SupabaseDevelopmentActivity {
	id: string;
	competence_id: string; // snake_case from DB
	activity_type: string; // raw string from DB ('job', 'social', 'formal')
	description: string;
}

// Represents the DevelopmentActivity data structure used by child components (like ActivityCard)
// Needs transformation from SupabaseDevelopmentActivity (camelCase, validated type)
export interface DevelopmentActivity {
	id: string;
	// competenceId: string; // We might not need this if filtering is done here
	activityType: 'job' | 'social' | 'formal' | 'unknown'; // Use validated union type
	description: string;
}

// Helper function to safely validate and cast activity type
function mapActivityType(typeString: string | null | undefined): DevelopmentActivity['activityType'] {
	if (typeString === 'job' || typeString === 'social' || typeString === 'formal') {
		return typeString;
	}
	console.warn(`Unknown activity type received: ${typeString}`);
	return 'unknown'; // Default to 'unknown' if type is not recognized or null/undefined
}

// --- Component ---

export default function DevelopmentPage() {
	const [selectedFamily, setSelectedFamily] = useState<string | null>(null) // Assuming family ID is string
	const [selectedCompetenceId, setSelectedCompetenceId] = useState<string | null>(null)
	const [competences, setCompetences] = useState<Competence[]>([]) // Use local Competence type
	const [activities, setActivities] = useState<DevelopmentActivity[]>([]) // Use local DevelopmentActivity type
	const [isLoadingCompetences, setIsLoadingCompetences] = useState(true)
	const [isLoadingActivities, setIsLoadingActivities] = useState(false) // Separate loading state

	// TODO: Fetch Job Families for the Slider (if not already handled in JobFamiliesSlider)
	// Example:
	// useEffect(() => {
	//   async function fetchFamilies() { ... supabase fetch ... setFamiliesState }
	//   fetchFamilies();
	// }, []);
	// For now, let's assume JobFamiliesSlider fetches its own data or receives it via props

	// Effect to fetch competences (runs initially or when selectedFamily changes)
	// TEMP: Fetching *all* competences for now, ignoring selectedFamily as per original code
	useEffect(() => {
		async function fetchCompetences() {
			// if (!selectedFamily) { // Re-enable this if you want to filter by family
			//     setCompetences([]);
			//     setSelectedCompetenceId(null);
			//     setIsLoadingCompetences(false);
			//     return;
			// }

			try {
				setIsLoadingCompetences(true)
				setCompetences([]); // Clear previous competences
				setSelectedCompetenceId(null); // Clear selected competence

				// Fetch from Supabase, expecting SupabaseCompetence structure
				const { data, error } = await supabase
					.from('competences')
					.select('id, name, description, category') // Select specific columns
					// .eq('job_family_id', selectedFamily) // TODO: Add filter if needed based on schema
					.returns<SupabaseCompetence[]>()

				if (error) {
					console.error("Error fetching competences:", error)
					setCompetences([]); // Ensure state is empty on error
					return
				}

				if (!data) {
					console.warn("No competence data received.");
					setCompetences([]);
					return;
				}

				// Transform Supabase data to match our component's Competence interface
				const transformedData: Competence[] = data.map(item => ({
					id: item.id,
					name: item.name,
					description: item.description,
					category: item.category ?? undefined, // Handle null category from DB
					userRating: Math.floor(Math.random() * 50) + 50 // Assign random rating (50-100) for demo
				}));

				setCompetences(transformedData)

				// Automatically select the first competence if available
				if (transformedData.length > 0 && transformedData[0]?.id) {
					setSelectedCompetenceId(transformedData[0].id)
				} else {
					setSelectedCompetenceId(null); // Ensure no competence is selected if list is empty
				}

			} catch (error) {
				console.error("Error transforming or setting competences:", error)
				setCompetences([]); // Reset state on catch
				setSelectedCompetenceId(null);
			} finally {
				setIsLoadingCompetences(false)
			}
		}

		fetchCompetences()
		// }, [selectedFamily]); // Re-enable selectedFamily dependency if filtering by it
	}, []); // Run once on mount for now (fetching all)


	// Effect to fetch activities when selectedCompetenceId changes
	useEffect(() => {
		async function fetchActivities() {
			if (!selectedCompetenceId) {
				setActivities([]); // Clear activities if no competence is selected
				setIsLoadingActivities(false);
				return;
			}

			try {
				setIsLoadingActivities(true);
				setActivities([]); // Clear previous activities

				// Fetch from Supabase, expecting SupabaseDevelopmentActivity structure
				const { data, error } = await supabase
					.from('development_activities')
					.select('id, competence_id, activity_type, description') // Select specific columns
					.eq('competence_id', selectedCompetenceId)
					.returns<SupabaseDevelopmentActivity[]>()

				if (error) {
					console.error("Error fetching activities:", error)
					setActivities([]); // Ensure state is empty on error
					return
				}

				if (!data) {
					console.warn("No activity data received for competence:", selectedCompetenceId);
					setActivities([]);
					return;
				}

				// Transform Supabase data to match component's DevelopmentActivity interface
				const transformedData: DevelopmentActivity[] = data.map(item => ({
					id: item.id,
					// competenceId: item.competence_id, // Include if needed by LearningTabs/ActivityCard
					activityType: mapActivityType(item.activity_type), // Use helper for validation/casting
					description: item.description,
				}));

				setActivities(transformedData || []); // Use empty array as fallback

			} catch (error) {
				console.error("Error transforming or setting activities:", error);
				setActivities([]); // Reset state on catch
			} finally {
				setIsLoadingActivities(false);
			}
		}

		fetchActivities()
	}, [selectedCompetenceId]); // Re-run whenever the selected competence changes

	// Find the full competence object based on the selected ID
	const currentCompetence = competences.find(c => c.id === selectedCompetenceId);

	return (
		<div className="space-y-6 p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Development Plan</h1>
				<p className="text-muted-foreground">
					Build your skills and competences with structured learning activities.
				</p>
			</div>

			{/* Job Families Slider - Needs data/logic */}
			<JobFamiliesSlider
				selectedFamily={selectedFamily}
				onSelectFamily={(familyId) => {
					setSelectedFamily(familyId);
					// Optionally reset competence selection when family changes
					// setSelectedCompetenceId(null);
					// setActivities([]);
				}}
			/>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{/* Left Column: Competence Selection */}
				<div className="md:col-span-1">
					<Card className="p-4 md:p-6"> {/* Adjusted padding */}
						<h2 className="mb-4 text-xl font-semibold">Select Competence</h2>
						{isLoadingCompetences ? (
							<div className="space-y-3">
								{/* Skeleton Loader */}
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
								))}
							</div>
						) : competences.length === 0 ? (
							<p className="text-muted-foreground">No competences found for the selected criteria.</p>
						) : (
							<CompetenceSelect
								competences={competences}
								selectedId={selectedCompetenceId} // Pass ID, handle null
								onSelect={setSelectedCompetenceId}
							/>
						)}
					</Card>
				</div>

				{/* Right Column: Guide and Activities */}
				<div className="md:col-span-2 space-y-6"> {/* Added space-y */}
					{/* Development Guide */}
					<DevelopmentGuide competence={currentCompetence} />

					{/* Learning Activities Tabs */}
					{/* Show loading state while activities are loading */}
					{isLoadingActivities ? (
						<Card className="p-6">
							<div className="h-40 animate-pulse rounded-lg bg-muted" />
						</Card>
					) : selectedCompetenceId ? ( // Only show tabs if a competence is selected
						<LearningTabs activities={activities} />
					) : (
						<Card className="p-6">
							<p className="text-muted-foreground">Select a competence to see learning activities.</p>
						</Card>
					)}
				</div>
			</div>
		</div>
	)
}