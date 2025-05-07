// src/components/layout/editors/OrganizationEditor.tsx

"use client"

import { useState } from "react"
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

export function OrganizationEditor() {
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [orgToDelete, setOrgToDelete] = useState<string | null>(null)
	const [editSheetOpen, setEditSheetOpen] = useState(false)
	const [createSheetOpen, setCreateSheetOpen] = useState(false)
	const [editingOrg, setEditingOrg] = useState<any>(null)
	const [newOrg, setNewOrg] = useState({
		name: "",
		description: "",
		logo_url: "",
		primary_color: "#4f46e5",
		secondary_color: "#a5b4fc",
	})

	// Mutations
	const utils = api.useUtils()

	// Invalidate all relevant data when organization changes
	const invalidateAfterOrgChange = () => {
		// Invalidate organization data
		utils.organization.getAll.invalidate()

		// Invalidate user data since org changes affect user context
		utils.user.getAll.invalidate()

		// Other related data that might depend on organization
		utils.organization.getMembers.invalidate()
	}

	const updateOrgMutation = api.organization.update.useMutation({
		onSuccess: (data) => {
			toast.success("Organization updated successfully")
			setEditSheetOpen(false)

			// Invalidate specific organization data
			if (editingOrg?.id) {
				utils.organization.getById.invalidate({ id: editingOrg.id })
			}

			// Invalidate all related data
			invalidateAfterOrgChange()
		},
		onError: (error) => {
			toast.error(`Failed to update organization: ${error.message}`)
		},
	})

	const createOrgMutation = api.organization.create.useMutation({
		onSuccess: (data) => {
			toast.success("Organization created successfully")
			setCreateSheetOpen(false)

			// Invalidate all related data
			invalidateAfterOrgChange()
		},
		onError: (error) => {
			toast.error(`Failed to create organization: ${error.message}`)
		},
	})

	const deleteOrgMutation = api.organization.delete.useMutation({
		onSuccess: () => {
			toast.success("Organization deleted successfully")
			setDeleteConfirmOpen(false)

			// Invalidate all related data
			invalidateAfterOrgChange()
		},
		onError: (error) => {
			toast.error(`Failed to delete organization: ${error.message}`)
		},
	})

	const handleDelete = (orgId: string) => {
		setOrgToDelete(orgId)
		setDeleteConfirmOpen(true)
	}

	const confirmDelete = () => {
		if (orgToDelete) {
			deleteOrgMutation.mutate({ id: orgToDelete })
		}
	}

	const handleEdit = (org: any) => {
		setEditingOrg({ ...org })
		setEditSheetOpen(true)
	}

	const handleUpdateOrg = () => {
		if (editingOrg) {
			updateOrgMutation.mutate({
				id: editingOrg.id,
				name: editingOrg.name,
				description: editingOrg.description || null,
				logo_url: editingOrg.logo_url || null,
				primary_color: editingOrg.primary_color || null,
				secondary_color: editingOrg.secondary_color || null,
			})
		}
	}

	const handleCreateOrg = () => {
		createOrgMutation.mutate({
			name: newOrg.name,
			description: newOrg.description || null,
			logo_url: newOrg.logo_url || null,
			primary_color: newOrg.primary_color || null,
			secondary_color: newOrg.secondary_color || null,
		})
	}

	const openCreateSheet = () => {
		setNewOrg({
			name: "",
			description: "",
			logo_url: "",
			primary_color: "#4f46e5",
			secondary_color: "#a5b4fc",
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
								This action cannot be undone. This will permanently delete the organization and all associated data.
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

				{/* Edit Organization Sheet */}
				<Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
					<SheetContent className="sm:max-w-md">
						<SheetHeader>
							<SheetTitle>Edit Organization</SheetTitle>
							<SheetDescription>Make changes to the organization. Click save when you're done.</SheetDescription>
						</SheetHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									value={editingOrg?.name || ""}
									onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									value={editingOrg?.description || ""}
									onChange={(e) => setEditingOrg({ ...editingOrg, description: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="logo_url">Logo URL</Label>
								<Input
									id="logo_url"
									value={editingOrg?.logo_url || ""}
									onChange={(e) => setEditingOrg({ ...editingOrg, logo_url: e.target.value })}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="primary_color">Primary Color</Label>
									<div className="flex gap-2">
										<div
											className="h-9 w-9 rounded-md border"
											style={{ backgroundColor: editingOrg?.primary_color || "#4f46e5" }}
										/>
										<Input
											id="primary_color"
											value={editingOrg?.primary_color || ""}
											onChange={(e) => setEditingOrg({ ...editingOrg, primary_color: e.target.value })}
										/>
									</div>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="secondary_color">Secondary Color</Label>
									<div className="flex gap-2">
										<div
											className="h-9 w-9 rounded-md border"
											style={{ backgroundColor: editingOrg?.secondary_color || "#a5b4fc" }}
										/>
										<Input
											id="secondary_color"
											value={editingOrg?.secondary_color || ""}
											onChange={(e) => setEditingOrg({ ...editingOrg, secondary_color: e.target.value })}
										/>
									</div>
								</div>
							</div>
						</div>
						<SheetFooter>
							<SheetClose asChild>
								<Button variant="outline">Cancel</Button>
							</SheetClose>
							<Button onClick={handleUpdateOrg} disabled={updateOrgMutation.isLoading}>
								{updateOrgMutation.isLoading ? "Saving..." : "Save changes"}
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>

				{/* Create Organization Sheet */}
				<Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
					<SheetContent className="sm:max-w-md">
						<SheetHeader>
							<SheetTitle>Create New Organization</SheetTitle>
							<SheetDescription>Add a new organization. Click create when you're done.</SheetDescription>
						</SheetHeader>
						<div className="grid gap-4 py-4">
							<div className="grid gap-2">
								<Label htmlFor="new_name">Name</Label>
								<Input
									id="new_name"
									value={newOrg.name}
									onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new_description">Description</Label>
								<Input
									id="new_description"
									value={newOrg.description}
									onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new_logo_url">Logo URL</Label>
								<Input
									id="new_logo_url"
									value={newOrg.logo_url}
									onChange={(e) => setNewOrg({ ...newOrg, logo_url: e.target.value })}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="grid gap-2">
									<Label htmlFor="new_primary_color">Primary Color</Label>
									<div className="flex gap-2">
										<div className="h-9 w-9 rounded-md border" style={{ backgroundColor: newOrg.primary_color }} />
										<Input
											id="new_primary_color"
											value={newOrg.primary_color}
											onChange={(e) => setNewOrg({ ...newOrg, primary_color: e.target.value })}
										/>
									</div>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="new_secondary_color">Secondary Color</Label>
									<div className="flex gap-2">
										<div className="h-9 w-9 rounded-md border" style={{ backgroundColor: newOrg.secondary_color }} />
										<Input
											id="new_secondary_color"
											value={newOrg.secondary_color}
											onChange={(e) => setNewOrg({ ...newOrg, secondary_color: e.target.value })}
										/>
									</div>
								</div>
							</div>
						</div>
						<SheetFooter>
							<SheetClose asChild>
								<Button variant="outline">Cancel</Button>
							</SheetClose>
							<Button onClick={handleCreateOrg} disabled={createOrgMutation.isLoading}>
								{createOrgMutation.isLoading ? "Creating..." : "Create organization"}
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</>
		),
	}
}