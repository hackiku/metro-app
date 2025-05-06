// src/app/conversation/types.ts
export interface UserNote {
  sectionId: string; // e.g., 'org-goals', 'opening'
  notes: string;
}

export interface PreparationChecklistItem {
    id: string; // Corresponds to a checklist item in preparationSections
    isPrepared: boolean;
}

export interface ConversationState {
  preparationNotes: UserNote[];
  talkingPointNotes: UserNote[];
  preparationChecklist: PreparationChecklistItem[];
  targetRole: string; // Could be fetched or set by user
  // Add other stateful elements, e.g., confidence check statuses
}

export interface PreparationSectionData {
  id: string;
  title: string;
  number: number;
  description: string;
  checklist: string[];
  userNotesPlaceholder: string;
}

export interface TalkingPointSectionData {
  id: string;
  title: string;
  description: string;
  scriptTemplate: string;
  userNotesPlaceholder: string;
}

export interface ConfidenceCheckItemData {
    id: string;
    text: string;
}