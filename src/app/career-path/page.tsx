// ~/app/career-path/page.tsx
"use client"

import { Navbar } from "../_components/layout/Navbar";
import { Sidebar } from "../_components/layout/Sidebar";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { TabsContent, TabsList, TabsTrigger, Tabs } from "~/components/ui/tabs";
import { ArrowRight, Map, ChevronRight, Info } from "lucide-react";
import Link from "next/link";

// Simplified data for career paths
const CAREER_PATHS = [
	{
		id: "commercial",
		name: "Commercial Track",
		description: "Career progression through commercial roles",
		stations: [
			{ id: "commercial-expertise-junior", name: "Commercial Expertise (Junior)", level: 1 },
			{ id: "commercial-expertise-medior", name: "Commercial Expertise (Medior)", level: 2 },
			{ id: "commercial-partnering-medior", name: "Commercial Partnering (Medior)", level: 2 },
			{ id: "commercial-partnering-senior", name: "Commercial Partnering (Senior)", level: 3 },
			{ id: "buying-senior", name: "Buying (Senior)", level: 3 },
			{ id: "buying-lead", name: "Buying (Lead)", level: 4 }
		]
	},
	{
		id: "product",
		name: "Product Track",
		description: "Career progression through product roles",
		stations: [
			{ id: "business-analysis-junior", name: "Business Analysis (Junior)", level: 1 },
			{ id: "business-analysis-medior", name: "Business Analysis (Medior)", level: 2 },
			{ id: "product-management-medior", name: "Product Management (Medior)", level: 2 },
			{ id: "product-management-senior", name: "Product Management (Senior)", level: 3 },
			{ id: "product-management-lead", name: "Product Management (Lead)", level: 4 }
		]
	},
	{
		id: "people",
		name: "People Track",
		description: "Career progression through people-centric roles",
		stations: [
			{ id: "business-partnering-junior", name: "Business Partnering (Junior)", level: 1 },
			{ id: "business-partnering-medior", name: "Business Partnering (Medior)", level: 2 },
			{ id: "business-partnering-senior", name: "Business Partnering (Senior)", level: 3 },
			{ id: "business-partnering-lead", name: "Business Partnering (Lead)", level: 4 }
		]
	}
];

// Current user's position (in a real app, this would come from user data)
const CURRENT_POSITION = {
	jobFamily: "Business Analysis",
	level: "Medior",
	yearsInRole: 2,
	competenceScore: 78
};

// Function to determine if a station is available as next step
const isAvailableNextStep = (station) => {
	// This would use actual logic based on competence scores, experience, etc.
	return station.level <= CURRENT_POSITION.competenceScore / 20 + 1;
};

export default function CareerPathPage() {
	return (
		<div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
			<Sidebar />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar />

				<main className="flex-1 overflow-auto p-6">
					<div className="space-y-6">
						<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">Career Paths</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Explore potential career progression routes across the organization
								</p>
							</div>
							<Button className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">
								View Your Recommendations
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>

						{/* Current Position Card */}
						<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
							<h2 className="mb-4 text-lg font-semibold">Your Current Position</h2>
							<div className="flex flex-wrap items-center gap-6">
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Job Family</p>
									<p className="font-medium">{CURRENT_POSITION.jobFamily}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
									<p className="font-medium">{CURRENT_POSITION.level}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Time in Role</p>
									<p className="font-medium">{CURRENT_POSITION.yearsInRole} years</p>
								</div>
								<div>
									<p className="text-sm text-gray-500 dark:text-gray-400">Competence Score</p>
									<p className="font-medium">{CURRENT_POSITION.competenceScore}%</p>
								</div>
								<div className="ml-auto">
									<Button variant="outline" size="sm">
										<Info className="mr-2 h-4 w-4" />
										Skill Gap Analysis
									</Button>
								</div>
							</div>
						</Card>

						{/* Career Paths */}
						<Tabs defaultValue="visual" className="space-y-4">
							<TabsList className="bg-gray-100 dark:bg-gray-800">
								<TabsTrigger value="visual">Visual Map</TabsTrigger>
								<TabsTrigger value="list">List View</TabsTrigger>
							</TabsList>

							<TabsContent value="visual" className="space-y-4">
								<Card className="flex flex-col items-center justify-center bg-white p-8 shadow-md dark:bg-gray-800">
									<Map className="h-16 w-16 text-gray-400 dark:text-gray-600" />
									<h3 className="mt-4 text-xl font-medium">Metro Map Visualization</h3>
									<p className="mt-2 text-center text-gray-500 dark:text-gray-400">
										Interactive Metro Map visualization coming soon. This will show possible career paths
										between different job families and levels.
									</p>
									<Button className="mt-6">View Demo Map</Button>
								</Card>
							</TabsContent>

							<TabsContent value="list" className="space-y-4">
								{CAREER_PATHS.map((path) => (
									<Card key={path.id} className="bg-white shadow-md dark:bg-gray-800">
										<div className="border-b border-gray-200 p-6 dark:border-gray-700">
											<h3 className="text-xl font-medium">{path.name}</h3>
											<p className="mt-1 text-gray-500 dark:text-gray-400">{path.description}</p>
										</div>
										<div className="p-6">
											<div className="relative">
												{/* Path line */}
												<div className="absolute left-4 top-0 h-full w-0.5 bg-indigo-200 dark:bg-indigo-900"></div>

												{/* Stations */}
												<div className="space-y-8">
													{path.stations.map((station, index) => {
														const isCurrentPosition =
															station.name.includes(CURRENT_POSITION.jobFamily) &&
															station.name.includes(CURRENT_POSITION.level);

														const isAvailable = isAvailableNextStep(station);

														return (
															<div key={station.id} className="relative pl-10">
																{/* Station marker */}
																<div
																	className={`absolute left-0 top-1 h-8 w-8 rounded-full ${isCurrentPosition
																			? "bg-green-500 ring-4 ring-green-100 dark:ring-green-900"
																			: isAvailable
																				? "bg-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-900"
																				: "bg-gray-300 dark:bg-gray-700"
																		} flex items-center justify-center`}
																>
																	{isCurrentPosition && (
																		<span className="text-xs font-bold text-white">YOU</span>
																	)}
																</div>

																<div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
																	<div className="flex items-center justify-between">
																		<h4 className="font-medium">{station.name}</h4>
																		{isAvailable && !isCurrentPosition && (
																			<span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
																				Available
																			</span>
																		)}
																	</div>

																	<div className="mt-2 flex items-center justify-between">
																		<div className="flex items-center space-x-4">
																			<span className="text-sm text-gray-500 dark:text-gray-400">Level {station.level}</span>
																		</div>

																		<Link
																			href={`/job-family/${station.id.split('-')[0]}`}
																			className="flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
																		>
																			View details
																			<ChevronRight className="ml-1 h-4 w-4" />
																		</Link>
																	</div>
																</div>
															</div>
														);
													})}
												</div>
											</div>
										</div>
									</Card>
								))}
							</TabsContent>
						</Tabs>
					</div>
				</main>
			</div>
		</div>
	);
}