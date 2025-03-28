
// ~/app/job-family/[id]/page.tsx

"use client"

import { useParams } from "next/navigation";
import { Navbar } from "~/app/_components/layout/Navbar";
import { Sidebar } from "~/app/_components/layout/Sidebar";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Briefcase, User, Book, ChevronRight, Award, FileText, PieChart } from "lucide-react";
import Link from "next/link";

// Simplified data structure for job families
const JOB_FAMILIES = [
	{
		id: "business-partnering",
		name: "Business Partnering",
		department: "People&",
		description: "Analyse, advise, and implement solutions associated with their functional discipline for an assigned function/department.",
		longDescription: "Within the capability Business Partnering, you analyse, advise, and implement solutions associated with their functional discipline (e.g. Finance, People& etc.) for an assigned function/department. Support managers and teams to improve business processes and ways of working and to make decisions; in order to contribute to the realisation of business objectives.",
		competences: ["Forming Judgment", "Problem Analysis", "Organisation Sensitivity", "Persuasiveness", "Vision", "Planning & Organising", "Independence"],
		accountabilities: [
			{
				name: "Business Advice",
				description: "Advise managers and teams within assigned function/department on topics associated with their functional discipline, and formulate, present, and implement possible solutions."
			},
			{
				name: "Business Support",
				description: "Support and coach managers and teams with the development and implementation of business initiatives and programs within their department/team."
			},
			{
				name: "Performance Improvement",
				description: "Measure, benchmark and evaluate performance indicators of the assigned function/department in order to initiate and implement changes and/or interventions."
			},
			{
				name: "Project Management",
				description: "Lead and/or participate in various projects and improvement initiatives within assigned function/department."
			}
		],
		relatedFamilies: ["business-analysis", "product-management"],
		grades: ["Junior", "Medior", "Senior", "Lead"]
	},
	{
		id: "business-analysis",
		name: "Business Analysis",
		department: "Product & Technology",
		description: "Identify and analyse business problems and support the realisation of workable solutions using analytical techniques.",
		longDescription: "Within the capability Business Analysis, you identify and analyse business problems and support the realisation of workable solutions to these business problems using analytical and process optimisation techniques. You support customer- and partner-centric innovation by generating and analysing business ideas, and highlighting the opportunities and risks associated with these ideas.",
		competences: ["Problem Analysis", "Forming Judgment", "Planning & Organising", "Result-Orientedness", "Persuasiveness", "Cooperation", "Innovative Power"],
		accountabilities: [
			{
				name: "Business Analysis",
				description: "Provide timely and accurate analysis to test the effectiveness of current and future processes and systems."
			},
			{
				name: "Business Innovation",
				description: "Generate new business ideas and insights for stakeholders within and outside own domain/department."
			},
			{
				name: "Project Management",
				description: "Draft project plans and define goals and intermediate results, both in terms of output and timing."
			},
			{
				name: "Stakeholder Management",
				description: "Act as an ambassador for own domain/department by playing the connector role with stakeholders."
			},
			{
				name: "Change Management",
				description: "Support embedding of new ways of working by communicating clearly and training colleagues."
			}
		],
		relatedFamilies: ["business-partnering", "product-management", "data-analysis"],
		grades: ["Junior", "Medior", "Senior", "Principal"]
	},
	// Other job families...
];

// Sample data for development activities based on competence
const DEVELOPMENT_ACTIVITIES = {
	"Forming Judgment": [
		{ type: "On the Job (70%)", activity: "Lead a decision-making process on a complex issue where multiple stakeholders are involved." },
		{ type: "Social Learning (20%)", activity: "Shadow a senior colleague during important decision-making meetings." },
		{ type: "Formal Learning (10%)", activity: "Take a course on critical thinking and decision analysis." }
	],
	"Problem Analysis": [
		{ type: "On the Job (70%)", activity: "Analyze a complex business problem and present multiple solution options." },
		{ type: "Social Learning (20%)", activity: "Participate in problem-solving workshops across departments." },
		{ type: "Formal Learning (10%)", activity: "Complete a training on data analysis and problem-solving methodologies." }
	],
	"Organisation Sensitivity": [
		{ type: "On the Job (70%)", activity: "Map out stakeholders for a project and create engagement strategies for each." },
		{ type: "Social Learning (20%)", activity: "Join cross-functional meetings to better understand different perspectives." },
		{ type: "Formal Learning (10%)", activity: "Study organizational behavior through a certified course." }
	],
	// Other competences...
};

