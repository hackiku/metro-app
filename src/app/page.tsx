// src/app/page.tsx

import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BarChart2, FileText, Map, ArrowRight, BookOpen, Award, Briefcase } from "lucide-react";

export default function Home() {
	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome to your career development dashboard
					</p>
				</div>
				<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
					Start Assessment
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList className="bg-muted">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="jobFamilies">Job Families</TabsTrigger>
					<TabsTrigger value="development">Development</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="p-6">
							<div className="flex flex-row items-center justify-between space-y-0 pb-2">
								<h3 className="text-sm font-medium text-muted-foreground">Your Position</h3>
								<Briefcase className="h-4 w-4 text-muted-foreground" />
							</div>
							<div className="text-2xl font-bold">Senior Developer</div>
							<p className="text-xs text-muted-foreground">
								Product & Technology
							</p>
						</Card>

						<Card className="p-6">
							<div className="flex flex-row items-center justify-between space-y-0 pb-2">
								<h3 className="text-sm font-medium text-muted-foreground">Competence Score</h3>
								<Award className="h-4 w-4 text-muted-foreground" />
							</div>
							<div className="text-2xl font-bold">78%</div>
							<p className="text-xs text-muted-foreground">
								+4% from last assessment
							</p>
						</Card>

						<Card className="p-6">
							<div className="flex flex-row items-center justify-between space-y-0 pb-2">
								<h3 className="text-sm font-medium text-muted-foreground">Development Activities</h3>
								<BookOpen className="h-4 w-4 text-muted-foreground" />
							</div>
							<div className="text-2xl font-bold">7</div>
							<p className="text-xs text-muted-foreground">
								3 in progress, 4 completed
							</p>
						</Card>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<Card className="col-span-1 p-6">
							<h2 className="text-xl font-semibold">Growth Path</h2>
							<p className="text-sm text-muted-foreground">
								Your projected career development path
							</p>
							<div className="mt-4 flex h-64 items-center justify-center">
								<div className="flex flex-col items-center">
									<Map className="h-16 w-16 text-muted" />
									<p className="mt-4 text-center text-muted-foreground">Metro Map Visualization Coming Soon</p>
								</div>
							</div>
						</Card>

						<Card className="col-span-1 p-6">
							<h2 className="text-xl font-semibold">Competency Breakdown</h2>
							<p className="text-sm text-muted-foreground">
								Your skills and areas for improvement
							</p>
							<div className="mt-4 flex h-64 items-center justify-center">
								<div className="flex flex-col items-center">
									<BarChart2 className="h-16 w-16 text-muted" />
									<p className="mt-4 text-center text-muted-foreground">Competency Chart Coming Soon</p>
								</div>
							</div>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="jobFamilies" className="space-y-4">
					<Card className="p-6">
						<h2 className="text-xl font-semibold">Job Families Explorer</h2>
						<p className="text-sm text-muted-foreground">
							Explore available job families across the organization
						</p>
						<div className="mt-6 flex h-64 items-center justify-center">
							<div className="flex flex-col items-center">
								<FileText className="h-16 w-16 text-muted" />
								<p className="mt-4 text-center text-muted-foreground">Job Families Content Coming Soon</p>
							</div>
						</div>
					</Card>
				</TabsContent>

				<TabsContent value="development" className="space-y-4">
					<Card className="p-6">
						<h2 className="text-xl font-semibold">Development Plan</h2>
						<p className="text-sm text-muted-foreground">
							Your personalized career development activities
						</p>
						<div className="mt-6 flex h-64 items-center justify-center">
							<div className="flex flex-col items-center">
								<FileText className="h-16 w-16 text-muted" />
								<p className="mt-4 text-center text-muted-foreground">Development Plan Content Coming Soon</p>
							</div>
						</div>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}