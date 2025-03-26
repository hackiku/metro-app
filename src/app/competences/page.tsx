// ~/app/competences/page.tsx
"use client"

import { Navbar } from "../_components/layout/Navbar";
import { Sidebar } from "../_components/layout/Sidebar";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
	Search,
	Brain,
	Users,
	PieChart,
	LineChart,
	BookOpen,
	PenTool,
	MessageSquare,
	Award,
	BarChart2,
	ArrowUpRight
} from "lucide-react";

// Sample competences data
const COMPETENCES = [
	{
		id: "problem-analysis",
		name: "Problem Analysis",
		category: "Cognitive",
		description: "The ability to detect problems, recognize important information, and link various data; to trace potential causes and look for relevant details.",
		userRating: 75,
		icon: <Brain className="h-5 w-5" />,
		jobFamilies: ["Business Analysis", "Business Partnering", "Product Management"],
		developmentActivities: [
			{ type: "On the Job", description: "Lead a complex problem-solving workshop" },
			{ type: "Social", description: "Shadow senior analysts during problem investigation" },
			{ type: "Formal", description: "Complete Advanced Analytics training" }
		]
	},
	{
		id: "cooperation",
		name: "Cooperation",
		category: "Interpersonal",
		description: "The ability to work effectively with others in order to achieve a shared goal - even when the object at stake is of no direct personal interest.",
		userRating: 82,
		icon: <Users className="h-5 w-5" />,
		jobFamilies: ["Business Analysis", "Commercial Expertise", "Commercial Partnering"],
		developmentActivities: [
			{ type: "On the Job", description: "Lead a cross-functional project team" },
			{ type: "Social", description: "Participate in team-building activities" },
			{ type: "Formal", description: "Take a course on collaborative leadership" }
		]
	},
	{
		id: "result-orientedness",
		name: "Result-Orientedness",
		category: "Execution",
		description: "The ability to take direct action in order to attain or exceed objectives.",
		userRating: 68,
		icon: <PieChart className="h-5 w-5" />,
		jobFamilies: ["Business Analysis", "Product Management", "Commercial Expertise"],
		developmentActivities: [
			{ type: "On the Job", description: "Set and track measurable goals for a project" },
			{ type: "Social", description: "Join a high-performance team for knowledge sharing" },
			{ type: "Formal", description: "Complete project management certification" }
		]
	},
	{
		id: "planning-organising",
		name: "Planning & Organising",
		category: "Execution",
		description: "The ability to determine goals and priorities and to assess the actions, time and resources needed to achieve those goals.",
		userRating: 79,
		icon: <LineChart className="h-5 w-5" />,
		jobFamilies: ["Business Analysis", "Business Partnering", "Commercial Partnering"],
		developmentActivities: [
			{ type: "On the Job", description: "Create and manage a complex project plan" },
			{ type: "Social", description: "Shadow experienced project managers" },
			{ type: "Formal", description: "Take a course on agile methodologies" }
		]
	},
	{
		id: "persuasiveness",
		name: "Persuasiveness",
		category: "Interpersonal",
		description: "The ambition to win over other people for one's views and ideas and to generate support.",
		userRating: 65,
		icon: <MessageSquare className="h-5 w-5" />,
		jobFamilies: ["Business Partnering", "Commercial Partnering", "Buying"],
		developmentActivities: [
			{ type: "On the Job", description: "Present a business case to stakeholders" },
			{ type: "Social", description: "Join a debate or speaking club" },
			{ type: "Formal", description: "Complete a negotiation skills workshop" }
		]
	},
	{
		id: "innovative-power",
		name: "Innovative Power",
		category: "Cognitive",
		description: "The ability to direct one's inquisitive mind toward initiating new strategies, products, services, and markets.",
		userRating: 58,
		icon: <PenTool className="h-5 w-5" />,
		jobFamilies: ["Product Management", "Business Analysis", "Commercial Expertise"],
		developmentActivities: [
			{ type: "On the Job", description: "Lead an innovation workshop" },
			{ type: "Social", description: "Participate in hackathons or idea challenges" },
			{ type: "Formal", description: "Take a design thinking course" }
		]
	},
	{
		id: "forming-judgment",
		name: "Forming Judgment",
		category: "Cognitive",
		description: "The ability to balance facts and potential approaches taking the appropriate criteria into account.",
		userRating: 72,
		icon: <BarChart2 className="h-5 w-5" />,
		jobFamilies: ["Business Partnering", "Business Analysis", "Buying"],
		developmentActivities: [
			{ type: "On the Job", description: "Make decisions in ambiguous situations" },
			{ type: "Social", description: "Participate in mentoring sessions" },
			{ type: "Formal", description: "Complete critical thinking training" }
		]
	}
];

// Filter categories
const CATEGORIES = ["All", "Cognitive", "Interpersonal", "Execution"];

