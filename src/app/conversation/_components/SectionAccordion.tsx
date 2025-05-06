// src/app/conversation/_components/SectionAccordion.tsx
"use client";

import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox"; // If using checklist items
import { Label } from "~/components/ui/label";
import { type PreparationSectionData, type TalkingPointSectionData } from "../types";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "~/lib/utils";

interface SectionAccordionProps {
	section: PreparationSectionData | TalkingPointSectionData; // Union type
	notes: string;
	onNoteChange: (notes: string) => void;
	isSectionComplete?: boolean;         // Optional, for preparation sections
	onChecklistToggle?: (itemId: string) => void; // Optional
	showChecklist?: boolean; // To conditionally show checklist, defaults to true for prep
}

export function SectionAccordion({
	section,
	notes,
	onNoteChange,
	isSectionComplete,
	onChecklistToggle,
	showChecklist = 'checklist' in section, // Show checklist if section has checklist items
}: SectionAccordionProps) {
	const isPreparationSection = 'checklist' in section;
	const prepSection = section as PreparationSectionData; // Type assertion

	return (
		<AccordionItem value={section.id} className="rounded-lg border bg-card px-1 dark:bg-neutral-800/30">
			<AccordionTrigger className="p-4 hover:no-underline">
				<div className="flex items-center gap-3">
					{isPreparationSection && onChecklistToggle && (
						isSectionComplete ?
							<CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-500" /> :
							<div className={cn(
								"flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
								"border-primary text-primary bg-card"
							)}>
								{prepSection.number}
							</div>
					)}
					<span className="text-left font-semibold text-foreground">{section.title}</span>
				</div>
			</AccordionTrigger>
			<AccordionContent className="p-4 pt-0">
				<p className="mb-3 text-sm text-muted-foreground">{section.description}</p>

				{isPreparationSection && showChecklist && (
					<div className="mb-4 space-y-2 rounded-md border border-dashed bg-muted/30 p-3 dark:bg-card/30">
						<h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Checklist:</h4>
						{prepSection.checklist.map((item, index) => (
							<div key={`${section.id}-chk-${index}`} className="flex items-center space-x-2">
								{/* For simplicity, we're not individually tracking sub-checklist items in this example.
                    The onChecklistToggle for the whole section is triggered by the header icon.
                    To track individual items, you'd need more complex state. */}
								<Circle className="h-3.5 w-3.5 text-muted-foreground/70" />
								<Label htmlFor={`${section.id}-chk-${index}`} className="text-sm font-normal text-muted-foreground">
									{item}
								</Label>
							</div>
						))}
					</div>
				)}

				{'scriptTemplate' in section && (
					<div className="mb-3 rounded-md border bg-blue-500/10 p-3 dark:bg-blue-900/20">
						<p className="text-xs font-medium uppercase tracking-wider text-blue-700 dark:text-blue-300">Suggested Script:</p>
						<p className="mt-1 whitespace-pre-wrap text-sm italic text-blue-700/80 dark:text-blue-300/80">{(section as TalkingPointSectionData).scriptTemplate}</p>
					</div>
				)}

				<Label htmlFor={`notes-${section.id}`} className="mb-1 block text-xs font-medium text-muted-foreground">
					{isPreparationSection ? "Your Notes & Examples:" : "Your Customization/Notes:"}
				</Label>
				<Textarea
					id={`notes-${section.id}`}
					value={notes}
					onChange={(e) => onNoteChange(e.target.value)}
					placeholder={(section as PreparationSectionData).userNotesPlaceholder || (section as TalkingPointSectionData).userNotesPlaceholder}
					rows={5}
					className="bg-background dark:bg-neutral-800"
				/>
			</AccordionContent>
		</AccordionItem>
	);
}