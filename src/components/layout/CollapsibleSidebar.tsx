// ~/app/_components/layout/CollapsibleSidebar.tsx

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
	FolderTree
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
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
		],
		showDivider: true
	},
	{
		// HR planning & debug
		title: "Management",
		items: [
			{ href: "/hr", icon: BarChart2, text: "HR Admin" },
			{ href: "/job-family", icon: Layers, text: "Job Families" },
			{ href: "/competences", icon: Briefcase, text: "Competences" },
			{ href: "/company", icon: Factory, text: "Company" },
		],
		showDivider: true,
		collapsible: true
	},
	{
		// Footer navigation
		items: [
			{ href: "/settings", icon: Settings, text: "Settings" },
			// { href: "/help", icon: HelpCircle, text: "Help & Support" }
		]
	}
];

interface CollapsibleSidebarProps {
	isCollapsed?: boolean;
	onToggleCollapse?: (collapsed: boolean) => void;
}

export function CollapsibleSidebar({ isCollapsed: propIsCollapsed, onToggleCollapse }: CollapsibleSidebarProps) {
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
		<div
			className="flex h-full flex-col relative bg-background __bg-neutral-100/50 "
		>
			<div className={cn(
				"flex flex-col h-full py-6 transition-all duration-300 overflow-hidden",
				isCollapsed ? "items-center px-2 w-[60px]" : "px-4 w-full"
			)}>
				<TooltipProvider delayDuration={0}>
					<div className="flex flex-col h-full">
						{navigationConfig.map((group, groupIndex) => (
							<div key={groupIndex} className={cn(
								groupIndex === navigationConfig.length - 1 ? "mt-auto" : "",
								"mb-2"
							)}>
								{group.title && !isCollapsed && (
									<>
										{group.collapsible ? (
											<Collapsible
												open={managerMenuOpen}
												onOpenChange={setManagerMenuOpen}
												className="w-full"
											>
												<CollapsibleTrigger className="flex items-center w-full py-2 px-2 text-sm font-medium text-muted-foreground hover:text-foreground">
													<span>{group.title}</span>
													<ChevronRight className={cn(
														"ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
														managerMenuOpen && "rotate-90"
													)} />
												</CollapsibleTrigger>
												<CollapsibleContent className="space-y-1 transition-all">
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

								{group.showDivider && (
									<div className={cn(
										"my-4",
										isCollapsed ? "w-6 mx-auto" : ""
									)}>
										{/* <div className="h-[1px] bg-border/50 w-full" /> */}
									</div>
								)}
							</div>
						))}
					</div>
				</TooltipProvider>
			</div>

			{/* Collapse toggle button */}
			<Button
				variant="ghost"
				size="icon"
				className="absolute bottom-3 right-3 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
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
							"flex h-10 w-10 items-center justify-center rounded-md transition-colors",
							isActive
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:bg-muted hover:text-foreground"
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
				"flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-muted hover:text-foreground"
			)}
		>
			{icon}
			<span>{text}</span>
		</Link>
	);
}