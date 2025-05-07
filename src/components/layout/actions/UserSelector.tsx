// ~/app/_components/layout/UserSelector.tsx

"use client";

import { useState, useEffect } from "react";
import { useUser, type UserRole } from "~/contexts/UserContext";
import { useOrganization } from "~/contexts/OrganizationContext";
import { api } from "~/trpc/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { User, Settings, LogOut } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

// Helper function to get the role badge color
function getRoleBadge(role: UserRole) {
	switch (role) {
		case "admin":
			return <Badge variant="destructive">Admin</Badge>;
		case "manager":
			return <Badge variant="default">Manager</Badge>;
		case "employee":
			return <Badge variant="secondary">Employee</Badge>;
		default:
			return null;
	}
}

// Helper to generate avatar fallback from name
function getInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function UserSelector() {
	const { users, currentUser, loading, setCurrentUser } = useUser();
	const { currentOrganization } = useOrganization();
	const [isOpen, setIsOpen] = useState(false);
	const [orgUsers, setOrgUsers] = useState<typeof users>([]);

	// Query organization members (will be a fallback until we implement the API)
	const orgMembersQuery = api.organization.getMembers.useQuery(
		{ organizationId: currentOrganization?.id || "" },
		{
			enabled: !!currentOrganization?.id,
			// Silently handle if endpoint not implemented yet
			onError: () => console.log("Organization members endpoint not implemented yet")
		}
	);

	// Filter users based on organization
	useEffect(() => {
		if (orgMembersQuery.data && orgMembersQuery.data.length > 0) {
			// If we have organization members data, use it
			const memberUserIds = new Set(orgMembersQuery.data.map(m => m.user_id));
			const filteredUsers = users.filter(user => memberUserIds.has(user.id));
			setOrgUsers(filteredUsers);
		} else if (currentOrganization) {
			// Fallback: Use our existing user_organizations relationship
			// This is a simple fallback if the API isn't implemented yet
			// In a real app with the getMembers endpoint, you would remove this

			// For now, hardcode the mapping until we implement the API
			const orgToUserMap: Record<string, string[]> = {
				// Lehman Brothers
				'9e40b94e-dd8d-4679-98b9-0716cff26810': [
					'0dd0a1a3-c887-43d1-af2c-b7069b4a7940', // Alex Smith
					'20536097-ef9a-4ef4-b586-c0747075909b', // Jamie Wong
					'42000f98-1ea9-4e0a-9272-3b570c6d8e84', // Test Employee
					'bc33a3be-7a6f-4416-8094-c10d602b99cb'  // Test Manager
				],
				// Veenie
				'a73148de-90e1-4f0e-955d-9790c131e13c': [
					'e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2'  // Sam Taylor
				],
				// Gasunie
				'91b825d7-8e4a-42e2-b762-ee230f2e5933': []
			};

			const userIds = orgToUserMap[currentOrganization.id] || [];
			const filteredUsers = users.filter(user => userIds.includes(user.id));

			// If we don't have any users for this org, just show all users
			setOrgUsers(filteredUsers.length > 0 ? filteredUsers : users);
		} else {
			// If no organization is selected, show all users
			setOrgUsers(users);
		}
	}, [currentOrganization, users, orgMembersQuery.data]);

	// Make sure current user is in the filtered list, or select first org user
	useEffect(() => {
		if (orgUsers.length > 0 && currentUser) {
			// If current user isn't in this org, switch to first user in org
			if (!orgUsers.some(user => user.id === currentUser.id)) {
				setCurrentUser(orgUsers[0].id);
			}
		}
	}, [orgUsers, currentUser, setCurrentUser]);

	// Loading state
	if (loading) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-9 w-9 rounded-full" />
			</div>
		);
	}

	// No user state
	if (!currentUser) {
		return (
			<Avatar>
				<AvatarFallback>
					<User className="h-4 w-4" />
				</AvatarFallback>
			</Avatar>
		);
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Avatar className="cursor-pointer h-9 w-9 hover:ring-2 hover:ring-primary/20 transition-all">
					<AvatarImage src={`https://avatars.dicebear.com/api/initials/${currentUser.full_name.replace(/\s+/g, '_')}.svg`} />
					<AvatarFallback>{getInitials(currentUser.full_name)}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-56">
				<div className="flex flex-col p-2 space-y-1">
					<p className="text-sm font-medium">{currentUser.full_name}</p>
					<p className="text-xs text-muted-foreground">{currentUser.email}</p>
					<div className="pt-1">
						{getRoleBadge(currentUser.role)}
					</div>
				</div>

				<DropdownMenuSeparator />

				<div className="max-h-48 overflow-y-auto">
					{orgUsers.map((user) => (
						<DropdownMenuItem
							key={user.id}
							className={`cursor-pointer flex items-center gap-2 ${user.id === currentUser?.id ? "bg-accent" : ""
								}`}
							onClick={() => {
								setCurrentUser(user.id);
								setIsOpen(false);
							}}
						>
							<Avatar className="h-6 w-6">
								<AvatarImage src={`https://avatars.dicebear.com/api/initials/${user.full_name.replace(/\s+/g, '_')}.svg`} />
								<AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<span className="text-xs font-medium">{user.full_name}</span>
								<span className="text-[10px] text-muted-foreground truncate" style={{ maxWidth: "160px" }}>
									{user.email}
								</span>
							</div>
						</DropdownMenuItem>
					))}
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuItem className="cursor-pointer gap-2">
					<Settings className="h-4 w-4" />
					<span>Settings</span>
				</DropdownMenuItem>

				<DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
					<LogOut className="h-4 w-4" />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}