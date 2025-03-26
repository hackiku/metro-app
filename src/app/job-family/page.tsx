// src/app/job-family/page.tsx

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Briefcase, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { Navbar } from "../_components/layout/Navbar";
import { Sidebar } from "../_components/layout/Sidebar";

// Simplified data structure for job families
const JOB_FAMILIES = [
	{
		id: "business-partnering",
		name: "Business Partnering",
		department: "People&",
		description: "Analyse, advise, and implement solutions associated with their functional discipline for an assigned function/department.",
		competences: ["Forming Judgment", "Problem Analysis", "Organisation Sensitivity", "Persuasiveness"],
		relatedFamilies: ["business-analysis", "product-management"]
	},
	{
		id: "business-analysis",
		name: "Business Analysis",
		department: "Product & Technology",
		description: "Identify and analyse business problems and support the realisation of workable solutions using analytical techniques.",
		competences: ["Problem Analysis", "Forming Judgment", "Planning & Organising", "Result-Orientedness"],
		relatedFamilies: ["business-partnering", "product-management", "data-analysis"]
	},
	{
		id: "product-management",
		name: "Product Management",
		department: "Product & Technology",
		description: "Deliver maximised value to customers by defining product vision and strategy and guiding product development.",
		competences: ["Adaptability", "Innovative Power", "Result-Orientedness", "Problem Analysis"],
		relatedFamilies: ["business-analysis", "commercial-expertise"]
	},
	{
		id: "buying",
		name: "Buying",
		department: "Commercial",
		description: "Effectively respond to consumer demand by understanding market trends and ensuring supply of an optimal assortment of goods.",
		competences: ["Decisiveness", "Problem Analysis", "Cooperation", "Persuasiveness", "Negotiating"],
		relatedFamilies: ["commercial-partnering", "commercial-expertise"]
	},
	{
		id: "commercial-partnering",
		name: "Commercial Partnering",
		department: "Commercial",
		description: "Build, grow and maintain long-term relationships with customers through acquisition and account management.",
		competences: ["Problem Analysis", "Innovative Power", "Persuasiveness", "Organisation Sensitivity"],
		relatedFamilies: ["commercial-expertise", "buying"]
	},
	{
		id: "commercial-expertise",
		name: "Commercial Expertise",
		department: "Commercial",
		description: "Plan, analyse, advise and optimise the customer journey cycle and/or promotions and marketing campaigns.",
		competences: ["Insight", "Focus on Quality", "Cooperation", "Vision", "Customer Orientation"],
		relatedFamilies: ["commercial-partnering", "product-management"]
	}
];

