"use client"

import { useState, useEffect } from "react"
import { useUser, type UserRole } from "~/contexts/UserContext"
import { useOrganization } from "~/contexts/OrganizationContext"
import { api } from "~/trpc/react"
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "~/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { User, Settings, LogOut, Check, Pencil, Trash2, Plus } from "lucide-react"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"
import { Separator } from "~/components/ui/separator"
import { UserEditor } from "~/components/layout/editors/UserEditor"

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

	// Create a reference to the UserEditor
	const userEditor = UserEditor({ currentOrganizationId: currentOrganization?.id })

	// Query organization members
	const orgMembersQuery = api.organization.getMembers.useQuery(
		{ organizationId: currentOrganization?.id || "" },
		{
			enabled: !!currentOrganization?.id,
			// Silently handle if endpoint not implemented yet
			onError: () => console.log("Organization members endpoint not implemented yet"),
		},
	)

	// Filter users based on organization
	useEffect(() => {
		if (orgMembersQuery.data && orgMembersQuery.data.length > 0) {
			// If we have organization members data, use it
			const memberUserIds = new Set(orgMembersQuery.data.map((m) => m.user_id))
			const filteredUsers = users.filter((user) => memberUserIds.has(user.id))
			setOrgUsers(filteredUsers)
		} else if (currentOrganization) {
			// If no organization members data, just show all users
			setOrgUsers(users)
		} else {
			// If no organization is selected, show all users
			setOrgUsers(users)
		}
	}, [currentOrganization, users, orgMembersQuery.data])

	// Make sure current user is in the filtered list, or select first org user
	useEffect(() => {
		if (orgUsers.length > 0 && currentUser) {
			// If current user isn't in this org, switch to first user in org
			if (!orgUsers.some((user) => user.id === currentUser.id)) {
				setCurrentUser(orgUsers[0].id)
			}
		}
	}, [orgUsers, currentUser, setCurrentUser])

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-9 w-9 rounded-full" />
			</div>
		)
	}

	// No user state - still make it openable
	if (!currentUser) {
		return (
			<NavigationMenu className="">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger className="h-auto p-0 bg-transparent">
							<Avatar className="h-9 w-9 hover:ring-2 hover:ring-primary/20 transition-all">
								<AvatarFallback>
									<User className="h-4 w-4" />
								</AvatarFallback>
							</Avatar>
						</NavigationMenuTrigger>
						<NavigationMenuContent className="w-[280px] right0">
							<div className="p-3 text-center">
								<p className="text-sm text-muted-foreground">No users available</p>
							</div>

							<Separator />

							<div className="p-2">
								<ul className="grid gap-1">
									{/* Create new user option */}
									<li>
										<NavigationMenuLink asChild>
											<button
												className="w-full flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
												onClick={() => userEditor.openCreateSheet()}
											>
												<div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
													<Plus className="h-3.5 w-3.5 text-primary" />
												</div>
												<span>Create new user</span>
											</button>
										</NavigationMenuLink>
									</li>
								</ul>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		)
	}

	return (
		<>
			<NavigationMenu>
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger className="h-auto p-0 bg-transparent">
							<Avatar className="h-9 w-9 hover:ring-2 hover:ring-primary/20 transition-all">
								<AvatarImage
									src={`https://avatars.dicebear.com/api/initials/${currentUser.full_name.replace(/\s+/g, "_")}.svg`}
								/>
								<AvatarFallback>{getInitials(currentUser.full_name)}</AvatarFallback>
							</Avatar>
						</NavigationMenuTrigger>
						<NavigationMenuContent className="w-[280px] right-0 left-auto">
							<div className="flex flex-col p-3 space-y-1">
								<p className="text-sm font-medium">{currentUser.full_name}</p>
								<p className="text-xs text-muted-foreground">{currentUser.email}</p>
								<div className="pt-1">{getRoleBadge(currentUser.role)}</div>
							</div>

							<Separator />

							<div className="max-h-48 overflow-y-auto p-2">
								<ul className="grid gap-1">
									{orgUsers.map((user) => (
										<li key={user.id} className="relative">
											<NavigationMenuLink asChild>
												<div
													className={cn(
														"block select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
														user.id === currentUser?.id ? "bg-accent/50" : "",
													)}
												>
													<div className="flex items-center gap-2">
														<Avatar className="h-6 w-6">
															<AvatarImage
																src={`https://avatars.dicebear.com/api/initials/${user.full_name.replace(/\s+/g, "_")}.svg`}
															/>
															<AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
														</Avatar>
														<div className="flex flex-col">
															<span className="text-xs font-medium">{user.full_name}</span>
															<span
																className="text-[10px] text-muted-foreground truncate"
																style={{ maxWidth: "160px" }}
															>
																{user.email}
															</span>
														</div>
													</div>

													{/* Secondary actions that appear on hover */}
													<div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
														<button
															className="p-1 rounded-sm hover:bg-primary/10"
															onClick={(e) => {
																e.preventDefault()
																e.stopPropagation()
																setCurrentUser(user.id)
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
																userEditor.handleEdit(user)
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
																userEditor.handleDelete(user.id)
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

									{/* Create new user option */}
									<li>
										<NavigationMenuLink asChild>
											<button
												className="w-full flex items-center gap-2 rounded-md p-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
												onClick={() => userEditor.openCreateSheet()}
											>
												<div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
													<Plus className="h-3.5 w-3.5 text-primary" />
												</div>
												<span>Create new user</span>
											</button>
										</NavigationMenuLink>
									</li>
								</ul>
							</div>

							<Separator />

							<div className="p-2">
								<ul className="grid gap-1">
									<li>
										<NavigationMenuLink asChild>
											<button className="w-full flex items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground">
												<Settings className="h-4 w-4" />
												<span>Settings</span>
											</button>
										</NavigationMenuLink>
									</li>
									<li>
										<NavigationMenuLink asChild>
											<button className="w-full flex items-center gap-2 rounded-md p-2 text-sm text-destructive hover:bg-destructive/10">
												<LogOut className="h-4 w-4" />
												<span>Log out</span>
											</button>
										</NavigationMenuLink>
									</li>
								</ul>
							</div>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>

			{/* Render the editor components */}
			{userEditor.components}
		</>
	)
}
