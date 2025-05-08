// src/components/layout/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	ChevronLeft,
	ChevronRight,
	Compass,
	Map,
	MessageSquare,
	Factory,
	Home,
	Layers,
	Briefcase,
	BarChart2,
	Settings,
	HelpCircle,
	TrendingUp
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface NavItemConfig {
	href: string;
	icon: LucideIcon;
	text: string;
}

interface NavGroupConfig {
	title?: string;
	items: NavItemConfig[];
	showDivider?: boolean;
	collapsible?: boolean;
}

// Navigation configuration
const navigationConfig: NavGroupConfig[] = [
	{
		// User perspective navigation
		items: [
			{ href: "/", icon: Home, text: "Dashboard" },
			{ href: "/destinations", icon: Compass, text: "Destinations" },
			{ href: "/route", icon: Map, text: "Route Plan" },
			{ href: "/comparison", icon: BarChart2, text: "Comparison" },
			{ href: "/growth", icon: TrendingUp, text: "Growth" },
			{ href: "/conversation", icon: MessageSquare, text: "Conversation" },
		]
	},
	{
		// HR planning & management
		title: "admin",
		items: [
			{ href: "/hr", icon: BarChart2, text: "HR Admin" },
			{ href: "/job-family", icon: Layers, text: "Job Families" },
			{ href: "/competences", icon: Briefcase, text: "Competences" },
			{ href: "/company", icon: Factory, text: "Company" },
		],
		collapsible: true
	},
	{
		// Footer navigation
		items: [
			{ href: "/settings", icon: Settings, text: "Settings" },
		]
	}
];

interface SidebarProps {
	isCollapsed?: boolean;
	onToggleCollapse?: (collapsed: boolean) => void;
	className?: string;
}

export function Sidebar({ isCollapsed: propIsCollapsed, onToggleCollapse, className }: SidebarProps) {
	const pathname = usePathname();
	const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
	// Start with admin menu closed by default
	const [managerMenuOpen, setManagerMenuOpen] = useState(false);

	// Use either the prop or internal state
	const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalIsCollapsed;

	// Toggle collapse state
	const toggleCollapse = () => {
		const newState = !isCollapsed;
		if (onToggleCollapse) {
			onToggleCollapse(newState);
		} else {
			setInternalIsCollapsed(newState);
		}
	};

	// Calculate the width for the container
	const width = isCollapsed ? "w-[60px]" : "w-[240px]";

	return (
		<div className={cn("h-full relative", width, className)}>
			<div className={cn(
				"flex flex-col h-full py-6 transition-all duration-300 overflow-hidden bg-background",
				isCollapsed ? "items-center px-2" : "px-4"
			)}>
				{/* Top margin space */}
				<div className="mb-6"></div>

				<TooltipProvider delayDuration={0}>
					<div className="flex flex-col h-full">
						{navigationConfig.map((group, groupIndex) => (
							<div key={groupIndex} className={cn(
								groupIndex === navigationConfig.length - 1 ? "mt-auto mb-12" : "",
								"mb-6"
							)}>
								{group.title && !isCollapsed && (
									<>
										{group.collapsible ? (
											<Collapsible
												open={managerMenuOpen}
												onOpenChange={setManagerMenuOpen}
												className="w-full"
											>
												<CollapsibleTrigger className="flex items-center w-full py-2 px-2 text-xs font-normal text-muted-foreground/70 hover:text-muted-foreground hover:bg-muted/60 rounded-lg uppercase tracking-wider">
													<span>{group.title}</span>
													<ChevronRight className={cn(
														"ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
														managerMenuOpen && "rotate-90"
													)} />
												</CollapsibleTrigger>
												<CollapsibleContent className="space-y-1 pt-1 transition-all">
													{group.items.map((item) => (
														<NavItem
															key={item.href}
															href={item.href}
															icon={<item.icon className="h-5 w-5" />}
															text={item.text}
															isCollapsed={isCollapsed}
															isActive={pathname === item.href}
														/>
													))}
												</CollapsibleContent>
											</Collapsible>
										) : (
											<div className="py-2 px-2 text-xs font-normal text-muted-foreground/70 uppercase tracking-wider">
												{group.title}
											</div>
										)}
									</>
								)}

								{(!group.collapsible || isCollapsed) && (
									<nav className="space-y-1">
										{group.items.map((item) => (
											<NavItem
												key={item.href}
												href={item.href}
												icon={<item.icon className="h-5 w-5" />}
												text={item.text}
												isCollapsed={isCollapsed}
												isActive={pathname === item.href}
											/>
										))}
									</nav>
								)}
							</div>
						))}
					</div>
				</TooltipProvider>
			</div>

			{/* Collapse toggle button - positioned half outside the sidebar */}
			<div className="absolute top-1/2 right-0 -mt-4 translate-x-1/2 z-10">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 rounded-full bg-background hover:bg-background/90 text-muted-foreground/50 hover:text-muted-foreground transition-all shadow-sm"
					onClick={toggleCollapse}
				>
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
				</Button>
			</div>
		</div>
	);
}

function NavItem({
	href,
	icon,
	text,
	isCollapsed,
	isActive
}: {
	href: string;
	icon: React.ReactNode;
	text: string;
	isCollapsed: boolean;
	isActive: boolean;
}) {
	if (isCollapsed) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<Link
						href={href}
						className={cn(
							"flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
							isActive
								? "bg-primary/15 text-primary"
								: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
						)}
					>
						{icon}
					</Link>
				</TooltipTrigger>
				<TooltipContent side="right">
					{text}
				</TooltipContent>
			</Tooltip>
		);
	}

	return (
		<Link
			href={href}
			className={cn(
				"flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
				isActive
					? "bg-primary/15 text-primary"
					: "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
			)}
		>
			{icon}
			<span>{text}</span>
		</Link>
	);
}