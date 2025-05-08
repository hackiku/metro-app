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
	TrendingUp,
	Play,
	Pause
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { UserSelector } from "./actions/UserSelector";
import { PlayButton } from "./actions/PlayButton";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

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
		title: "Management",
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
}

export function Sidebar({ isCollapsed: propIsCollapsed, onToggleCollapse }: SidebarProps) {
	const pathname = usePathname();
	const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
	const [managerMenuOpen, setManagerMenuOpen] = useState(true);

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

	return (
		<div className="flex flex-col h-full bg-background relative overflow-hidden">
			<div className={cn(
				"flex flex-col h-full py-6 transition-all duration-300 overflow-hidden",
				isCollapsed ? "items-center px-2 w-[60px]" : "px-4 w-full"
			)}>
				{/* Top section with PlayButton */}
				<div className={cn(
					"flex items-center mb-6",
					isCollapsed ? "justify-center" : "px-2"
				)}>
					{isCollapsed ? (
						<PlayButton variant="mini" />
					) : (
						<PlayButton />
					)}
				</div>

				<TooltipProvider delayDuration={0}>
					<div className="flex flex-col h-full">
						{navigationConfig.map((group, groupIndex) => (
							<div key={groupIndex} className={cn(
								groupIndex === navigationConfig.length - 1 ? "mt-auto" : "",
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
												<CollapsibleTrigger className="flex items-center w-full py-2 px-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg">
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
											<div className="py-2 px-2 text-sm font-medium text-muted-foreground">
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

						{/* User profile at bottom */}
						<div className={cn(
							"pt-4",
							isCollapsed ? "flex justify-center" : ""
						)}>
							<UserSelector />
						</div>
					</div>
				</TooltipProvider>
			</div>

			{/* Collapse toggle button - more subtle design */}
			<Button
				variant="ghost"
				size="icon"
				className="absolute bottom-4 right-3 h-8 w-8 rounded-full bg-background text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted/40"
				onClick={toggleCollapse}
			>
				{isCollapsed ? (
					<ChevronRight className="h-4 w-4" />
				) : (
					<ChevronLeft className="h-4 w-4" />
				)}
			</Button>
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