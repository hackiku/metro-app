// src/app/_components/metro/map/components/StationMenu.tsx
"use client"

import { useRef } from "react";
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
import { MapPin, Target, Briefcase, XCircle } from "lucide-react";
import type { Role } from "~/types/career";

interface StationMenuProps {
	station: Role;
	isCurrentStation: boolean;
	isTargetStation: boolean;
	onSetCurrent: (station: Role) => void;
	onSetTarget: (station: Role) => void;
	onViewDetails: (station: Role) => void;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function StationMenu({
	station,
	isCurrentStation,
	isTargetStation,
	onSetCurrent,
	onSetTarget,
	onViewDetails,
	open,
	onOpenChange
}: StationMenuProps) {
	const triggerRef = useRef<HTMLDivElement>(null);

	// Define all possible actions including remove options
	const actions = [
		{
			id: "view-details",
			name: "View Job Details",
			icon: <Briefcase className="h-4 w-4 mr-2" />,
			action: () => {
				onViewDetails(station);
				onOpenChange(false);
			},
			disabled: false
		},
		{
			id: "set-current",
			name: "Set as Current Position",
			icon: <MapPin className="h-4 w-4 mr-2" />,
			action: () => {
				onSetCurrent(station);
				onOpenChange(false);
			},
			disabled: isCurrentStation
		},
		{
			id: "clear-current",
			name: "Remove Current Position",
			icon: <XCircle className="h-4 w-4 mr-2 text-red-500" />,
			action: () => {
				// We can pass a dummy role ID to clear it
				// This requires modification in the context handler
				onSetCurrent({ ...station, id: "" });
				onOpenChange(false);
			},
			disabled: !isCurrentStation
		},
		{
			id: "set-target",
			name: "Set as Target Position",
			icon: <Target className="h-4 w-4 mr-2" />,
			action: () => {
				onSetTarget(station);
				onOpenChange(false);
			},
			disabled: isTargetStation
		},
		{
			id: "clear-target",
			name: "Remove Target Position",
			icon: <XCircle className="h-4 w-4 mr-2 text-red-500" />,
			action: () => {
				// We can pass a dummy role ID to clear it
				onSetTarget({ ...station, id: "" });
				onOpenChange(false);
			},
			disabled: !isTargetStation
		}
	];

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverAnchor ref={triggerRef} />
			<PopoverTrigger className="hidden">
				{/* Hidden trigger, controlled by parent */}
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