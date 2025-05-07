// src/components/dev/NavDataButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Database } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DataEditor } from "./DataEditor";

interface NavDataButtonProps {
	data?: Record<string, any>;
	title?: string;
	onSave?: (updatedData: any) => void;
	saveToApi?: boolean;
	entityType?: string;
}

export function NavDataButton({
	data = {},
	title = "Data Editor",
	onSave,
	saveToApi = true,
	entityType
}: NavDataButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// Handle clicks outside to close the container
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (isOpen &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node) &&
				!(event.target as Element).closest('.data-editor-container')) {
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

	const handleSave = (updatedData: any) => {
		if (onSave) {
			onSave(updatedData);
		}
		// Keep editor open after save
	};

	return (
		<div className="relative">
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

			<p className="text-xs mt-1">Edit data</p>

			{isOpen && (
				<div className="data-editor-container fixed inset-x-0 z-50 mt-2 border rounded-lg shadow-lg bg-background/95 backdrop-blur-sm" style={{ maxHeight: 'calc(100vh - 200px)' }}>
					<DataEditor
						data={data}
						title={title}
						onSave={handleSave}
						saveToApi={saveToApi}
						entityType={entityType}
					/>
				</div>
			)}
		</div>
	);
}
