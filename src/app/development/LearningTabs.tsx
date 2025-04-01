// src/app/development/LearningTabs.tsx
"use client"

import { DevelopmentActivity } from "./data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Briefcase, Users, BookOpen } from "lucide-react"
import ActivityCard from "./ActivityCard"

interface LearningTabsProps {
	activities: DevelopmentActivity[]
}

export default function LearningTabs({ activities }: LearningTabsProps) {
	// Group activities by type
	const jobActivities = activities.filter(a => a.activityType === 'job')
	const socialActivities = activities.filter(a => a.activityType === 'social')
	const formalActivities = activities.filter(a => a.activityType === 'formal')

	return (
		<Tabs defaultValue="all">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-xl font-semibold">Development Activities</h2>
				<TabsList>
					<TabsTrigger value="all">All</TabsTrigger>
					<TabsTrigger value="job">
						<Briefcase className="mr-1 h-4 w-4" />
						On the Job
					</TabsTrigger>
					<TabsTrigger value="social">
						<Users className="mr-1 h-4 w-4" />
						Social
					</TabsTrigger>
					<TabsTrigger value="formal">
						<BookOpen className="mr-1 h-4 w-4" />
						Formal
					</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value="all">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{activities.length > 0 ? (
						activities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						<div className="col-span-full rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700">
							<p className="text-gray-500 dark:text-gray-400">
								No activities available for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>

			<TabsContent value="job">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{jobActivities.length > 0 ? (
						jobActivities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						<div className="col-span-full rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700">
							<p className="text-gray-500 dark:text-gray-400">
								No on-the-job activities available for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>

			<TabsContent value="social">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{socialActivities.length > 0 ? (
						socialActivities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						<div className="col-span-full rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700">
							<p className="text-gray-500 dark:text-gray-400">
								No social learning activities available for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>

			<TabsContent value="formal">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{formalActivities.length > 0 ? (
						formalActivities.map(activity => (
							<ActivityCard key={activity.id} activity={activity} />
						))
					) : (
						<div className="col-span-full rounded-lg border border-gray-200 p-6 text-center dark:border-gray-700">
							<p className="text-gray-500 dark:text-gray-400">
								No formal learning activities available for this competence.
							</p>
						</div>
					)}
				</div>
			</TabsContent>
		</Tabs>
	)
}