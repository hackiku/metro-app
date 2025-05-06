// src/app/conversation/_components/ConversationGuideShell.tsx
"use client";

import { useState } from "react";
import { MessageSquare, Download, Copy, Settings2, ListChecks, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Accordion } from "~/components/ui/accordion";
import {
	preparationSections,
	talkingPointsSections,
	confidenceCheckItems,
	mockUser, // For demo
} from "../_data";
import { type PreparationSectionData, type TalkingPointSectionData, type UserNote, type PreparationChecklistItem, type ConfidenceCheckItemData } from "../types";
import { SectionAccordion } from "./SectionAccordion"; // We'll create this
import { CareerAspirationDisplay } from "./summary/CareerAspirationDisplay";
import { DevelopmentPlanOverviewDisplay } from "./summary/DevelopmentPlanOverviewDisplay";
import { ConfidenceCheck } from "./summary/ConfidenceCheck";
import { Textarea } from "~/components/ui/textarea"; // For user input

type ActiveTab = "preparation" | "talkingPoints" | "summary";

export function ConversationGuideShell() {
	const [activeTab, setActiveTab] = useState<ActiveTab>("preparation");

	// State for user inputs
	const [preparationNotes, setPreparationNotes] = useState<Record<string, string>>({});
	const [talkingPointNotes, setTalkingPointNotes] = useState<Record<string, string>>({});
	const [preparationChecklist, setPreparationChecklist] = useState<Record<string, boolean>>({});
	const [confidenceChecks, setConfidenceChecks] = useState<Record<string, boolean>>({});


	const handleNoteChange = (
		sectionId: string,
		notes: string,
		type: "preparation" | "talkingPoints"
	) => {
		if (type === "preparation") {
			setPreparationNotes((prev) => ({ ...prev, [sectionId]: notes }));
		} else {
			setTalkingPointNotes((prev) => ({ ...prev, [sectionId]: notes }));
		}
	};

	const handlePrepChecklistToggle = (itemId: string, sectionId: string) => {
		// This is a simplified checklist toggle; in reality, you'd have unique IDs for sub-items.
		// For this example, we'll just toggle a "prepared" state for the whole section.
		setPreparationChecklist((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
	};

	const handleConfidenceCheckToggle = (itemId: string) => {
		setConfidenceChecks(prev => ({ ...prev, [itemId]: !prev[itemId] }));
	}

	const generateSummaryText = () => {
		let summary = `## Career Aspiration Summary for ${mockUser.targetRole}\n\n`;
		summary += `### Current Position: ${mockUser.currentRole}\n`;
		summary += `- Responsibilities: ${mockUser.currentResponsibilities}\n`;
		summary += `- Strengths: ${mockUser.currentStrengths}\n`;
		summary += `- Achievements: ${mockUser.notableAchievements}\n\n`;

		summary += `### Career Aspiration: ${mockUser.targetRole}\n`;
		summary += `- Timeframe: ${mockUser.developmentPlanOverview.phases.reduce((acc, p) => acc + parseInt(p.duration), 0)} months (approx)\n`; // Summing up phase durations
		summary += `- Reasons for Interest:\n${mockUser.reasonsForInterestInTarget.map(r => `  - ${r}`).join('\n')}\n\n`;

		summary += `### My Preparation Notes:\n`;
		preparationSections.forEach(section => {
			summary += `#### ${section.title}\n${preparationNotes[section.id] || "No notes yet."}\n\n`;
		});

		summary += `### My Talking Points:\n`;
		talkingPointsSections.forEach(section => {
			summary += `#### ${section.title}\n${talkingPointNotes[section.id] || "No script customization yet."}\n\n`;
		});

		summary += `### Development Plan Overview:\n`;
		mockUser.developmentPlanOverview.phases.forEach(phase => {
			summary += `- ${phase.name} (${phase.duration})\n`;
		});
		summary += `Key Skills to Develop:\n${mockUser.developmentPlanOverview.keySkillsToDevelop.map(s => `  - ${s}`).join('\n')}\n\n`;

		summary += `### Support Requested:\n`;
		summary += `From Manager:\n${mockUser.supportRequestedManager.map(s => `  - ${s}`).join('\n')}\n`;
		summary += `From Organization:\n${mockUser.supportRequestedOrg.map(s => `  - ${s}`).join('\n')}\n`;

		return summary;
	};

	const handleDownloadSummary = () => {
		const summaryText = generateSummaryText();
		const blob = new Blob([summaryText], { type: 'text/markdown;charset=utf-8' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `CareerConversationSummary-${mockUser.targetRole.replace(/\s+/g, '_')}.md`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(generateSummaryText())
			.then(() => alert("Summary copied to clipboard!")) // Replace with Sonner toast
			.catch(err => console.error("Failed to copy: ", err));
	};


	return (
		<div className="animate-fade-in">
			{/* Page Header */}
			<div className="mb-8 flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<MessageSquare className="h-6 w-6" />
				</div>
				<div>
					<h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
						Career Conversation Guide
					</h1>
					<p className="text-muted-foreground">
						Prepare for a productive discussion about your career aspirations
					</p>
				</div>
			</div>

			{/* Tabs for main sections */}
			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTab)} className="w-full">
				<TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
					<TabsTrigger value="preparation" className="gap-2"> <Settings2 className="h-4 w-4" /> Conversation Preparation</TabsTrigger>
					<TabsTrigger value="talkingPoints" className="gap-2"> <ListChecks className="h-4 w-4" /> Key Talking Points</TabsTrigger>
					<TabsTrigger value="summary" className="gap-2"> <FileText className="h-4 w-4" /> Conversation Summary</TabsTrigger>
				</TabsList>

				{/* Content for Preparation Tab */}
				<TabsContent value="preparation" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Prepare Your Thoughts</CardTitle>
							<CardDescription>
								Structure your thoughts for each key area of discussion. Jot down notes and examples.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Accordion type="multiple" className="w-full space-y-4">
								{preparationSections.map((section) => (
									<SectionAccordion
										key={section.id}
										section={section}
										notes={preparationNotes[section.id] || ""}
										onNoteChange={(notes) => handleNoteChange(section.id, notes, "preparation")}
										isSectionComplete={preparationChecklist[section.id] || false}
										onChecklistToggle={(itemId) => handlePrepChecklistToggle(itemId, section.id)}
									/>
								))}
							</Accordion>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Content for Talking Points Tab */}
				<TabsContent value="talkingPoints" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Structure Your Conversation</CardTitle>
							<CardDescription>
								Follow this framework and personalize the script for a smooth discussion.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Accordion type="multiple" className="w-full space-y-4">
								{talkingPointsSections.map((section) => (
									<SectionAccordion
										key={section.id}
										section={section} // SectionAccordion needs to handle both types or be specialized
										notes={talkingPointNotes[section.id] || ""}
										onNoteChange={(notes) => handleNoteChange(section.id, notes, "talkingPoints")}
										showChecklist={false} // No checklist for talking points sections
									/>
								))}
							</Accordion>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Content for Summary Tab */}
				<TabsContent value="summary" className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Your Conversation Summary</CardTitle>
							<CardDescription>
								A concise overview of your career goals and development plan, ready for your discussion.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<CareerAspirationDisplay userData={mockUser} />
							<DevelopmentPlanOverviewDisplay planOverview={mockUser.developmentPlanOverview} />

							<div>
								<h3 className="mb-3 text-lg font-semibold">My Preparation Notes</h3>
								{preparationSections.map(section => (
									<div key={`summary-prep-${section.id}`} className="mb-4 rounded-md border bg-muted/50 p-4 dark:bg-card/50">
										<h4 className="font-medium">{section.title}</h4>
										<p className="whitespace-pre-wrap text-sm text-muted-foreground">
											{preparationNotes[section.id] || <span className="italic">No notes added.</span>}
										</p>
									</div>
								))}
							</div>
							<div>
								<h3 className="mb-3 text-lg font-semibold">My Talking Points Customization</h3>
								{talkingPointsSections.map(section => (
									<div key={`summary-talk-${section.id}`} className="mb-4 rounded-md border bg-muted/50 p-4 dark:bg-card/50">
										<h4 className="font-medium">{section.title}</h4>
										<p className="whitespace-pre-wrap text-sm text-muted-foreground">
											{talkingPointNotes[section.id] || <span className="italic">No customization added.</span>}
										</p>
									</div>
								))}
							</div>

							<ConfidenceCheck
								items={confidenceCheckItems}
								checks={confidenceChecks}
								onToggle={handleConfidenceCheckToggle}
							/>
						</CardContent>
						<CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
							<Button variant="outline" onClick={handleCopyToClipboard}>
								<Copy className="mr-2 h-4 w-4" /> Copy Summary
							</Button>
							<Button onClick={handleDownloadSummary}>
								<Download className="mr-2 h-4 w-4" /> Download as Markdown
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}