// src/app/hr/components/PositionDetailsTable.tsx
"use client";

import { useState, useMemo } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Pencil, Plus, Save, X, Eye } from "lucide-react";
import type { PositionDetail, CareerPath, Position } from "~/types/compass";
import { supabase } from "~/server/db/supabase";

interface PositionDetailsTableProps {
	positionDetails: PositionDetail[];
	careerPaths: CareerPath[];
	positions: Position[];
	organizationId: string;
	onRefresh: () => void;
}

export function PositionDetailsTable({
	positionDetails,
	careerPaths,
	positions,
	organizationId,
	onRefresh
}: PositionDetailsTableProps) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [newDetail, setNewDetail] = useState<Partial<PositionDetail> | null>(null);
	const [editedValues, setEditedValues] = useState<Partial<PositionDetail>>({});

	// Create lookup maps for easier reference
	const pathsById = useMemo(() => {
		const map = new Map<string, CareerPath>();
		careerPaths.forEach(path => map.set(path.id, path));
		return map;
	}, [careerPaths]);

	const positionsById = useMemo(() => {
		const map = new Map<string, Position>();
		positions.forEach(position => map.set(position.id, position));
		return map;
	}, [positions]);

	// Start editing a position detail
	const handleEdit = (detail: PositionDetail) => {
		setEditingId(detail.id);
		setEditedValues({
			position_id: detail.position_id,
			career_path_id: detail.career_path_id,
			level: detail.level,
			path_specific_description: detail.path_specific_description,
			sequence_in_path: detail.sequence_in_path,
		});
	};

	// Cancel editing
	const handleCancel = () => {
		setEditingId(null);
		setEditedValues({});
		setNewDetail(null);
	};

	// Start creating a new position detail
	const handleAddNew = () => {
		// Default to the first position and path if available
		const firstPositionId = positions.length > 0 ? positions[0].id : '';
		const firstPathId = careerPaths.length > 0 ? careerPaths[0].id : '';

		setNewDetail({
			organization_id: organizationId,
			position_id: firstPositionId,
			career_path_id: firstPathId,
			level: 1,
			path_specific_description: '',
			sequence_in_path: 1,
		});
	};

	// Save changes to an existing position detail
	const handleSave = async (id: string) => {
		try {
			const { error } = await supabase
				.from('position_details')
				.update(editedValues)
				.eq('id', id);

			if (error) throw error;

			setEditingId(null);
			setEditedValues({});
			onRefresh();
		} catch (error) {
			console.error("Error updating position detail:", error);
			alert("Failed to update position detail. See console for details.");
		}
	};

	// Save a new position detail
	const handleSaveNew = async () => {
		if (!newDetail?.position_id || !newDetail?.career_path_id) {
			alert("Position and Career Path are required");
			return;
		}

		try {
			const { error } = await supabase
				.from('position_details')
				.insert(newDetail);

			if (error) throw error;

			setNewDetail(null);
			onRefresh();
		} catch (error) {
			console.error("Error creating position detail:", error);
			alert("Failed to create position detail. See console for details.");
		}
	};

	// View details (this would navigate to a detailed view in a real app)
	const handleViewDetails = (id: string) => {
		alert(`View details for ${id} (to be implemented)`);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-xl">Position Details</CardTitle>
				<CardDescription>
					Specific roles within career paths
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="rounded-md border overflow-x-auto">
					<Table>
						<TableHeader className="bg-muted/50">
							<TableRow>
								<TableHead>Position</TableHead>
								<TableHead>Career Path</TableHead>
								<TableHead>Level</TableHead>
								<TableHead>Sequence</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="w-24">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{positionDetails.map((detail) => (
								<TableRow key={detail.id}>
									<TableCell>
										{editingId === detail.id ? (
											<Select
												value={editedValues.position_id || ''}
												onValueChange={(value) => setEditedValues({ ...editedValues, position_id: value })}
											>
												<SelectTrigger className="w-40">
													<SelectValue placeholder="Select position" />
												</SelectTrigger>
												<SelectContent>
													{positions.map((position) => (
														<SelectItem key={position.id} value={position.id}>
															{position.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : (
											positionsById.get(detail.position_id)?.name || detail.position_id
										)}
									</TableCell>
									<TableCell>
										{editingId === detail.id ? (
											<Select
												value={editedValues.career_path_id || ''}
												onValueChange={(value) => setEditedValues({ ...editedValues, career_path_id: value })}
											>
												<SelectTrigger className="w-40">
													<SelectValue placeholder="Select path" />
												</SelectTrigger>
												<SelectContent>
													{careerPaths.map((path) => (
														<SelectItem key={path.id} value={path.id}>
															{path.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : (
											pathsById.get(detail.career_path_id)?.name || detail.career_path_id
										)}
									</TableCell>
									<TableCell>
										{editingId === detail.id ? (
											<Input
												type="number"
												min={1}
												value={editedValues.level || 1}
												onChange={(e) => setEditedValues({ ...editedValues, level: parseInt(e.target.value, 10) })}
												className="w-16"
											/>
										) : (
											detail.level
										)}
									</TableCell>
									<TableCell>
										{editingId === detail.id ? (
											<Input
												type="number"
												min={1}
												value={editedValues.sequence_in_path || 1}
												onChange={(e) => setEditedValues({ ...editedValues, sequence_in_path: parseInt(e.target.value, 10) })}
												className="w-16"
											/>
										) : (
											detail.sequence_in_path || "-"
										)}
									</TableCell>
									<TableCell>
										{editingId === detail.id ? (
											<Textarea
												value={editedValues.path_specific_description || ''}
												onChange={(e) => setEditedValues({ ...editedValues, path_specific_description: e.target.value })}
												className="w-52 h-20"
											/>
										) : (
											detail.path_specific_description ?
												(detail.path_specific_description.length > 40 ?
													detail.path_specific_description.substring(0, 40) + '...' :
													detail.path_specific_description) :
												"-"
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{editingId === detail.id ? (
												<>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleSave(detail.id)}
													>
														<Save className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={handleCancel}
													>
														<X className="h-4 w-4" />
													</Button>
												</>
											) : (
												<>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleEdit(detail)}
													>
														<Pencil className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleViewDetails(detail.id)}
													>
														<Eye className="h-4 w-4" />
													</Button>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}

							{/* Row for adding a new position detail */}
							{newDetail && (
								<TableRow>
									<TableCell>
										<Select
											value={newDetail.position_id || ''}
											onValueChange={(value) => setNewDetail({ ...newDetail, position_id: value })}
										>
											<SelectTrigger className="w-40">
												<SelectValue placeholder="Select position" />
											</SelectTrigger>
											<SelectContent>
												{positions.map((position) => (
													<SelectItem key={position.id} value={position.id}>
														{position.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell>
										<Select
											value={newDetail.career_path_id || ''}
											onValueChange={(value) => setNewDetail({ ...newDetail, career_path_id: value })}
										>
											<SelectTrigger className="w-40">
												<SelectValue placeholder="Select path" />
											</SelectTrigger>
											<SelectContent>
												{careerPaths.map((path) => (
													<SelectItem key={path.id} value={path.id}>
														{path.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell>
										<Input
											type="number"
											min={1}
											value={newDetail.level || 1}
											onChange={(e) => setNewDetail({ ...newDetail, level: parseInt(e.target.value, 10) })}
											className="w-16"
										/>
									</TableCell>
									<TableCell>
										<Input
											type="number"
											min={1}
											value={newDetail.sequence_in_path || 1}
											onChange={(e) => setNewDetail({ ...newDetail, sequence_in_path: parseInt(e.target.value, 10) })}
											className="w-16"
										/>
									</TableCell>
									<TableCell>
										<Textarea
											value={newDetail.path_specific_description || ''}
											onChange={(e) => setNewDetail({ ...newDetail, path_specific_description: e.target.value })}
											placeholder="Path-specific description"
											className="w-52 h-20"
										/>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={handleSaveNew}
											>
												<Save className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={handleCancel}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between">
				<div className="text-xs text-muted-foreground">
					{positionDetails.length} position details
				</div>
				{!newDetail && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleAddNew}
					>
						<Plus className="mr-2 h-4 w-4" />
						Add Position Detail
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}