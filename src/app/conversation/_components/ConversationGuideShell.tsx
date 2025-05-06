// src/app/conversation/_components/ConversationGuideShell.tsx
"use client";

import { useState, useEffect } from "react";
import { Settings2, ListChecks } from "lucide-react"; // Icons for tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Accordion } from "~/components/ui/accordion";
import {
	preparationSections,
	talkingPointsSections,
	confidenceCheckItems,
	mockUser, // Using mock data for demonstration
} from "../_data"; // Ensure correct path to your data file
import { type PreparationSectionData, type TalkingPointSectionData, type UserNote, type ConfidenceCheckItemData } from "../types"; // Ensure correct path
import { SectionAccordion } from "./SectionAccordion"; // Your enhanced accordion component
import { ConversationHeaderCard } from "./ConversationHeaderCard"; // Your new header card component
import { ConversationSummaryPreviewCard } from "./ConversationSummaryPreviewCard"; // Your new summary preview card

// Define the possible active tabs
type ActiveTab = "preparation" | "talkingPoints";

export function ConversationGuideShell() {
	// State for the active tab
	const [activeTab, setActiveTab] = useState<ActiveTab>("preparation");

	// State to hold user's notes for each section
	const [preparationNotes, setPreparationNotes] = useState<Record<string, string>>({});
	const [talkingPointNotes, setTalkingPointNotes] = useState<Record<string, string>>({});

	// State to track if a preparation section is considered "Prepared" (simplified)
	const [preparationChecklist, setPreparationChecklist] = useState<Record<string, boolean>>({});

	// State for the confidence checklist in the summary
	const [confidenceChecks, setConfidenceChecks] = useState<Record<string, boolean>>({});

	// State for the overall preparation progress percentage
	const [overallProgress, setOverallProgress] = useState(0);

	// Calculate overall progress whenever the preparation checklist state changes
	useEffect(() => {
		const completedCount = Object.values(preparationChecklist).filter(Boolean).length;
		const totalSections = preparationSections.length;
		const progress = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
		setOverallProgress(progress);
	}, [preparationChecklist]);

	// Handler for updating notes in Textareas
	const handleNoteChange = (
		sectionId: string,
		notes: string,
		type: "preparation" | "talkingPoints" // Determine which state to update
	) => {
		const stateUpdater = type === "preparation" ? setPreparationNotes : setTalkingPointNotes;
		stateUpdater((prevNotes) => ({ ...prevNotes, [sectionId]: notes }));
	};

	// Handler for toggling the 'prepared' state of a preparation section (simplified)
	// In a real app, this might be triggered differently (e.g., explicit button, all sub-items checked)
	const handlePrepSectionToggle = (sectionId: string) => {
		setPreparationChecklist((prevChecklist) => ({
			...prevChecklist,
			[sectionId]: !prevChecklist[sectionId], // Toggle the boolean value
		}));
	};

	// Handler for toggling confidence checklist items
	const handleConfidenceCheckToggle = (itemId: string) => {
		setConfidenceChecks(prevChecks => ({
			...prevChecks,
			[itemId]: !prevChecks[itemId], // Toggle the boolean value
		}));
	};

	// --- Function to generate the full summary text ---
	const generateSummaryText = (): string => {
		let summary = `## Career Conversation Summary: Aspiring ${mockUser.targetRole}\n\n`;

		// Current Position Section
		summary += `### Current Position: ${mockUser.currentRole}\n`;
		summary += `*   **Responsibilities:** ${mockUser.currentResponsibilities || 'N/A'}\n`;
		summary += `*   **Key Strengths:** ${mockUser.currentStrengths || 'N/A'}\n`;
		summary += `*   **Notable Achievements:** ${mockUser.notableAchievements || 'N/A'}\n\n`;

		// Career Aspiration Section
		summary += `### Career Aspiration: ${mockUser.targetRole}\n`;
		const totalMonths = mockUser.developmentPlanOverview.phases.reduce((acc, p) => {
			const match = p.duration.match(/(\d+)/);
			return acc + (match ? parseInt(match[1], 10) : 0);
		}, 0);
		summary += `*   **Target Timeframe:** ~${totalMonths} months\n`;
		summary += `*   **Reasons for Interest:**\n`;
		mockUser.reasonsForInterestInTarget.forEach(reason => {
			summary += `    *   ${reason}\n`;
		});
		summary += `\n`;

		// Preparation Notes Section
		summary += `### Preparation Notes:\n`;
		preparationSections.forEach(section => {
			summary += `*   **${section.title}:**\n`;
			const notes = preparationNotes[section.id] || "_No notes added._";
			summary += `    ${notes.split('\n').join('\n    ')}\n\n`; // Indent multi-line notes
		});

		// Talking Points Customization Section
		summary += `### Talking Points Outline:\n`;
		talkingPointsSections.forEach(section => {
			summary += `*   **${section.title} (${section.estimatedTime}):**\n`;
			const notes = talkingPointNotes[section.id];
			summary += `    ${notes ? notes.split('\n').join('\n    ') : '_Using suggested script._'}\n\n`; // Indent notes or show default
		});

		// Development Plan Section
		summary += `### Development Plan Overview:\n`;
		summary += `*   **Phases:**\n`;
		mockUser.developmentPlanOverview.phases.forEach(phase => {
			summary += `    *   ${phase.name} (${phase.duration})\n`;
		});
		summary += `*   **Key Skills to Develop:**\n`;
		mockUser.developmentPlanOverview.keySkillsToDevelop.forEach(skill => {
			summary += `    *   ${skill}\n`;
		});
		summary += `\n`;

		// Support Requested Section
		summary += `### Support Requested:\n`;
		summary += `*   **From Manager:**\n`;
		mockUser.supportRequestedManager.forEach(request => {
			summary += `    *   ${request}\n`;
		});
		summary += `*   **From Organization:**\n`;
		mockUser.supportRequestedOrg.forEach(request => {
			summary += `    *   ${request}\n`;
		});

		return summary;
	};
	// --- End Summary Generation ---


	// --- Download/Copy Handlers ---
	const handleDownloadSummary = () => {
		const summaryText = generateSummaryText();
		const blob = new Blob([summaryText], { type: 'text/markdown;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		// Simple filename, customize as needed
		link.download = `Career_Conversation_Guide_${mockUser.targetRole.replace(/\s+/g, '_')}.md`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(link.href); // Clean up blob URL
	};

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(generateSummaryText())
			.then(() => {
				alert("Summary copied to clipboard!"); // Replace with a Sonner toast notification
				// Example: toast.success("Summary copied to clipboard!");
			})
			.catch(err => {
				console.error("Failed to copy text: ", err);
				alert("Failed to copy summary."); // Replace with Sonner toast
				// Example: toast.error("Failed to copy summary.");
			});
	};
	// --- End Download/Copy Handlers ---


	return (
		// Main container with vertical spacing
		<div className="animate-fade-in space-y-8">

			{/* Top Header Card */}
			<ConversationHeaderCard
				targetRole={mockUser.targetRole}
				// Using current role as subtitle, adjust if needed
				subtitle={`Prepare discussion for role: ${mockUser.currentRole}`}
				overallProgress={overallProgress}
			/>

			{/* Tabs for the two main interactive sections */}
			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)} className="w-full">
				{/* Tab Triggers */}
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="preparation" className="gap-2">
						<Settings2 className="h-4 w-4" /> Conversation Preparation
					</TabsTrigger>
					<TabsTrigger value="talkingPoints" className="gap-2">
						<ListChecks className="h-4 w-4" /> Key Talking Points
					</TabsTrigger>
				</TabsList>

				{/* Preparation Tab Content */}
				<TabsContent value="preparation" className="mt-6">
					<Accordion type="multiple" className="w-full space-y-4">
						{preparationSections.map((section) => (
							<SectionAccordion
								key={section.id}
								section={section}
								notes={preparationNotes[section.id] || ""}
								onNoteChange={(notes) => handleNoteChange(section.id, notes, "preparation")}
								// Pass prepared state for visual feedback (check icon)
								isSectionComplete={preparationChecklist[section.id] || false}
							// Note: The actual *toggling* of 'isSectionComplete' might need a dedicated button
							// or be linked to interacting with the content, depending on desired UX.
							// For now, clicking the header icon could toggle it if implemented in SectionAccordion.
							/>
						))}
					</Accordion>
				</TabsContent>

				{/* Talking Points Tab Content */}
				<TabsContent value="talkingPoints" className="mt-6">
					<Accordion type="multiple" className="w-full space-y-4">
						{talkingPointsSections.map((section) => (
							<SectionAccordion
								key={section.id}
								section={section}
								notes={talkingPointNotes[section.id] || ""}
								onNoteChange={(notes) => handleNoteChange(section.id, notes, "talkingPoints")}
							/>
						))}
					</Accordion>
				</TabsContent>
			</Tabs>

			{/* Summary Preview Card (always visible below tabs) */}
			<ConversationSummaryPreviewCard
				userData={mockUser}
				preparationNotes={preparationNotes}      // Pass notes state
				talkingPointNotes={talkingPointNotes}   // Pass notes state
				confidenceChecks={confidenceChecks}
				confidenceCheckItems={confidenceCheckItems}
				onToggleConfidenceCheck={handleConfidenceCheckToggle}
				onDownload={handleDownloadSummary}
				onCopy={handleCopyToClipboard}
				generateSummaryText={generateSummaryText} // Pass the generator function
			/>
		</div>
	);
}