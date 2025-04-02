// src/app/development/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Card } from "~/components/ui/card"
import JobFamiliesSlider from "./families/JobFamiliesSlider"
import CompetenceSelect from "./CompetenceSelect"
import DevelopmentGuide from "./activities/DevelopmentGuide"
import LearningTabs from "./activities/LearningTabs"
import { supabase } from "~/server/db/supabase"

// --- Type Definitions ---

// Structure expected by CompetenceSelect and DevelopmentGuide
export interface Competence {
	id: string;
	name: string;
	description: string;
	category?: string; // Added client-side
	userRating?: number; // Added client-side
}

// Structure expected by LearningTabs and ActivityCard
export interface DevelopmentActivity {
	id: string;
	activityType: 'job' | 'social' | 'formal' | 'unknown';
	description: string;
}

// Helper to assign category deterministically based on ID
const COMPETENCE_CATEGORIES = ["Cognitive", "Interpersonal", "Execution", "General"];
function assignCompetenceCategory(id: string): string {
	if (!id) return "General";
	const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return COMPETENCE_CATEGORIES[hash % COMPETENCE_CATEGORIES.length]!;
}

// Helper to map DB activity type string
function mapActivityType(typeString: string | null | undefined): DevelopmentActivity['activityType'] {
	if (typeString === 'job' || typeString === 'social' || typeString === 'formal') {
		return typeString;
	}
	if (typeString) console.warn(`Unknown activity type: ${typeString}`);
	return 'unknown';
}

