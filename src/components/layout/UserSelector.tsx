// ~/app/_components/layout/UserSelector.tsx

"use client";

import { useState } from "react";
import { useUser, type UserRole } from "~/contexts/UserContext";
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
	const [isOpen, setIsOpen] = useState(false);

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
					{users.map((user) => (
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