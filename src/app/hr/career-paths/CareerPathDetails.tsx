// src/app/hr/career-paths/CareerPathDetails.tsx

"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft, Edit, Users, Map, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { CareerPathForm } from "./CareerPathForm";
import { AssignmentsList } from "../assignments/AssignmentsList";
import { toast } from "sonner";

interface CareerPathDetailsProps {
	pathId: string;
	onBack: () => void;
}

export function CareerPathDetails({
	pathId,
	onBack
}: CareerPathDetailsProps) {
	const { currentOrgId } = useSession();
	const [activeTab, setActiveTab] = useState("positions");
	const [isEditing, setIsEditing] = useState(false);

	// Fetch the specific career path
	const pathQuery = api.career.getPathById.useQuery(
		{ id: pathId },
		{
			enabled: !!pathId,
			staleTime: 1000 * 60 * 5 // 5 minutes
		}
	);

	// Counter for positions in this path
	const positionsCountQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrgId!,
			careerPathId: pathId
		},
		{ enabled: !!currentOrgId && !!pathId }
	);

	const positionCount = positionsCountQuery.data?.length || 0;

	if (pathQuery.isLoading) {
		return (
			<div className="flex items-center justify-center h-40">
				<div className="animate-spin h-6 w-6 border-b-2 border-primary rounded-full mr-2" />
				<span className="text-muted-foreground">Loading career path...</span>
			</div>
		);
	}

	if (pathQuery.error) {
		return (
			<div className="p-4 bg-destructive/10 text-destructive rounded-md">
				<h3 className="font-bold">Error</h3>
				<p>{pathQuery.error.message}</p>
				<Button variant="outline" onClick={onBack} className="mt-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Go Back
				</Button>
			</div>
		);
	}

	const path = pathQuery.data;
	if (!path) {
		return (
			<div className="p-4 bg-muted text-muted-foreground rounded-md">
				<h3 className="font-bold">Not Found</h3>
				<p>The requested career path could not be found.</p>
				<Button variant="outline" onClick={onBack} className="mt-4">
					<ArrowLeft className="mr-2 h-4 w-4" /> Go Back
				</Button>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Button variant="outline" onClick={onBack}>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back to All Paths
					</Button>
					<Button variant="outline" onClick={() => setIsEditing(true)}>
						<Edit className="mr-2 h-4 w-4" /> Edit Path
					</Button>
				</div>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<div>
							<CardTitle className="text-2xl font-bold">{path.name}</CardTitle>
							<CardDescription>
								{path.description || "No description provided"}
							</CardDescription>
						</div>
						<div
							className="w-8 h-8 rounded-full border"
							style={{ backgroundColor: path.color || "#cccccc" }}
						/>
					</CardHeader>

					<CardContent>
						<div className="grid grid-cols-3 gap-4">
							<div className="rounded-lg border bg-card p-3">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">Positions</span>
								</div>
								<p className="mt-1 text-2xl font-bold">{positionCount}</p>
							</div>

							<div className="rounded-lg border bg-card p-3">
								<div className="flex items-center gap-2">
									<BarChart3 className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">Levels</span>
								</div>
								<p className="mt-1 text-2xl font-bold">
									{positionCount > 0 ?
										`${Math.min(...(positionsCountQuery.data?.map(p => p.level) || [0]))} - ${Math.max(...(positionsCountQuery.data?.map(p => p.level) || [0]))}` :
										"N/A"}
								</p>
							</div>

							<div className="rounded-lg border bg-card p-3">
								<div className="flex items-center gap-2">
									<Map className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm font-medium">Metro Map</span>
								</div>
								<Button variant="link" asChild className="h-auto p-0 mt-1">
									<a href={`/metro?path=${path.id}`} target="_blank" rel="noopener noreferrer">
										View in Map
									</a>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="positions">Positions</TabsTrigger>
						<TabsTrigger value="skills" disabled>Skills</TabsTrigger>
						<TabsTrigger value="transitions" disabled>Transitions</TabsTrigger>
					</TabsList>

					<TabsContent value="positions" className="mt-6">
						<AssignmentsList careerPathId={pathId} pathName={path.name} />
					</TabsContent>

					<TabsContent value="skills">
						<Card>
							<CardHeader>
								<CardTitle>Skills</CardTitle>
								<CardDescription>Manage skills for this career path</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-center py-8">
									Skills management will be available in a future update.
								</p>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="transitions">
						<Card>
							<CardHeader>
								<CardTitle>Transitions</CardTitle>
								<CardDescription>Manage position transitions</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-center py-8">
									Transition management will be available in a future update.
								</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>

			{/* Edit Path Dialog */}
			<Dialog open={isEditing} onOpenChange={setIsEditing}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Edit Career Path</DialogTitle>
					</DialogHeader>
					<CareerPathForm
						pathId={pathId}
						onComplete={() => setIsEditing(false)}
						mode="edit"
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}