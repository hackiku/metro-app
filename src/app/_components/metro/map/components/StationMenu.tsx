// src/app/_components/metro/map/components/StationMenu.tsx
"use client"

import { useRef, useState, useEffect } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { MapPin, Target, Briefcase, ArrowRight } from "lucide-react";
import type { Role } from "~/types";

interface StationMenuProps {
	station: Role;
	isCurrentStation: boolean;
	isTargetStation: boolean;
	onSetCurrent: (station: Role) => void;
	onSetTarget: (station: Role) => void;
	onViewDetails: (station: Role) => void;
}

export function StationMenu({
	station,
	isCurrentStation,
	isTargetStation,
	onSetCurrent,
	onSetTarget,
	onViewDetails
}: StationMenuProps) {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLDivElement>(null);

	// Setup keyboard shortcut for context menu
	useEffect(() => {
		const handleContextMenu = (e: MouseEvent) => {
			// Check if the click target is part of this station
			const stationElement = triggerRef.current?.closest('.station-node');
			if (stationElement && stationElement.contains(e.target as Node)) {
				e.preventDefault();
				setOpen(true);
			}
		};

		document.addEventListener('contextmenu', handleContextMenu);
		return () => {
			document.removeEventListener('contextmenu', handleContextMenu);
		};
	}, []);

	const actions = [
		{
			id: "view-details",
			name: "View Job Details",
			icon: <Briefcase className="h-4 w-4 mr-2" />,
			action: () => {
				onViewDetails(station);
				setOpen(false);
			},
			disabled: false
		},
		{
			id: "set-current",
			name: "Set as Current Position",
			icon: <MapPin className="h-4 w-4 mr-2" />,
			action: () => {
				onSetCurrent(station);
				setOpen(false);
			},
			disabled: isCurrentStation
		},
		{
			id: "set-target",
			name: "Set as Target Position",
			icon: <Target className="h-4 w-4 mr-2" />,
			action: () => {
				onSetTarget(station);
				setOpen(false);
			},
			disabled: isTargetStation
		}
	];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverAnchor ref={triggerRef} />
			<PopoverTrigger className="hidden">
				{/* Hidden trigger, we control opening programmatically */}
			</PopoverTrigger>
			<PopoverContent
				className="w-56 p-0"
				align="center"
				side="bottom"
				alignOffset={-20}
			>
				<Command>
					<CommandInput placeholder="Search actions..." />
					<CommandList>
						<CommandEmpty>No actions found.</CommandEmpty>
						<CommandGroup>
							{actions.map((action) => (
								<CommandItem
									key={action.id}
									disabled={action.disabled}
									onSelect={action.action}
									className={action.disabled ? "opacity-50 cursor-not-allowed" : ""}
								>
									{action.icon}
									<span>{action.name}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export default StationMenu;