// src/components/layout/actions/PositionSelector.tsx

"use client"

import { useState, useEffect } from "react"
import type { UserRole } from "~/contexts/UserContext"
import { useOrganization } from "~/contexts/OrganizationContext"
import { api } from "~/trpc/react"
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "~/components/ui/sheet"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { toast } from "sonner"
import { PositionSelector } from "./PositionSelector"

interface UserEditorProps {
	currentOrganizationId?: string
}

export function UserEditor({ currentOrganizationId }: UserEditorProps) {
	const { currentOrganization } = useOrganization()
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [userToDelete, setUserToDelete] = useState<string | null>(null)
	const [editSheetOpen, setEditSheetOpen] = useState(false)
	const [createSheetOpen, setCreateSheetOpen] = useState(false)
	const [editingUser, setEditingUser] = useState<any>(null)
	const [newUser, setNewUser] = useState({
		full_name: "",
		email: "",
		level: "Junior" as "Junior" | "Medior" | "Senior" | "Lead",
		years_in_role: 0,
		current_position_details_id: null as string | null,
		role: "employee" as UserRole,
	})

	const orgId = currentOrganization?.id || currentOrganizationId || ""

	// Mutations
	const utils = api.useUtils()

	const updateUserMutation = api.user.update.useMutation({
		onSuccess: () => {
			toast.success("User updated successfully")
			setEditSheetOpen(false)
			utils.user.getAll.invalidate()
			if (editingUser?.id) {
				utils.user.getById.invalidate({ id: editingUser.id })
			}
		},
		onError: (error) => {
			toast.error(`Failed to update user: ${error.message}`)
		},
	})

	const createUserMutation = api.user.create.useMutation({
		onSuccess: () => {
			toast.success("User created successfully")
			setCreateSheetOpen(false)
			utils.user.getAll.invalidate()
		},
		onError: (error) => {
			toast.error(`Failed to create user: ${error.message}`)
			console.error("Create user error:", error)
		},
	})

	const deleteUserMutation = api.user.delete.useMutation({
		onSuccess: () => {
			toast.success("User deleted successfully")
			setDeleteConfirmOpen(false)
			utils.user.getAll.invalidate()
		},
		onError: (error) => {
			toast.error(`Failed to delete user: ${error.message}`)
		},
	})

	// Position details query (for both edit and create)
	const { data: positionDetails } = api.position.getAllDetails.useQuery(
		{ organizationId: orgId },
		{ enabled: !!orgId, staleTime: 5 * 60 * 1000 }
	)

	const handleDelete = (userId: string) => {
		setUserToDelete(userId)
		setDeleteConfirmOpen(true)
	}

	const confirmDelete = () => {
		if (userToDelete) {
			deleteUserMutation.mutate({ id: userToDelete })
		}
	}

	const handleEdit = (user: any) => {
		setEditingUser({
			...user,
			// Ensure level is one of the enum values
			level: ["Junior", "Medior", "Senior", "Lead"].includes(user.level)
				? user.level
				: "Junior"
		})
		setEditSheetOpen(true)
	}

	const handleUpdateUser = () => {
		if (editingUser) {
			updateUserMutation.mutate({
				id: editingUser.id,
				full_name: editingUser.full_name,
				email: editingUser.email,
				level: editingUser.level as "Junior" | "Medior" | "Senior" | "Lead",
				years_in_role: Number(editingUser.years_in_role),
				current_position_details_id: editingUser.current_position_details_id || null,
			})
		}
	}

	const handleCreateUser = () => {
		createUserMutation.mutate({
			full_name: newUser.full_name,
			email: newUser.email,
			level: newUser.level,
			years_in_role: Number(newUser.years_in_role),
			current_position_details_id: newUser.current_position_details_id,
			organization_id: orgId,
			add_to_organization: true,  // Add this flag
			is_primary: true           // Make it the primary org
		})
	}

	const openCreateSheet = () => {
		setNewUser({
			full_name: "",
			email: "",
			level: "Junior",
			years_in_role: 0,
			current_position_details_id: null,
			role: "employee",
		})
		setCreateSheetOpen(true)
	}

	// Handle position selection for editing
	const handlePositionChange = (positionDetailId: string | null) => {
		setEditingUser({
			...editingUser,
			current_position_details_id: positionDetailId
		})
	}

	// Handle position selection for new user
	const handleNewPositionChange = (positionDetailId: string | null) => {
		setNewUser({
			...newUser,
			current_position_details_id: positionDetailId
		})
	}

	return {
		handleEdit,
		handleDelete,
		openCreateSheet,
		components: (
			<>
				{/* Delete confirmation dialog */}
				<AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This will permanently delete the user and all associated data.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Edit User Sheet */}
				<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
					<SheetContent className="sm:max-w-md overflow-y-auto">
						<SheetHeader className="pb-4">
							<SheetTitle>Edit User</SheetTitle>
							<SheetDescription>Make changes to the user profile. Click save when you're done.</SheetDescription>
						</SheetHeader>
						<div className="grid gap-6 py-4">
							<div className="grid gap-3">
								<Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
								<Input
									id="full_name"
									value={editingUser?.full_name || ""}
									onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
									className="h-10"
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="email" className="text-sm font-medium">Email</Label>
								<Input
									id="email"
									type="email"
									value={editingUser?.email || ""}
									onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
									className="h-10"
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="level" className="text-sm font-medium">Level</Label>
								<Input
									id="level"
									value={editingUser?.level || ""}
									onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
									className="h-10"
									placeholder="Junior, Medior, Senior, or Lead"
								/>
								<p className="text-xs text-muted-foreground">Use Junior, Medior, Senior, or Lead</p>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="years_in_role" className="text-sm font-medium">Years in Role</Label>
								<Input
									id="years_in_role"
									type="number"
									value={editingUser?.years_in_role || 0}
									onChange={(e) => setEditingUser({ ...editingUser, years_in_role: e.target.value })}
									className="h-10"
									min="0"
									max="99"
								/>
							</div>

							{/* Position Selector */}
							<div className="grid gap-3">
								<Label className="text-sm font-medium">Current Position</Label>
								<PositionSelector
									organizationId={orgId}
									value={editingUser?.current_position_details_id || null}
									onChange={handlePositionChange}
									positions={positionDetails || []}
								/>
							</div>
						</div>
						<SheetFooter className="pt-4">
							<SheetClose asChild>
								<Button variant="outline">Cancel</Button>
							</SheetClose>
							<Button onClick={handleUpdateUser} disabled={updateUserMutation.isLoading}>
								{updateUserMutation.isLoading ? "Saving..." : "Save changes"}
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>

				{/* Create User Sheet */}
				<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
					<SheetContent className="sm:max-w-md overflow-y-auto">
						<SheetHeader className="pb-4">
							<SheetTitle>Create New User</SheetTitle>
							<SheetDescription>Add a new user to your organization. Click create when you're done.</SheetDescription>
						</SheetHeader>
						<div className="grid gap-6 py-4">
							<div className="grid gap-3">
								<Label htmlFor="new_full_name" className="text-sm font-medium">Full Name</Label>
								<Input
									id="new_full_name"
									value={newUser.full_name}
									onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
									className="h-10"
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="new_email" className="text-sm font-medium">Email</Label>
								<Input
									id="new_email"
									type="email"
									value={newUser.email}
									onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
									className="h-10"
								/>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="new_level" className="text-sm font-medium">Level</Label>
								<Input
									id="new_level"
									value={newUser.level}
									onChange={(e) => setNewUser({ ...newUser, level: e.target.value as any })}
									className="h-10"
									placeholder="Junior, Medior, Senior, or Lead"
								/>
								<p className="text-xs text-muted-foreground">Use Junior, Medior, Senior, or Lead</p>
							</div>
							<div className="grid gap-3">
								<Label htmlFor="new_years_in_role" className="text-sm font-medium">Years in Role</Label>
								<Input
									id="new_years_in_role"
									type="number"
									value={newUser.years_in_role}
									onChange={(e) => setNewUser({ ...newUser, years_in_role: Number(e.target.value) })}
									className="h-10"
									min="0"
									max="99"
								/>
							</div>

							{/* Position Selector */}
							<div className="grid gap-3">
								<Label className="text-sm font-medium">Current Position</Label>
								<PositionSelector
									organizationId={orgId}
									value={newUser.current_position_details_id}
									onChange={handleNewPositionChange}
									positions={positionDetails || []}
								/>
							</div>
						</div>
						<SheetFooter className="pt-4">
							<SheetClose asChild>
								<Button variant="outline">Cancel</Button>
							</SheetClose>
							<Button onClick={handleCreateUser} disabled={createUserMutation.isLoading}>
								{createUserMutation.isLoading ? "Creating..." : "Create user"}
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</>
		),
	}
}