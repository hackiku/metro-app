// ~/app/_components/layout/OrganizationSelector.tsx

"use client"

import { useState } from "react"
import Image from "next/image"
import { useOrganization } from "~/contexts/OrganizationContext"
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "~/components/ui/navigation-menu"
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
import { Building, Plus, Check, Pencil, Trash2 } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"

export function OrganizationSelector() {
	const { organizations, currentOrganization, loading, setCurrentOrganization } = useOrganization()
	const [isOpen, setIsOpen] = useState(false)
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
	const [orgToDelete, setOrgToDelete] = useState<string | null>(null)

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-8 w-8 rounded-full" />
				<div className="flex flex-col gap-1">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-3 w-16" />
				</div>
			</div>
		)
	}

	// No organizations state
	if (!currentOrganization) {
		return (
			<div className="flex items-center gap-2">
				<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
					<Building className="h-4 w-4 text-muted-foreground" />
				</div>
				<div className="flex flex-col">
					<span className="text-sm text-muted-foreground">No organizations</span>
				</div>
			</div>
		)
	}

	const handleDelete = (orgId: string) => {
		setOrgToDelete(orgId)
		setDeleteConfirmOpen(true)
	}

	const confirmDelete = () => {
		// Implement actual delete logic here
		console.log(`Deleting organization: ${orgToDelete}`)
		setDeleteConfirmOpen(false)
		setOrgToDelete(null)
	}

	return (
		<>
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger className="h-auto py-2 px-3 gap-2">
							<div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
								{currentOrganization.logo_url ? (
									<Image
										src={currentOrganization.logo_url || "/placeholder.svg"}
										alt={currentOrganization.name}
										width={32}
										height={32}
										className="object-cover"
									/>
								) : (
									<Building className="h-4 w-4 text-primary" />
								)}
							</div>

							<div className="flex flex-col items-start">
								<div className="text-sm font-medium flex items-center gap-1">{currentOrganization.name}</div>
								<span className="text-[10px] text-muted-foreground">Career Compass</span>
							</div>
						</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-[280px] gap-1 p-2">
								{organizations.map((org) => (
									<li key={org.id} className="relative">
										<NavigationMenuLink asChild>
											<div
												className={cn(
													"block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
													org.id === currentOrganization?.id ? "bg-accent/50" : "",
												)}
											>
												<div className="flex items-center gap-2">
													<div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
														{org.logo_url ? (
															<Image
																src={org.logo_url || "/placeholder.svg"}
																alt={org.name}
																width={24}
																height={24}
																className="object-cover"
															/>
														) : (
															<Building className="h-3 w-3 text-primary" />
														)}
													</div>
													<span className="flex-1 truncate text-sm">{org.name}</span>
												</div>

												{/* Secondary actions that appear on hover */}
												<div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
													<button
														className="p-1 rounded-sm hover:bg-primary/10"
														onClick={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setCurrentOrganization(org.id)
														}}
														title="Set as current"
													>
														<Check className="h-3.5 w-3.5" />
													</button>
													<button
														className="p-1 rounded-sm hover:bg-primary/10"
														onClick={(e) => {
															e.preventDefault()
															e.stopPropagation()
															console.log(`Edit organization: ${org.id}`)
														}}
														title="Edit"
													>
														<Pencil className="h-3.5 w-3.5" />
													</button>
													<button
														className="p-1 rounded-sm hover:bg-destructive/10 text-destructive"
														onClick={(e) => {
															e.preventDefault()
															e.stopPropagation()
															handleDelete(org.id)
														}}
														title="Delete"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</div>
											</div>
										</NavigationMenuLink>
									</li>
								))}

								{/* Create new organization option */}
								<li>
									<NavigationMenuLink asChild>
										<button
											className="w-full flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
											onClick={() => console.log("Create new organization")}
										>
											<div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
												<Plus className="h-3.5 w-3.5 text-primary" />
											</div>
											<span>Create new organization</span>
										</button>
									</NavigationMenuLink>
								</li>
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>

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
		</>
	)
}
