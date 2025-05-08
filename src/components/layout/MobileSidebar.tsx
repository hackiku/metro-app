// src/components/layout/MobileSidebar.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PlayButton } from "./actions/PlayButton";
import { navigationConfig } from "./Sidebar";
import { cn } from "~/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function MobileSidebar() {
	const pathname = usePathname();

	// Flatten all navigation items from all groups into one array for the dropdown
	const allNavItems = navigationConfig.flatMap(group => group.items);

	// Find the current page
	const currentPage = allNavItems.find(item => item.href === pathname) || allNavItems[0];

	// Create the icon component
	const CurrentIcon = currentPage.icon;

	return (
		<div className="h-12 md:hidden flex items-center justify-between px-4 border-t border-border/30">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="h-10 pl-2 pr-3 gap-2 text-sm font-medium flex items-center hover:bg-muted/30"
					>
						<CurrentIcon className="h-4 w-4" />
						<span>{currentPage.text}</span>
						<ChevronDown className="h-4 w-4 ml-1 opacity-70" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-56">
					{navigationConfig.map((group, groupIndex) => (
						<div key={groupIndex} className="px-1">
							{group.title && (
								<div className="text-xs font-normal uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5 mt-1">
									{group.title}
								</div>
							)}
							{group.items.map((item) => {
								const ItemIcon = item.icon;
								const isActive = pathname === item.href;
								return (
									<DropdownMenuItem
										key={item.href}
										asChild
										className={cn(
											"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer",
											isActive && "bg-primary/15 text-primary"
										)}
									>
										<Link href={item.href}>
											<ItemIcon className="h-4 w-4" />
											<span>{item.text}</span>
										</Link>
									</DropdownMenuItem>
								);
							})}
							{groupIndex < navigationConfig.length - 1 && (
								<div className="h-px bg-border/50 my-1 mx-1" />
							)}
						</div>
					))}
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Play button on the right */}
			<PlayButton variant="mini" />
		</div>
	);
}