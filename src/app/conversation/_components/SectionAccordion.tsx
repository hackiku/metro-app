// src/app/conversation/_components/SectionAccordion.tsx
"use client";

import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "~/components/ui/accordion";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { type PreparationSectionData, type TalkingPointSectionData } from "../types";
import { CheckCircle2, Circle, Edit2, Clock, ListChecks, Check } from "lucide-react"; // Added icons
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge"; // For mini-summary

interface SectionAccordionProps {
	section: PreparationSectionData | TalkingPointSectionData;
	notes: string;
	onNoteChange: (notes: string) => void;
	isSectionComplete?: boolean; // For preparation sections checkmark
	// Removed checklist specific props, assuming completion is handled by 'isSectionComplete' for now
}

export function SectionAccordion({
	section,
	notes,
	onNoteChange,
	isSectionComplete,
}: SectionAccordionProps) {
	const isPreparationSection = 'checklist' in section;
	const prepSection = section as PreparationSectionData;
	const talkSection = section as TalkingPointSectionData;
	const hasNotes = notes && notes.trim().length > 0;

	// Mini-summary elements for the trigger
	const renderTriggerSummary = () => {
		if (isPreparationSection) {
			return (
				<>
					<Badge variant="outline" className="ml-auto mr-2 hidden gap-1 text-xs font-normal sm:inline-flex">
						<ListChecks className="h-3 w-3" /> {prepSection.checklist.length} items
					</Badge>
					{hasNotes && (
						<Badge variant={isSectionComplete ? "default" : "secondary"} className={cn("gap-1 text-xs font-normal", isSectionComplete && "bg-green-600")}>
							{isSectionComplete ? <Check className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
							{isSectionComplete ? "Prepared" : "Notes Added"}
						</Badge>
					)}
				</>
			);
		} else { // Talking Points Section
			return (
				<>
					{talkSection.estimatedTime && (
						<Badge variant="outline" className="ml-auto mr-2 hidden gap-1 text-xs font-normal sm:inline-flex">
							<Clock className="h-3 w-3" /> {talkSection.estimatedTime}
						</Badge>
					)}
					{hasNotes && (
						<Badge variant="secondary" className="gap-1 text-xs font-normal">
							<Edit2 className="h-3 w-3" /> Customized
						</Badge>
					)}
				</>
			);
		}
	};

	return (
		<AccordionItem value={section.id} className="overflow-hidden rounded-lg border bg-card dark:bg-neutral-800/30">
			<AccordionTrigger className="p-4 hover:no-underline">
				<div className="flex w-full items-center justify-start gap-3">
					{/* Icon/Number */}
					{isSectionComplete ?
						<CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-500" /> :
						<div className={cn(
							"flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
							isPreparationSection ? "border-primary text-primary bg-card" : "border-muted-foreground text-muted-foreground bg-card" // Different style for talking points numbers?
						)}>
							{prepSection.number || talkSection.id.split('-')[0].substring(0, 1).toUpperCase()} {/* Use number or first letter */}
						</div>
					}
					{/* Title */}
					<span className="flex-1 text-left font-semibold text-foreground">{section.title}</span>
					{/* Mini Summary */}
					<div className="flex items-center gap-2">
						{renderTriggerSummary()}
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="border-t p-4 pt-4">
				<p className="mb-3 text-sm text-muted-foreground">{section.description}</p>

				{/* Display Checklist (Preparation Only) */}
				{isPreparationSection && prepSection.checklist && (
					<div className="mb-4 space-y-2 rounded-md border border-dashed bg-muted/30 p-3 dark:bg-card/30">
						<h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Checklist:</h4>
						{prepSection.checklist.map((item, index) => (
							<div key={`${section.id}-chk-${index}`} className="flex items-center space-x-2">
								<Circle className="h-3.5 w-3.5 text-muted-foreground/70" />
								<Label htmlFor={`${section.id}-chk-${index}`} className="text-sm font-normal text-muted-foreground">
									{item}
								</Label>
							</div>
						))}
					</div>
				)}

				{/* Display Script Template (Talking Points Only) */}
				{'scriptTemplate' in section && (
					<div className="mb-3 rounded-md border bg-blue-500/10 p-3 dark:bg-blue-900/20">
						<p className="text-xs font-medium uppercase tracking-wider text-blue-700 dark:text-blue-300">Suggested Script:</p>
						<p className="mt-1 whitespace-pre-wrap text-sm italic text-blue-700/80 dark:text-blue-300/80">{talkSection.scriptTemplate}</p>
					</div>
				)}

				{/* Notes Textarea */}
				<Label htmlFor={`notes-${section.id}`} className="mb-1 block text-xs font-medium text-muted-foreground">
					{isPreparationSection ? "Your Notes & Examples:" : "Your Customization/Notes:"}
				</Label>
				<Textarea
					id={`notes-${section.id}`}
					value={notes}
					onChange={(e) => onNoteChange(e.target.value)}
					placeholder={prepSection.userNotesPlaceholder || talkSection.userNotesPlaceholder}
					rows={5}
					className="bg-background dark:bg-neutral-800"
				/>
			</AccordionContent>
		</AccordionItem>
	);
}