export default function JobFamilyDetail() {
	const params = useParams();
	const familyId = params.id as string;

	// Find the current job family from our simplified data
	const jobFamily = JOB_FAMILIES.find(f => f.id === familyId) || JOB_FAMILIES[0];

	return (
		<div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
			<Sidebar />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar />

				<main className="flex-1 overflow-auto p-6">
					<div className="space-y-6">
						{/* Breadcrumb and back button */}
						<div className="flex items-center justify-between">
							<Link href="/job-family" className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Job Families
							</Link>
						</div>

						{/* Job Family Header */}
						<div className="border-b border-gray-200 pb-6 dark:border-gray-700">
							<div className="flex items-center gap-2">
								<span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
									{jobFamily.department}
								</span>
							</div>
							<h1 className="mt-3 text-3xl font-bold tracking-tight">{jobFamily.name}</h1>
							<p className="mt-2 max-w-3xl text-gray-500 dark:text-gray-400">
								{jobFamily.longDescription}
							</p>
						</div>

						<Tabs defaultValue="overview" className="space-y-4">
							<TabsList className="bg-gray-100 dark:bg-gray-800">
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="accountabilities">Accountabilities</TabsTrigger>
								<TabsTrigger value="competences">Competences</TabsTrigger>
								<TabsTrigger value="development">Development</TabsTrigger>
								<TabsTrigger value="career-paths">Career Paths</TabsTrigger>
							</TabsList>

							<TabsContent value="overview" className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
											<User className="h-5 w-5" />
										</div>
										<h3 className="font-medium text-gray-900 dark:text-white">Department</h3>
										<p className="mt-1 text-gray-500 dark:text-gray-400">{jobFamily.department}</p>
									</Card>

									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
											<Award className="h-5 w-5" />
										</div>
										<h3 className="font-medium text-gray-900 dark:text-white">Career Grades</h3>
										<p className="mt-1 text-gray-500 dark:text-gray-400">
											{jobFamily.grades.join(", ")}
										</p>
									</Card>

									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
											<Book className="h-5 w-5" />
										</div>
										<h3 className="font-medium text-gray-900 dark:text-white">Competences</h3>
										<p className="mt-1 text-gray-500 dark:text-gray-400">
											{jobFamily.competences.length} key competences
										</p>
									</Card>

									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
											<FileText className="h-5 w-5" />
										</div>
										<h3 className="font-medium text-gray-900 dark:text-white">Accountabilities</h3>
										<p className="mt-1 text-gray-500 dark:text-gray-400">
											{jobFamily.accountabilities.length} key areas
										</p>
									</Card>
								</div>

								<div className="grid gap-4 lg:grid-cols-2">
									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<h3 className="mb-4 text-lg font-medium">Related Job Families</h3>
										<div className="space-y-3">
											{jobFamily.relatedFamilies.map((relatedId) => {
												const related = JOB_FAMILIES.find(f => f.id === relatedId);
												if (!related) return null;

												return (
													<Link
														href={`/job-family/${relatedId}`}
														key={relatedId}
														className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
													>
														<div className="flex items-center">
															<Briefcase className="mr-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
															<div>
																<h4 className="font-medium">{related.name}</h4>
																<p className="text-sm text-gray-500 dark:text-gray-400">{related.department}</p>
															</div>
														</div>
														<ChevronRight className="h-5 w-5 text-gray-400" />
													</Link>
												);
											})}
										</div>
									</Card>

									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<h3 className="mb-4 text-lg font-medium">Career Development</h3>
										<p className="mb-4 text-gray-500 dark:text-gray-400">
											Explore development resources and career paths for the {jobFamily.name} job family.
										</p>
										<div className="space-y-3">
											<Button variant="outline" className="w-full justify-start text-left">
												<Book className="mr-2 h-5 w-5" />
												<span>View Development Guide</span>
											</Button>
											<Link href="/career-path" className="inline-block w-full">
												<Button variant="outline" className="w-full justify-start text-left">
													<PieChart className="mr-2 h-5 w-5" />
													<span>Explore Career Paths</span>
												</Button>
											</Link>
										</div>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="accountabilities" className="space-y-4">
								<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
									<h3 className="mb-6 text-lg font-medium">Key Accountabilities</h3>
									<div className="space-y-8">
										{jobFamily.accountabilities.map((accountability, index) => (
											<div key={index} className="relative border-l-2 border-indigo-200 pl-6 dark:border-indigo-800">
												<div className="absolute -left-[10px] top-0 h-5 w-5 rounded-full bg-indigo-500 ring-2 ring-white dark:bg-indigo-400 dark:ring-gray-800"></div>
												<h4 className="mb-2 font-medium">{accountability.name}</h4>
												<p className="text-gray-500 dark:text-gray-400">{accountability.description}</p>
											</div>
										))}
									</div>
								</Card>
							</TabsContent>

							<TabsContent value="competences" className="space-y-4">
								<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
									<h3 className="mb-6 text-lg font-medium">Required Competences</h3>
									<div className="space-y-6">
										{jobFamily.competences.map((competence, index) => (
											<div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
												<h4 className="mb-2 font-medium">{competence}</h4>
												<p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
													{competence === "Forming Judgment" ?
														"The ability to balance facts and potential approaches taking the appropriate criteria into account." :
														competence === "Problem Analysis" ?
															"Identifying problems, recognising important information, searching for relevant data and making connections." :
															"Skills and behaviors that contribute to excellent performance in this role."}
												</p>
												<Button variant="link" className="p-0 text-sm text-indigo-600 dark:text-indigo-400">
													View development activities
												</Button>
											</div>
										))}
									</div>
								</Card>
							</TabsContent>

							<TabsContent value="development" className="space-y-4">
								<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
									<h3 className="mb-4 text-lg font-medium">Development Guide</h3>
									<p className="mb-6 text-gray-500 dark:text-gray-400">
										Follow the 70-20-10 learning model to develop competences for this job family.
									</p>

									<Tabs defaultValue={jobFamily.competences[0]} className="space-y-4">
										<TabsList className="flex-wrap">
											{jobFamily