// Departmental colors
const DEPARTMENT_COLORS: Record<string, string> = {
	"People&": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
	"Product & Technology": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
	"Commercial": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function JobFamiliesPage() {
	return (
		<div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
			<Sidebar />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar />

				<main className="flex-1 overflow-auto p-6">
					<div className="space-y-6">
						<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">Job Families</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Explore career paths and opportunities across the organization
								</p>
							</div>

							{/* Search bar */}
							<div className="relative w-full max-w-sm">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
								<input
									type="text"
									placeholder="Search job families..."
									className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-4 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
								/>
							</div>
						</div>

						<Tabs defaultValue="all" className="space-y-4">
							<TabsList className="bg-gray-100 dark:bg-gray-800">
								<TabsTrigger value="all">All Families</TabsTrigger>
								<TabsTrigger value="people">People & Support</TabsTrigger>
								<TabsTrigger value="product">Product & Technology</TabsTrigger>
								<TabsTrigger value="commercial">Commercial</TabsTrigger>
							</TabsList>

							<TabsContent value="all" className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{JOB_FAMILIES.map((family) => (
										<Link href={`/job-family/${family.id}`} key={family.id}>
											<Card className="cursor-pointer bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
												<div className="mb-2 flex justify-between">
													<Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
													<span className={`rounded-full px-2 py-1 text-xs font-medium ${DEPARTMENT_COLORS[family.department]}`}>
														{family.department}
													</span>
												</div>
												<h2 className="text-lg font-semibold">{family.name}</h2>
												<p className="mb-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
													{family.description}
												</p>
												<div className="flex flex-wrap gap-2">
													{family.competences.slice(0, 2).map((competence) => (
														<span
															key={competence}
															className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
														>
															{competence}
														</span>
													))}
													{family.competences.length > 2 && (
														<span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
															+{family.competences.length - 2} more
														</span>
													)}
												</div>
												<div className="mt-4 flex items-center justify-end text-sm text-indigo-600 dark:text-indigo-400">
													View details
													<ChevronRight className="ml-1 h-4 w-4" />
												</div>
											</Card>
										</Link>
									))}
								</div>
							</TabsContent>

							<TabsContent value="people" className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{JOB_FAMILIES.filter(f => f.department === "People&").map((family) => (
										<Link href={`/job-family/${family.id}`} key={family.id}>
											<Card className="cursor-pointer bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
												{/* Same card content as above */}
												<div className="mb-2 flex justify-between">
													<Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
													<span className={`rounded-full px-2 py-1 text-xs font-medium ${DEPARTMENT_COLORS[family.department]}`}>
														{family.department}
													</span>
												</div>
												<h2 className="text-lg font-semibold">{family.name}</h2>
												<p className="mb-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
													{family.description}
												</p>
												<div className="flex flex-wrap gap-2">
													{family.competences.slice(0, 2).map((competence) => (
														<span
															key={competence}
															className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
														>
															{competence}
														</span>
													))}
													{family.competences.length > 2 && (
														<span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
															+{family.competences.length - 2} more
														</span>
													)}
												</div>
												<div className="mt-4 flex items-center justify-end text-sm text-indigo-600 dark:text-indigo-400">
													View details
													<ChevronRight className="ml-1 h-4 w-4" />
												</div>
											</Card>
										</Link>
									))}
								</div>
							</TabsContent>

							{/* Other tabs have similar content to "people" tab, filtered by department */}
							<TabsContent value="product" className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{JOB_FAMILIES.filter(f => f.department === "Product & Technology").map((family) => (
										<Link href={`/job-family/${family.id}`} key={family.id}>
											<Card className="cursor-pointer bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
												{/* Same card content structure */}
												<div className="mb-2 flex justify-between">
													<Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
													<span className={`rounded-full px-2 py-1 text-xs font-medium ${DEPARTMENT_COLORS[family.department]}`}>
														{family.department}
													</span>
												</div>
												<h2 className="text-lg font-semibold">{family.name}</h2>
												<p className="mb-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
													{family.description}
												</p>
												<div className="mt-4 flex items-center justify-end text-sm text-indigo-600 dark:text-indigo-400">
													View details
													<ChevronRight className="ml-1 h-4 w-4" />
												</div>
											</Card>
										</Link>
									))}
								</div>
							</TabsContent>

							<TabsContent value="commercial" className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{JOB_FAMILIES.filter(f => f.department === "Commercial").map((family) => (
										<Link href={`/job-family/${family.id}`} key={family.id}>
											<Card className="cursor-pointer bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
												{/* Same card content structure */}
												<div className="mb-2 flex justify-between">
													<Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
													<span className={`rounded-full px-2 py-1 text-xs font-medium ${DEPARTMENT_COLORS[family.department]}`}>
														{family.department}
													</span>
												</div>
												<h2 className="text-lg font-semibold">{family.name}</h2>
												<p className="mb-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
													{family.description}
												</p>
												<div className="mt-4 flex items-center justify-end text-sm text-indigo-600 dark:text-indigo-400">
													View details
													<ChevronRight className="ml-1 h-4 w-4" />
												</div>
											</Card>
										</Link>
									))}
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</main>
			</div>
		</div>
	);
}


