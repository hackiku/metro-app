// src/app/growth/LearningResourcesCard.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BookOpen, Briefcase, CheckCircle2, Compass, Link as LinkIcon, Pencil, Play, School } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useCareerPlan } from "~/contexts/CareerPlanContext";
import { api } from "~/trpc/react";
import { useOrganization } from "~/contexts/OrganizationContext";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

export function LearningResourcesCard() {
	const [activeTab, setActiveTab] = useState("recommended");
	const { currentOrganization } = useOrganization();
	const { activePlan } = useCareerPlan();

	// Get learning resources for the organization
	const { data: learningResources, isLoading } = api.learning.getAll.useQuery(
		{ organizationId: currentOrganization?.id! },
		{ enabled: !!currentOrganization?.id }
	);

	// Format learning resources by type
	const resourcesByType = useMemo(() => {
		if (!learningResources) return {};

		return learningResources.reduce((acc, resource) => {
			const type = resource.type || 'other';
			if (!acc[type]) {
				acc[type] = [];
			}
			acc[type].push(resource);
			return acc;
		}, {});
	}, [learningResources]);

	// Get recommended resources - for demo we'll take first 3 from each type
	const recommendedResources = useMemo(() => {
		const result = [];
		if (!resourcesByType) return [];

		Object.keys(resourcesByType).forEach(type => {
			if (resourcesByType[type]?.length > 0) {
				// Take up to 3 from each type
				result.push(...resourcesByType[type].slice(0, 3));
			}
		});

		return result.slice(0, 6); // Limit to 6 total for UI
	}, [resourcesByType]);

	// Function to get icon by resource type
	const getResourceIcon = (type) => {
		const iconMap = {
			'course': School,
			'book': BookOpen,
			'video': Play,
			'article': Pencil,
			'website': LinkIcon,
			'project': Briefcase,
		};

		return iconMap[type] || Compass;
	};

	// If data is loading
	if (isLoading) {
		return (
			<Card className="shadow-sm">
				<CardHeader className="p-4">
					<CardTitle className="text-lg">Learning Resources</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-muted rounded-md"></div>
						<div className="space-y-2">
							<div className="h-4 bg-muted rounded-md"></div>
							<div className="h-4 bg-muted rounded-md w-5/6"></div>
							<div className="h-4 bg-muted rounded-md w-4/6"></div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// If no resources
	if (!learningResources || learningResources.length === 0) {
		return (
			<Card className="shadow-sm">
				<CardHeader className="p-4">
					<CardTitle className="text-lg">Learning Resources</CardTitle>
				</CardHeader>
				<CardContent className="p-4 pt-0 text-center">
					<p className="text-muted-foreground py-6">
						No learning resources available.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="shadow-sm">
			<CardHeader className="p-4">
				<CardTitle className="text-lg">Learning Resources</CardTitle>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="recommended">Recommended</TabsTrigger>
						<TabsTrigger value="all">All Resources</TabsTrigger>
					</TabsList>

					{/* Recommended resources */}
					<TabsContent value="recommended" className="space-y-3 mt-2">
						{recommendedResources.length > 0 ? (
							recommendedResources.map((resource) => (
								<ResourceItem
									key={resource.id}
									resource={resource}
									icon={getResourceIcon(resource.type)}
								/>
							))
						) : (
							<p className="text-center text-muted-foreground py-4">
								No recommended resources available.
							</p>
						)}
					</TabsContent>

					{/* All resources by type */}
					<TabsContent value="all" className="space-y-4 mt-2">
						{Object.keys(resourcesByType).length > 0 ? (
							Object.keys(resourcesByType).map((type) => (
								<div key={type}>
									<h3 className="mb-2 text-sm font-medium capitalize">{type}</h3>
									<div className="space-y-3">
										{resourcesByType[type].map((resource) => (
											<ResourceItem
												key={resource.id}
												resource={resource}
												icon={getResourceIcon(resource.type)}
											/>
										))}
									</div>
								</div>
							))
						) : (
							<p className="text-center text-muted-foreground py-4">
								No resources available.
							</p>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

// Resource item component
function ResourceItem({ resource, icon: Icon }) {
	const isCompleted = false; // In real app, would check against user progress
	const hasUrl = !!resource.url;

	return (
		<div
			className={cn(
				"flex items-start gap-3 rounded-md border p-3 transition-colors",
				isCompleted ? "bg-green-500/10 border-green-500/30" : "bg-card"
			)}
		>
			<div className={cn(
				"mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
				isCompleted ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary"
			)}>
				<Icon className="h-3.5 w-3.5" />
			</div>
			<div className="flex-1">
				<div className="flex items-start justify-between gap-2">
					<div>
						<h4 className={cn(
							"text-sm font-medium text-foreground",
							isCompleted && "line-through text-muted-foreground"
						)}>
							{resource.title}
						</h4>
						<p className="text-xs text-muted-foreground">
							{resource.source || resource.description?.substring(0, 60) || "No description available"}
						</p>
						{resource.estimated_duration && (
							<Badge variant="outline" className="mt-1 text-[10px]">
								{resource.estimated_duration}
							</Badge>
						)}
					</div>
					{hasUrl && (
						<Link href={resource.url} target="_blank" rel="noopener noreferrer">
							<Button variant="outline" size="sm" className="h-7 px-2">
								<LinkIcon className="h-3.5 w-3.5" />
							</Button>
						</Link>
					)}
					{isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
				</div>
			</div>
		</div>
	);
}