// --- Component ---
export default function DevelopmentPage() {
	const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
	const [selectedCompetenceId, setSelectedCompetenceId] = useState<string | null>(null);
	const [competences, setCompetences] = useState<Competence[]>([]);
	const [activities, setActivities] = useState<DevelopmentActivity[]>([]);
	const [isLoadingCompetences, setIsLoadingCompetences] = useState(false);
	const [isLoadingActivities, setIsLoadingActivities] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null); // State to hold fetch error message

	// Fetch competences based on selected family
	useEffect(() => {
		async function fetchCompetencesForFamily() {
			setFetchError(null); // Clear previous error
			if (!selectedFamily) {
				setCompetences([]);
				setSelectedCompetenceId(null);
				setIsLoadingCompetences(false);
				return;
			}

			setIsLoadingCompetences(true);
			setCompetences([]);
			setSelectedCompetenceId(null);

			try {
				// Fetch ALL competences for now (id, name, description ONLY)
				// If this still fails with {}, the issue is likely RLS or client config
				const { data, error } = await supabase
					.from('competences')
					.select('id, name, description'); // Match INSERT data

				if (error) {
					// Log more details if available
					console.error("Error fetching competences:", error.message || error);
					console.error("Error details:", error.details || 'N/A');
					console.error("Error hint:", error.hint || 'N/A');
					console.error("Error code:", error.code || 'N/A');
					setFetchError(`Failed to load competences: ${error.message || 'Unknown error'}`);
					setCompetences([]);
					setIsLoadingCompetences(false);
					return;
				}

				if (!data) {
					setCompetences([]);
					setIsLoadingCompetences(false);
					return;
				}

				// TODO: Filter these 'data' based on 'selectedFamily' using 'job_family_competences'
				// This requires fetching relationships first, similar to the previous attempt.
				// For now, showing ALL fetched competences to test the basic fetch.

				// Transform data: Add category and userRating client-side
				const transformedData: Competence[] = data.map(item => ({
					id: item.id,
					name: item.name,
					description: item.description,
					category: assignCompetenceCategory(item.id), // Assign category based on ID
					userRating: Math.floor(Math.random() * 50) + 50 // Keep demo rating
				}));

				setCompetences(transformedData);

				if (transformedData.length > 0 && transformedData[0]?.id) {
					setSelectedCompetenceId(transformedData[0].id);
				} else {
					setSelectedCompetenceId(null);
				}

			} catch (err) {
				// Catch any other unexpected errors during processing
				console.error("Unexpected error in competence fetch/process:", err);
				setFetchError("An unexpected error occurred while loading competences.");
				setCompetences([]);
				setSelectedCompetenceId(null);
			} finally {
				setIsLoadingCompetences(false);
			}
		}

		fetchCompetencesForFamily();
	}, [selectedFamily]); // Re-run when family changes

	// Fetch activities (no changes needed here for now)
	useEffect(() => {
		async function fetchActivities() {
			if (!selectedCompetenceId) {
				setActivities([]);
				setIsLoadingActivities(false);
				return;
			}
			setIsLoadingActivities(true);
			setActivities([]);

			try {
				const { data, error } = await supabase
					.from('development_activities')
					.select('id, competence_id, activity_type, description')
					.eq('competence_id', selectedCompetenceId); // Type inference is usually okay here

				if (error) {
					console.error("Error fetching activities:", error.message || error);
					setActivities([]);
					setIsLoadingActivities(false);
					return;
				}

				const transformedData: DevelopmentActivity[] = (data || []).map(item => ({
					id: item.id,
					activityType: mapActivityType(item.activity_type),
					description: item.description,
				}));
				setActivities(transformedData);

			} catch (err) {
				console.error("Unexpected error processing activities:", err);
				setActivities([]);
			} finally {
				setIsLoadingActivities(false);
			}
		}
		fetchActivities();
	}, [selectedCompetenceId]);

	const currentCompetence = competences.find(c => c.id === selectedCompetenceId);

	// Derived states for rendering logic
	const showCompetenceLoader = isLoadingCompetences;
	const showActivityLoader = isLoadingActivities;
	const showCompetenceError = !isLoadingCompetences && fetchError;
	const showCompetenceEmptyState = !isLoadingCompetences && !fetchError && (!selectedFamily || competences.length === 0);
	const showGuidePlaceholder = !selectedCompetenceId && !isLoadingCompetences && !fetchError;
	const showActivityPlaceholder = !selectedCompetenceId && !isLoadingActivities && !isLoadingCompetences && !fetchError;

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Development Plan</h1>
				<p className="text-muted-foreground">
					Build your skills and competences with structured learning activities.
				</p>
			</div>

			{/* Job Families Slider */}
			<JobFamiliesSlider
				selectedFamily={selectedFamily}
				onSelectFamily={setSelectedFamily}
			/>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				{/* Competence Selection Column */}
				<div className="md:col-span-1">
					<Card className="bg-neutral-800 p-4 md:p-6">
						<h2 className="mb-4 text-xl font-semibold text-white">Select Competence</h2>
						{showCompetenceLoader ? (
							<div className="space-y-3">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-700" />
								))}
							</div>
						) : showCompetenceError ? (
							<div className="rounded-lg border border-red-900 bg-neutral-800 p-6 text-center">
								<p className="text-red-400">Error: {fetchError}</p>
							</div>
						) : showCompetenceEmptyState ? (
							<div className="rounded-lg border border-neutral-700 bg-neutral-800 p-6 text-center">
								<p className="text-neutral-400">
									{!selectedFamily ? "Select a Job Family first." : "No competences found."}
								</p>
							</div>
						) : (
							<CompetenceSelect
								competences={competences}
								selectedId={selectedCompetenceId}
								onSelect={setSelectedCompetenceId}
							/>
						)}
					</Card>
				</div>

				{/* Guide and Activities Column */}
				<div className="md:col-span-2 space-y-6">
					{showGuidePlaceholder ? (
						<Card className="flex h-48 items-center justify-center bg-neutral-800 p-6">
							<p className="text-neutral-400">Select a competence to see the guide.</p>
						</Card>
					) : (
						<DevelopmentGuide competence={currentCompetence} />
					)}

					{showActivityPlaceholder ? (
						<Card className="flex h-48 items-center justify-center bg-neutral-800 p-6">
							<p className="text-neutral-400">Select a competence to see learning activities.</p>
						</Card>
					) : showActivityLoader ? (
						<Card className="bg-neutral-800 p-6">
							<div className="h-40 animate-pulse rounded-lg bg-neutral-700" />
						</Card>
					) : selectedCompetenceId ? (
						<LearningTabs activities={activities} />
					) : null}
				</div>
			</div>
		</div>
	)
}