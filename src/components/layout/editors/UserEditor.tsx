"use client"

import { useState } from "react"
import type { UserRole } from "~/contexts/UserContext"
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

interface UserEditorProps {
	currentOrganizationId?: string
}

export function UserEditor({ currentOrganizationId }: UserEditorProps) {
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [userToDelete, setUserToDelete] = useState<string | null>(null)
	const [editSheetOpen, setEditSheetOpen] = useState(false)
	const [createSheetOpen, setCreateSheetOpen] = useState(false)
	const [editingUser, setEditingUser] = useState<any>(null)
	const [newUser, setNewUser] = useState({
		full_name: "",
		email: "",
		level: "junior",
		years_in_role: 0,
		role: "employee" as UserRole,
	})

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
		setEditingUser({ ...user })
		setEditSheetOpen(true)
	}

	const handleUpdateUser = () => {
		if (editingUser) {
			updateUserMutation.mutate({
				id: editingUser.id,
				full_name: editingUser.full_name,
				email: editingUser.email,
				level: editingUser.level,
				years_in_role: Number(editingUser.years_in_role),
				current_position_details_id: editingUser.current_position_details_id,
			})
		}
	}

	const handleCreateUser = () => {
		createUserMutation.mutate({
			...newUser,
			years_in_role: Number(newUser.years_in_role),
			organization_id: currentOrganizationId || "",
		})
	}

	const openCreateSheet = () => {
		setNewUser({
			full_name: "",
			email: "",
			level: "junior",
			years_in_role: 0,
			role: "employee" as UserRole,
		})
		setCreateSheetOpen(true)
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
					<SheetContent className="sm:max-w-md">
						<SheetHeader>
							<SheetTitle>Edit User</SheetTitle>
							<SheetDescription>Make changes to the user profile. Click save when you're done.</SheetDescription>
						</SheetHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="full_name">Full Name</Label>
								<Input
									id="full_name"
									value={editingUser?.full_name || ""}
									onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={editingUser?.email || ""}
									onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="level">Level</Label>
								<Input
									id="level"
									value={editingUser?.level || ""}
									onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="years_in_role">Years in Role</Label>
								<Input
									id="years_in_role"
									type="number"
									value={editingUser?.years_in_role || 0}
									onChange={(e) => setEditingUser({ ...editingUser, years_in_role: e.target.value })}
								/>
							</div>
						</div>
						<SheetFooter>
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
					<SheetContent className="sm:max-w-md">
						<SheetHeader>
							<SheetTitle>Create New User</SheetTitle>
							<SheetDescription>Add a new user to your organization. Click create when you're done.</SheetDescription>
						</SheetHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="new_full_name">Full Name</Label>
								<Input
									id="new_full_name"
									value={newUser.full_name}
									onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new_email">Email</Label>
								<Input
									id="new_email"
									type="email"
									value={newUser.email}
									onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new_level">Level</Label>
								<Input
									id="new_level"
									value={newUser.level}
									onChange={(e) => setNewUser({ ...newUser, level: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new_years_in_role">Years in Role</Label>
								<Input
									id="new_years_in_role"
									type="number"
									value={newUser.years_in_role}
									onChange={(e) => setNewUser({ ...newUser, years_in_role: Number(e.target.value) })}
								/>
							</div>
						</div>
						<SheetFooter>
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
