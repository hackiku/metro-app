// src/components/layout/actions/UserSelector.tsx (updated version)
"use client"

import { useState, useEffect, useRef } from "react"
import { useUser, type UserRole } from "~/contexts/UserContext"
import { useOrganization } from "~/contexts/OrganizationContext"
import { api } from "~/trpc/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { User, Plus, Check, Pencil, Trash2, Building, Users } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"
import { Separator } from "~/components/ui/separator"
import { UserEditor } from "~/components/layout/editors/UserEditor"
import { UserOrganizationManager } from "./UserOrganizationManager"

// Helper function to get the role badge color
function getRoleBadge(role: UserRole) {
	switch (role) {
		case "admin":
			return <Badge variant="destructive">Admin</Badge>
		case "manager":
			return <Badge variant="default">Manager</Badge>
		case "employee":
			return <Badge variant="secondary">Employee</Badge>
		default:
			return null
	}
}

// Helper to generate avatar fallback from name
function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2)
}

export function UserSelector() {
	const { users, currentUser, loading, setCurrentUser } = useUser()
	const { currentOrganization } = useOrganization()
	const [orgUsers, setOrgUsers] = useState<typeof users>([])
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Make sure we have the current organization ID
	const organizationId = currentOrganization?.id || ""

	// Get the UserEditor functions and components
	const userEditor = UserEditor({ currentOrganizationId: organizationId })

	// Query organization members with the current organization context
	const orgMembersQuery = api.organization.getMembers.useQuery(
		{ organizationId },
		{
			enabled: !!organizationId,
			// Don't show error if endpoint not implemented yet
			onError: () => console.log("Organization members endpoint not implemented yet"),
		},
	)

	// Filter users based on organization
	useEffect(() => {
		if (!organizationId) {
			setOrgUsers([]);
			return;
		}

		if (orgMembersQuery.data && orgMembersQuery.data.length > 0) {
			// If we have organization members data, use it to filter users
			const memberUserIds = new Set(orgMembersQuery.data.map((m) => m.user_id))
			const filteredUsers = users.filter((user) => memberUserIds.has(user.id))
			setOrgUsers(filteredUsers)
		} else {
			// If no organization members data but we have an organization, show empty state
			setOrgUsers([])
		}
	}, [organizationId, users, orgMembersQuery.data])

	// When organization changes, check if current user is in new org
	useEffect(() => {
		if (orgUsers.length > 0) {
			if (currentUser && !orgUsers.some(user => user.id === currentUser.id)) {
				// Current user not in this org, switch to first available user
				setCurrentUser(orgUsers[0].id)
			} else if (!currentUser && orgUsers.length > 0) {
				// No current user selected but we have users, select first one
				setCurrentUser(orgUsers[0].id)
			}
		} else if (currentUser && organizationId) {
			// No users in org but we have a current user selected, clear it
			setCurrentUser(null)
		}
	}, [orgUsers, currentUser, setCurrentUser, organizationId])

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	// Handle creating new user
	const handleCreateUser = () => {
		setIsOpen(false)
		userEditor.openCreateSheet()
	}

	// Handle editing a user
	const handleEditUser = (user: any) => {
		setIsOpen(false)
		userEditor.handleEdit(user)
	}

	// Handle deleting a user
	const handleDeleteUser = (userId: string) => {
		setIsOpen(false)
		userEditor.handleDelete(userId)
	}

	// Toggle dropdown
	const toggleDropdown = () => {
		setIsOpen(!isOpen)
	}

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-9 w-9 rounded-full" />
			</div>
		)
	}

	// No user state - either no users in org or no org selected
	if (!currentUser) {
		return (
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={toggleDropdown}
					className="flex items-center justify-center cursor-pointer"
					type="button"
					aria-haspopup="true"
					aria-expanded={isOpen}
				>
					<Avatar className="h-9 w-9 hover:ring-2 hover:ring-primary/20 transition-all">
						<AvatarFallback>
							<User className="h-4 w-4" />
						</AvatarFallback>
					</Avatar>
				</button>

				{isOpen && (
					<div className="absolute right-0 top-full mt-2 z-50 bg-popover text-popover-foreground shadow-lg rounded-md overflow-hidden w-80">
						<div className="p-4 text-center">
							<p className="text-sm text-muted-foreground">
								{currentOrganization
									? `No users available in ${currentOrganization.name}`
									: 'No organization selected'}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{currentOrganization
									? 'Create your first user to get started'
									: 'Please select an organization first'}
							</p>
						</div>

						<Separator />

						<div className="p-3">
							{currentOrganization && (
								<button
									className="w-full flex items-center gap-2 rounded-md p-3 text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
									onClick={handleCreateUser}
									type="button"
								>
									<div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center">
										<Plus className="h-4 w-4 text-primary" />
									</div>
									<span>Create new user</span>
								</button>
							)}
						</div>
					</div>
				)}

				{/* Render the editor components */}
				{userEditor.components}
			</div>
		)
	}

	return (
		<>
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={toggleDropdown}
					className="flex items-center justify-center cursor-pointer"
					type="button"
					aria-haspopup="true"
					aria-expanded={isOpen}
				>
					<Avatar className="h-9 w-9 hover:ring-2 hover:ring-primary/20 transition-all">
						<AvatarImage
							src={`https://avatars.dicebear.com/api/initials/${currentUser.full_name.replace(/\s+/g, "_")}.svg`}
						/>
						<AvatarFallback>{getInitials(currentUser.full_name)}</AvatarFallback>
					</Avatar>
				</button>

				{isOpen && (
					<div className="absolute right-0 top-full mt-2 z-50 bg-popover text-popover-foreground shadow-lg rounded-md overflow-hidden w-80">
						<div className="flex flex-col p-4 space-y-1">
							<p className="text-base font-medium">{currentUser.full_name}</p>
							<p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
							<div className="pt-1 flex items-center gap-2">
								{getRoleBadge(currentUser.role)}
								<span className="text-xs text-muted-foreground">{currentUser.level}</span>
								{currentUser.years_in_role > 0 && (
									<span className="text-xs text-muted-foreground">• {currentUser.years_in_role} years</span>
								)}
							</div>
						</div>

						<Separator />

						<div className="max-h-80 overflow-y-auto p-3">
							<ul className="grid gap-2">
								{orgUsers.map((user) => (
									<li key={user.id} className="relative">
										<div
											className={cn(
												"block select-none rounded-md p-3 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
												user.id === currentUser?.id ? "bg-accent/50" : "",
											)}
										>
											<div className="flex items-center gap-3">
												<Avatar className="h-10 w-10">
													<AvatarImage
														src={`https://avatars.dicebear.com/api/initials/${user.full_name.replace(/\s+/g, "_")}.svg`}
													/>
													<AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
												</Avatar>
												<div className="flex flex-col">
													<span className="text-sm font-medium">{user.full_name}</span>
													<div className="flex items-center gap-2">
														<span
															className="text-xs text-muted-foreground truncate"
															style={{ maxWidth: "120px" }}
														>
															{user.email}
														</span>
														<span className="text-xs text-muted-foreground">•</span>
														<span className="text-xs text-muted-foreground">{user.level}</span>
													</div>
												</div>
											</div>

											{/* Secondary actions that appear on hover */}
											<div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
												<button
													className="p-1.5 rounded-sm bg-primary/10 hover:bg-primary/20 text-primary"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setCurrentUser(user.id);
														setIsOpen(false);
													}}
													title="Set as current"
													type="button"
												>
													<Check className="h-4 w-4" />
												</button>
												<button
													className="p-1.5 rounded-sm bg-primary/10 hover:bg-primary/20 text-primary"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleEditUser(user);
													}}
													title="Edit"
													type="button"
												>
													<Pencil className="h-4 w-4" />
												</button>
												<button
													className="p-1.5 rounded-sm bg-destructive/10 hover:bg-destructive/20 text-destructive"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														handleDeleteUser(user.id);
													}}
													title="Delete"
													type="button"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</div>
									</li>
								))}

								{/* Create new user option */}
								<li>
									<button
										className="w-full flex items-center gap-2 rounded-md p-3 text-sm font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
										onClick={handleCreateUser}
										type="button"
									>
										<div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center">
											<Plus className="h-4 w-4 text-primary" />
										</div>
										<span>Create new user</span>
									</button>
								</li>

								{/* Manage Organizations */}
								<li>
									<UserOrganizationManager
										userId={currentUser.id}
										trigger={
											<button
												className="w-full flex items-center gap-2 rounded-md p-3 text-sm font-medium border border-border hover:bg-accent transition-colors"
												type="button"
											>
												<div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center">
													<Building className="h-4 w-4 text-muted-foreground" />
												</div>
												<span>Manage Organizations</span>
											</button>
										}
									/>
								</li>
							</ul>
						</div>
					</div>
				)}
			</div>

			{/* Render the editor components outside the dropdown */}
			{userEditor.components}
		</>
	)
}