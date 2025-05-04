// ~/app/_components/layout/OrganizationSelector.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { useOrganization } from "~/contexts/OrganizationContext";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Building, ChevronDown } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

export function OrganizationSelector() {
	const { organizations, currentOrganization, loading, setCurrentOrganization } = useOrganization();
	const [isOpen, setIsOpen] = useState(false);

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
		);
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
		);
	}

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
				<div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
					{currentOrganization.logo_url ? (
						<Image
							src={currentOrganization.logo_url}
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
					<div className="text-sm font-medium flex items-center gap-1">
						{currentOrganization.name}
						<ChevronDown className="h-3 w-3 text-muted-foreground" />
					</div>
					<span className="text-[10px] text-muted-foreground">Career Compass</span>
				</div>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="w-56">
				{organizations.map((org) => (
					<DropdownMenuItem
						key={org.id}
						className={`cursor-pointer flex items-center gap-2 ${org.id === currentOrganization?.id ? "bg-accent" : ""
							}`}
						onClick={() => {
							setCurrentOrganization(org.id);
							setIsOpen(false);
						}}
					>
						<div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
							{org.logo_url ? (
								<Image
									src={org.logo_url}
									alt={org.name}
									width={24}
									height={24}
									className="object-cover"
								/>
							) : (
								<Building className="h-3 w-3 text-primary" />
							)}
						</div>
						<span className="flex-1 truncate">{org.name}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}