// src/app/hr/components/PathPositionsList.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "~/contexts/SessionContext";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
	Pencil,
	Plus,
	Loader2,
	Trash2,
	Save,
	X,
	Info,
	AlertTriangle
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { AssignPositionForm } from "./AssignPositionForm";

interface PathPositionsListProps {
	careerPathId: string;
	pathName: string;
}

/**
 * Path Positions List component
 * 
 * Displays positions assigned to a specific career path and allows:
 * - Assigning new positions to the path
 * - Editing position details within the path
 * - Removing positions from the path
 */
export function PathPositionsList({
	careerPathId,
	pathName
}: PathPositionsListProps) {
	const { currentOrgId } = useSession();
	const [isAssigning, setIsAssigning] = useState(false);
	const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
	const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

	// Edit form state
	const [editedDetail, setEditedDetail] = useState<{
		level?: number;
		sequenceInPath?: number;
		pathSpecificDescription?: string | null;
	}>({});

	// Get tRPC utils for cache invalidation
	const utils = api.useUtils();

	// Fetch positions assigned to this career path
	const pathPositionsQuery = api.position.getByCareerPath.useQuery(
		{
			organizationId: currentOrgId!,
			careerPathId
		},
		{ enabled: !!currentOrgId && !!careerPathId }
	);

	// Set up mutations
	const updateDetailMutation = api.position.updatePositionDetail.useMutation({
		onSuccess: () => {
			setEditingDetailId(null);
			setEditedDetail({});

			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
		}
	});

	const removePositionMutation = api.position.removeFromPath.useMutation({
		onSuccess: () => {
			setConfirmRemoveId(null);

			utils.position.getByCareerPath.invalidate({
				organizationId: currentOrgId!,
				careerPathId
			});
		}
	});

	// Handler functions
	const handleEditDetail = (
		id: string,
		level: number,
		sequenceInPath: number | undefined,
		description: string | null
	) => {
		setEditingDetailId(id);
		setEditedDetail({
			level,
			sequenceInPath: sequenceInPath || level,
			pathSpecificDescription: description
		});
	};

	const handleSaveDetail = (id: string) => {
		updateDetailMutation.mutate({
			id,
			...editedDetail
		});
	};

	const handleRemovePosition = (id: string) => {
		removePositionMutation.mutate({ id });
	};

	// Sort positions by level and then by sequence_in_path if available
	const sortedPositions = [...(pathPositionsQuery.data || [])].sort((a, b) => {
		const levelDiff = a.level - b.level;
		if (levelDiff !== 0) return levelDiff;

		// If levels are the same, try to sort by sequence
		if (a.sequence_in_path && b.sequence_in_path) {
			return a.sequence_in_path - b.sequence_in_path;
		}

		return 0;
	});

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl">{pathName}</CardTitle>
							<CardDescription>
								Positions within this career path
							</CardDescription>
						</div>
						<Button
							onClick={() => setIsAssigning(true)}
							disabled={pathPositionsQuery.isLoading}
						>
							<Plus className="mr-2 h-4 w-4" />
							Assign Position
						</Button>
					</div>
				</CardHeader>

				<CardContent>
					{pathPositionsQuery.isLoading ? (
						<div className="flex items-center justify-center h-40">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							<span className="ml-2 text-muted-foreground">Loading positions...</span>
						</div>
					) : pathPositionsQuery.error ? (
						<div className="bg-destructive/10 p-4 rounded-md text-destructive">
							<p>Error loading positions: {pathPositionsQuery.error.message}</p>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader className="bg-muted/50">
									<TableRow>
										<TableHead>Position</TableHead>
										<TableHead>Level</TableHead>
										<TableHead>Sequence</TableHead>
										<TableHead>Path-Specific Description</TableHead>
										<TableHead className="w-24">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{sortedPositions.length === 0 ? (
										<TableRow>
											<TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
												No positions assigned to this career path yet.
											</TableCell>
										</TableRow>
									) : (
										sortedPositions.map((detail) => (
											<TableRow key={detail.id}>
												<TableCell>
													<span className="font-medium">
														{detail.positions?.name || "Unknown Position"}
													</span>
												</TableCell>
												<TableCell>
													{editingDetailId === detail.id ? (
														<Input
															type="number"
															min={1}
															value={editedDetail.level}
															onChange={(e) => setEditedDetail({
																...editedDetail,
																level: parseInt(e.target.value)
															})}
															className="w-20"
														/>
													) : (
														detail.level
													)}
												</TableCell>
												<TableCell>
													{editingDetailId === detail.id ? (
														<Input
															type="number"
															min={1}
															value={editedDetail.sequenceInPath}
															onChange={(e) => setEditedDetail({
																...editedDetail,
																sequenceInPath: parseInt(e.target.value)
															})}
															className="w-20"
														/>
													) : (
														detail.sequence_in_path || (
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger>
																		<span className="flex items-center text-muted-foreground">
																			<Info className="h-3 w-3 mr-1" />
																			Same as level
																		</span>
																	</TooltipTrigger>
																	<TooltipContent>
																		<p>No specific sequence set, defaulting to level value</p>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														)
													)}
												</TableCell>
												<TableCell className="max-w-xs">
													{editingDetailId === detail.id ? (
														<Textarea
															value={editedDetail.pathSpecificDescription || ""}
															onChange={(e) => setEditedDetail({
																...editedDetail,
																pathSpecificDescription: e.target.value
															})}
															className="h-20"
														/>
													) : (
														detail.path_specific_description || (
															<span className="text-muted-foreground italic">
																Using generic description
															</span>
														)
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														{editingDetailId === detail.id ? (
															<>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => handleSaveDetail(detail.id)}
																	disabled={updateDetailMutation.isPending}
																>
																	{updateDetailMutation.isPending ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : (
																		<Save className="h-4 w-4" />
																	)}
																</Button>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => setEditingDetailId(null)}
																>
																	<X className="h-4 w-4" />
																</Button>
															</>
														) : (
															<>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => handleEditDetail(
																		detail.id,
																		detail.level,
																		detail.sequence_in_path,
																		detail.path_specific_description
																	)}
																>
																	<Pencil className="h-4 w-4" />
																</Button>
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={() => setConfirmRemoveId(detail.id)}
																>
																	<Trash2 className="h-4 w-4 text-destructive" />
																</Button>
															</>
														)}
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					)}

					{!pathPositionsQuery.isLoading && sortedPositions.length > 0 && (
						<div className="mt-4 bg-muted/50 p-3 rounded-md flex items-start gap-2">
							<AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
							<div className="text-sm">
								<p className="font-medium">About Levels and Sequences</p>
								<p className="text-muted-foreground mt-1">
									<strong>Level</strong> represents the seniority or pay grade of a position.
									<strong>Sequence</strong> determines the position's order within the same level for visualization.
									If sequence is not specified, it will use the level value.
								</p>
							</div>
						</div>
					)}
				</CardContent>

				<CardFooter className="flex justify-between">
					<div className="text-xs text-muted-foreground">
						{pathPositionsQuery.data ? `${pathPositionsQuery.data.length} positions in this path` : ''}
					</div>
				</CardFooter>
			</Card>

			{/* Assign Position Dialog */}
			<Dialog open={isAssigning} onOpenChange={setIsAssigning}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Assign Position to Path</DialogTitle>
						<DialogDescription>
							Add a position to the "{pathName}" career path
						</DialogDescription>
					</DialogHeader>

					<AssignPositionForm
						careerPathId={careerPathId}
						onComplete={() => setIsAssigning(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Remove Position Confirmation Dialog */}
			<Dialog
				open={!!confirmRemoveId}
				onOpenChange={(open) => !open && setConfirmRemoveId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Removal</DialogTitle>
						<DialogDescription>
							Are you sure you want to remove this position from the career path? This won't delete the position itself.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmRemoveId(null)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => confirmRemoveId && handleRemovePosition(confirmRemoveId)}
							disabled={removePositionMutation.isPending}
						>
							{removePositionMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Removing...
								</>
							) : (
								'Remove'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}