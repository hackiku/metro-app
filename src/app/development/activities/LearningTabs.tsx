// src/app/development/activities/LearningTabs.tsx
"use client"

export interface DevelopmentActivity {
	id: string;
	// Assuming activityType comes in as 'job', 'social', or 'formal'
	// Adding 'unknown' for robustness, although filtering logic here only uses the main three
	activityType: 'job' | 'social' | 'formal' | 'unknown';
	description: string;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Briefcase, Users, BookOpen } from "lucide-react";
// Make sure ActivityCard also uses a compatible DevelopmentActivity interface
import ActivityCard from "./ActivityCard";

interface LearningTabsProps {
	// Use the locally defined type for the activities prop
	activities: DevelopmentActivity[];
}

export default function LearningTabs({ activities }: LearningTabsProps) {
	// Group activities by type - This logic remains the same
	const jobActivities = activities.filter(a => a.activityType === 'job');
	const socialActivities = activities.filter(a => a.activityType === 'social');
	const formalActivities = activities.filter(a => a.activityType === 'formal');

	return (
		// The main structure and defaultValue="all" remain the same
		<Tabs defaultValue="all">
			{/* The header section with title and TabsList remains the same */}
			<div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<h2 className="text-xl font-semibold">Development Activities</h2>
				<TabsList>
					<TabsTrigger value="all">All ({activities.length})</TabsTrigger>
					<TabsTrigger value="job" disabled={jobActivities.length === 0}> {/* Added count and disabled state */}
						<Briefcase className="mr-1 h-4 w-4" />
						On the Job ({jobActivities.length})
					</TabsTrigger>
					<TabsTrigger value="social" disabled={socialActivities.length === 0}> {/* Added count and disabled state */}
						<Users className="mr-1 h-4 w-4" />
						Social ({socialActivities.length})
					</TabsTrigger>
					<TabsTrigger value="formal" disabled={formalActivities.length === 0}> {/* Added count and disabled state */}
						<BookOpen className="mr-1 h-4 w-4" />
						Formal ({formalActivities.length})
					</TabsTrigger>
				</TabsList>
			</div>

			{/* TabsContent for "all" - structure remains the same */}
			<TabsContent value="all" className="mt-4"> {/* Added mt-4 for spacing */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{activities.length > 0 ? (
						activities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						// Empty state message remains the same
						<div className="col-span-full rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
							<p className="text-neutral-500 dark:text-neutral-400">
								No learning activities found for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>

			{/* TabsContent for "job" - structure remains the same */}
			<TabsContent value="job" className="mt-4"> {/* Added mt-4 for spacing */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{jobActivities.length > 0 ? (
						jobActivities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						// Empty state message remains the same
						<div className="col-span-full rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
							<p className="text-neutral-500 dark:text-neutral-400">
								No 'On the Job' activities available for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>

			{/* TabsContent for "social" - structure remains the same */}
			<TabsContent value="social" className="mt-4"> {/* Added mt-4 for spacing */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{socialActivities.length > 0 ? (
						socialActivities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						// Empty state message remains the same
						<div className="col-span-full rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
							<p className="text-neutral-500 dark:text-neutral-400">
								No 'Social Learning' activities available for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>

			{/* TabsContent for "formal" - structure remains the same */}
			<TabsContent value="formal" className="mt-4"> {/* Added mt-4 for spacing */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{formalActivities.length > 0 ? (
						formalActivities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						// Empty state message remains the same
						<div className="col-span-full rounded-lg border border-neutral-200 bg-white p-6 text-center dark:border-neutral-700 dark:bg-neutral-800">
							<p className="text-neutral-500 dark:text-neutral-400">
								No 'Formal Learning' activities available for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>
		</Tabs>
	)
}