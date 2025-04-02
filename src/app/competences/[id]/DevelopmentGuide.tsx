// ~/app/competences/[id]/DevelopmentGuide.tsx
"use client"

import { Card } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Briefcase, Users, BookOpen, CheckCircle } from "lucide-react"
import { Button } from "~/components/ui/button"

interface Competence {
	id: string
	name: string
	description: string
	category?: string
	userRating?: number
}

interface DevelopmentGuideProps {
	competence: Competence
}

interface DevelopmentActivity {
	title: string
	description: string
	difficulty: "Beginner" | "Intermediate" | "Advanced"
	estimatedTime: string
	completed?: boolean
}

export function DevelopmentGuide({ competence }: DevelopmentGuideProps) {
	// Generate development activities based on competence
	// In a real app, these would come from a database
	const generateActivities = (type: string): DevelopmentActivity[] => {
		// Some example activities based on the 70-20-10 model
		const onTheJobActivities: DevelopmentActivity[] = [
			{
				title: `Apply ${competence.name} in a real project`,
				description: `Take the lead on a task that specifically requires ${competence.name}`,
				difficulty: "Intermediate",
				estimatedTime: "2-4 weeks"
			},
			{
				title: "Document your process",
				description: `Create a playbook for how you approach ${competence.name.toLowerCase()} challenges`,
				difficulty: "Beginner",
				estimatedTime: "1 week",
				completed: true
			},
			{
				title: "Stretch assignment",
				description: `Request a challenging assignment that will push your ${competence.name.toLowerCase()} abilities`,
				difficulty: "Advanced",
				estimatedTime: "1-3 months"
			}
		];

		const socialLearningActivities: DevelopmentActivity[] = [
			{
				title: "Find a mentor",
				description: `Connect with someone who excels at ${competence.name}`,
				difficulty: "Beginner",
				estimatedTime: "Ongoing"
			},
			{
				title: "Community of practice",
				description: `Join or create a group focused on ${competence.name}`,
				difficulty: "Intermediate",
				estimatedTime: "Biweekly meetings"
			},
			{
				title: "Teach others",
				description: `Organize a lunch & learn session about ${competence.name}`,
				difficulty: "Advanced",
				estimatedTime: "2-3 hours prep + 1 hour session"
			}
		];

		const formalLearningActivities: DevelopmentActivity[] = [
			{
				title: "Online course",
				description: `Complete a structured course on ${competence.name}`,
				difficulty: "Beginner",
				estimatedTime: "8-15 hours"
			},
			{
				title: "Professional certification",
				description: `Pursue a certification relevant to ${competence.name}`,
				difficulty: "Advanced",
				estimatedTime: "3-6 months"
			},
			{
				title: "Book/Article list",
				description: `Read curated materials about ${competence.name}`,
				difficulty: "Intermediate",
				estimatedTime: "1-2 hours per week",
				completed: true
			}
		];

		// Return activities based on type
		switch (type) {
			case "job":
				return onTheJobActivities;
			case "social":
				return socialLearningActivities;
			case "formal":
				return formalLearningActivities;
			default:
				return [];
		}
	};

	return (
		<Card className="p-6">
			<h2 className="text-xl font-semibold">Development Guide</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Activities to help you develop this competence using the 70-20-10 model
			</p>

			<Tabs defaultValue="job" className="mt-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="job" className="flex items-center gap-2">
						<Briefcase className="h-4 w-4" />
						<span className="hidden sm:inline">On the Job</span>
						<span className="sm:hidden">70%</span>
					</TabsTrigger>
					<TabsTrigger value="social" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						<span className="hidden sm:inline">Social</span>
						<span className="sm:hidden">20%</span>
					</TabsTrigger>
					<TabsTrigger value="formal" className="flex items-center gap-2">
						<BookOpen className="h-4 w-4" />
						<span className="hidden sm:inline">Formal</span>
						<span className="sm:hidden">10%</span>
					</TabsTrigger>
				</TabsList>

				{["job", "social", "formal"].map(type => (
					<TabsContent key={type} value={type} className="mt-4 space-y-4">
						{generateActivities(type).map((activity, index) => (
							<Card key={index} className="p-4">
								<div className="flex items-start justify-between">
									<div>
										<div className="flex items-center gap-2">
											<h3 className="font-medium">{activity.title}</h3>
											{activity.completed && (
												<CheckCircle className="h-4 w-4 text-emerald-500" />
											)}
										</div>
										<p className="text-sm text-muted-foreground">{activity.description}</p>

										<div className="mt-2 flex flex-wrap gap-2 text-xs">
											<Badge difficulty={activity.difficulty} />
											<span className="rounded-full bg-muted px-2 py-1">
												{activity.estimatedTime}
											</span>
										</div>
									</div>

									<Button
										variant={activity.completed ? "outline" : "secondary"}
										size="sm"
									>
										{activity.completed ? "Completed" : "Add to Plan"}
									</Button>
								</div>
							</Card>
						))}
					</TabsContent>
				))}
			</Tabs>
		</Card>
	)
}

// Helper component for difficulty badges
function Badge({ difficulty }: { difficulty: string }) {
	const getColorByDifficulty = (difficulty: string) => {
		switch (difficulty) {
			case "Beginner":
				return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
			case "Intermediate":
				return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
			case "Advanced":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
			default:
				return "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-300";
		}
	};

	return (
		<span className={`rounded-full px-2 py-1 ${getColorByDifficulty(difficulty)}`}>
			{difficulty}
		</span>
	);
}