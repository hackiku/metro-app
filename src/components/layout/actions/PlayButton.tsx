// src/components/layout/actions/PlayButton.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Play, Pause } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

interface PlayButtonProps {
	className?: string;
	variant?: "default" | "mini";
}

export function PlayButton({ className, variant = "default" }: PlayButtonProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isPlaying, setIsPlaying] = useState(false);

	// Check if we're on the metro page
	useEffect(() => {
		setIsPlaying(pathname === "/metro");
	}, [pathname]);

	// Toggle between metro and previous page
	const toggleMetro = () => {
		if (isPlaying) {
			// If we're on metro, go to home or the stored previous page
			const previousPage = localStorage.getItem("previousPageBeforeMetro") || "/";
			router.push(previousPage);
		} else {
			// Store current page before navigating to metro
			if (pathname !== "/metro") {
				localStorage.setItem("previousPageBeforeMetro", pathname);
			}
			router.push("/metro");
		}
	};

	if (variant === "mini") {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="relative">
							{/* Base of 3D button - subtle shadow */}
							<div className={cn(
								"absolute inset-0 rounded-md",
								isPlaying
									? "bg-muted/30 translate-y-[2px]"
									: "bg-muted/20"
							)} />

							{/* The button itself */}
							<Button
								variant="ghost"
								size="icon"
								className={cn(
									"relative rounded-md w-9 h-9 transition-all duration-200 border border-muted-foreground/10",
									isPlaying
										? "bg-muted/30 text-muted-foreground/70 translate-y-[1px] shadow-none"
										: "bg-background text-muted-foreground/50 shadow-sm hover:translate-y-[1px] hover:text-muted-foreground/70",
									className
								)}
								onClick={toggleMetro}
							>
								{isPlaying ? (
									<Pause className="h-4 w-4" />
								) : (
									<Play className="h-4 w-4 ml-0.5" />
								)}
							</Button>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						{isPlaying ? "Close Metro" : "Open Metro"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="relative">
						{/* Base layer for 3D effect */}
						<div className={cn(
							"absolute inset-0 rounded-md",
							isPlaying
								? "bg-muted/30 translate-y-[2px]"
								: "bg-muted/20"
						)} />

						{/* The button itself */}
						<Button
							variant="outline"
							size="sm"
							className={cn(
								"relative rounded-md shadow-sm h-9 px-3.5 transition-all duration-200 border border-muted-foreground/10",
								isPlaying
									? "bg-muted/30 text-muted-foreground/70 translate-y-[1px] shadow-none"
									: "bg-background text-muted-foreground/70 hover:translate-y-[1px] hover:text-muted-foreground",
								className
							)}
							onClick={toggleMetro}
						>
							<div className="flex items-center">
								{isPlaying ? (
									<>
										<Pause className="h-4 w-4" />
									</>
								) : (
									<>
										<Play className="h-4 w-4" />
									</>
								)}
							</div>
						</Button>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					{isPlaying ? "Return to previous view" : "Open Metro Map"}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}