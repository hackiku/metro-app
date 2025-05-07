// src/components/dev/NavDataEditorButton.tsx - Updated version
"use client";

import { useState, useRef, useEffect } from "react";
import { Database } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MegaDataViewer } from "./MegaDataViewer";

interface NavDataEditorButtonProps {
	data?: Record<string, any>; // Make data optional
	title?: string;
	onSave?: (updatedData: any) => void;
	saveToApi?: boolean;
	entityType?: string;
}

export function NavDataEditorButton({
	data = {}, // Default to empty object
	title = "Data Editor",
	onSave,
	saveToApi = true,
	entityType
}: NavDataEditorButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Handle clicks outside to close the mega div
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isOpen &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node) &&
				!(event.target as Element).closest('.mega-data-viewer')) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className="relative">
			<div>
				<Button
					ref={buttonRef}
					variant="ghost"
					size="icon"
					onClick={toggleOpen}
					className="h-7 w-7 bg-primary/5 hover:bg-primary/10"
				>
					<Database className="h-4 w-4 text-primary" />
					<span className="sr-only">Open Data Editor</span>
				</Button>
			</div>

			{isOpen && (
				<div className="mega-data-viewer z-50">
					<MegaDataViewer
						data={data}
						title={title}
						isOpen={isOpen}
						onClose={() => setIsOpen(false)}
					/>
				</div>
			)}
		</div>
	);
}