export default function CompetencesPage() {
	return (
		<div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
			<Sidebar />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar />

				<main className="flex-1 overflow-auto p-6">
					<div className="space-y-6">
						<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">Competences</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Explore and develop key competences for your career growth
								</p>
							</div>

							{/* Search bar */}
							<div className="relative w-full max-w-sm">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
								<input
									type="text"
									placeholder="Search competences..."
									className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-4 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
								/>
							</div>
						</div>

						{/* Your Competence Profile */}
						<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold">Your Competence Profile</h2>
								<Button variant="outline" size="sm">
									View Full Assessment
								</Button>
							</div>

							<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
								<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
									<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Score</h3>
									<div className="mt-1 flex items-end">
										<span className="text-2xl font-bold">76%</span>
										<span className="ml-2 text-sm text-green-600 dark:text-green-400">+4% from last year</span>
									</div>
								</div>

								<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
									<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Strongest Area</h3>
									<div className="mt-1">
										<span className="text-lg font-bold">Cooperation</span>
										<p className="text-sm text-gray-500 dark:text-gray-400">82% proficiency</p>
									</div>
								</div>

								<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
									<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth Area</h3>
									<div className="mt-1">
										<span className="text-lg font-bold">Innovative Power</span>
										<p className="text-sm text-gray-500 dark:text-gray-400">58% proficiency</p>
									</div>
								</div>

								<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
									<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assessment Status</h3>
									<div className="mt-1">
										<span className="text-lg font-bold">Up to date</span>
										<p className="text-sm text-gray-500 dark:text-gray-400">Last updated 2 months ago</p>
									</div>
								</div>
							</div>
						</Card>

						{/* Competences List */}
						<Tabs defaultValue="All" className="space-y-4">
							<TabsList className="bg-gray-100 dark:bg-gray-800">
								{CATEGORIES.map((category) => (
									<TabsTrigger key={category} value={category}>
										{category}
									</TabsTrigger>
								))}
							</TabsList>

							{CATEGORIES.map((category) => (
								<TabsContent key={category} value={category} className="space-y-4">
									<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
										{COMPETENCES
											.filter(comp => category === "All" || comp.category === category)
											.map((competence) => (
												<Card key={competence.id} className="flex flex-col bg-white shadow-md dark:bg-gray-800">
													<div className="flex items-start justify-between border-b border-gray-200 p-4 dark:border-gray-700">
														<div className="flex items-center">
															<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
																{competence.icon}
															</div>
															<div>
																<h3 className="font-medium">{competence.name}</h3>
																<p className="text-sm text-gray-500 dark:text-gray-400">{competence.category}</p>
															</div>
														</div>
														<Button variant="ghost" size="sm" className="rounded-full">
															<ArrowUpRight className="h-4 w-4" />
														</Button>
													</div>

													<div className="flex-1 p-4">
														<p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
															{competence.description.length > 120
																? competence.description.substring(0, 120) + "..."
																: competence.description}
														</p>

														<div className="mb-1 flex items-center justify-between">
															<span className="text-sm font-medium">Your proficiency</span>
															<span className="text-sm font-medium">{competence.userRating}%</span>
														</div>
														<Progress
															value={competence.userRating}
															className="mb-4 h-2 bg-gray-200 dark:bg-gray-700"
														/>

														<div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
															<div className="flex flex-wrap gap-1">
																<span className="text-xs font-medium">Related job families:</span>
																{competence.jobFamilies.map((family, index) => (
																	<span key={index} className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
																		{family}{index < competence.jobFamilies.length - 1 ? ", " : ""}
																	</span>
																))}
															</div>
														</div>
													</div>

													<div className="border-t border-gray-200 p-4 dark:border-gray-700">
														<Button variant="outline" className="w-full">
															<BookOpen className="mr-2 h-4 w-4" />
															View Development Guide
														</Button>
													</div>
												</Card>
											))}
									</div>
								</TabsContent>
							))}
						</Tabs>

						{/* Development Recommendations */}
						<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold">Recommended Development Activities</h2>
								<Button variant="outline" size="sm">
									View All
								</Button>
							</div>

							<div className="mt-6 space-y-4">
								{COMPETENCES
									.sort((a, b) => a.userRating - b.userRating)
									.slice(0, 3)
									.map((competence) => (
										<div key={competence.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
											<div className="mb-4 flex items-center justify-between">
												<div className="flex items-center">
													<div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
														{competence.icon}
													</div>
													<h3 className="font-medium">{competence.name}</h3>
												</div>
												<div className="flex items-center">
													<Award className="mr-1 h-4 w-4 text-amber-500" />
													<span className="text-sm">{competence.userRating}%</span>
												</div>
											</div>

											<div className="space-y-2">
												{competence.developmentActivities.map((activity, index) => (
													<div key={index} className="flex items-start">
														<div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-indigo-500"></div>
														<div>
															<span className="font-medium">{activity.type}:</span>
															<span className="ml-1 text-gray-600 dark:text-gray-300">{activity.description}</span>
														</div>
													</div>
												))}
											</div>
										</div>
									))
								}
							</div>
						</Card>
					</div>
				</main>
			</div>
		</div>
	);
}