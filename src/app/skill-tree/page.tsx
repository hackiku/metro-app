// src/app/page.tsx

import { Navbar } from "./_components/layout/Navbar";
import { Sidebar } from "./_components/layout/Sidebar";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BarChart2, FileText, Map, ArrowRight, BookOpen, Award, Briefcase } from "lucide-react";

export default function Home() {
	return (
		<div className="flex h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
			<Sidebar />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Navbar />

				<main className="flex-1 overflow-auto p-6">
					<div className="space-y-6">
						<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
							<div>
								<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
								<p className="text-gray-500 dark:text-gray-400">
									Welcome to your career development dashboard
								</p>
							</div>
							<Button className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">
								Start Assessment
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>

						<Tabs defaultValue="overview" className="space-y-4">
							<TabsList className="bg-gray-100 dark:bg-gray-800">
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="jobFamilies">Job Families</TabsTrigger>
								<TabsTrigger value="development">Development</TabsTrigger>
							</TabsList>

							<TabsContent value="overview" className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<div className="flex flex-row items-center justify-between space-y-0 pb-2">
											<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Position</h3>
											<Briefcase className="h-4 w-4 text-gray-500 dark:text-gray-400" />
										</div>
										<div className="text-2xl font-bold">Senior Developer</div>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Product & Technology
										</p>
									</Card>

									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<div className="flex flex-row items-center justify-between space-y-0 pb-2">
											<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Competence Score</h3>
											<Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />
										</div>
										<div className="text-2xl font-bold">78%</div>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											+4% from last assessment
										</p>
									</Card>

									<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
										<div className="flex flex-row items-center justify-between space-y-0 pb-2">
											<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Development Activities</h3>
											<BookOpen className="h-4 w-4 text-gray-500 dark:text-gray-400" />
										</div>
										<div className="text-2xl font-bold">7</div>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											3 in progress, 4 completed
										</p>
									</Card>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<Card className="col-span-1 bg-white p-6 shadow-md dark:bg-gray-800">
										<h2 className="text-xl font-semibold">Growth Path</h2>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Your projected career development path
										</p>
										<div className="mt-4 flex h-64 items-center justify-center">
											<div className="flex flex-col items-center">
												<Map className="h-16 w-16 text-gray-400 dark:text-gray-600" />
												<p className="mt-4 text-center text-gray-500 dark:text-gray-400">Metro Map Visualization Coming Soon</p>
											</div>
										</div>
									</Card>

									<Card className="col-span-1 bg-white p-6 shadow-md dark:bg-gray-800">
										<h2 className="text-xl font-semibold">Competency Breakdown</h2>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											Your skills and areas for improvement
										</p>
										<div className="mt-4 flex h-64 items-center justify-center">
											<div className="flex flex-col items-center">
												<BarChart2 className="h-16 w-16 text-gray-400 dark:text-gray-600" />
												<p className="mt-4 text-center text-gray-500 dark:text-gray-400">Competency Chart Coming Soon</p>
											</div>
										</div>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="jobFamilies" className="space-y-4">
								<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
									<h2 className="text-xl font-semibold">Job Families Explorer</h2>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Explore available job families across the organization
									</p>
									<div className="mt-6 flex h-64 items-center justify-center">
										<div className="flex flex-col items-center">
											<FileText className="h-16 w-16 text-gray-400 dark:text-gray-600" />
											<p className="mt-4 text-center text-gray-500 dark:text-gray-400">Job Families Content Coming Soon</p>
										</div>
									</div>
								</Card>
							</TabsContent>

							<TabsContent value="development" className="space-y-4">
								<Card className="bg-white p-6 shadow-md dark:bg-gray-800">
									<h2 className="text-xl font-semibold">Development Plan</h2>
									<p className="text-sm text-gray-500 dark:text-gray-400">
										Your personalized career development activities
									</p>
									<div className="mt-6 flex h-64 items-center justify-center">
										<div className="flex flex-col items-center">
											<FileText className="h-16 w-16 text-gray-400 dark:text-gray-600" />
											<p className="mt-4 text-center text-gray-500 dark:text-gray-400">Development Plan Content Coming Soon</p>
										</div>
									</div>
								</Card>
							</TabsContent>
						</Tabs>
					</div>
				</main>
			</div>
		</div>
	);
}