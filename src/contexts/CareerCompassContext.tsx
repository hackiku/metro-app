// src/contexts/CareerCompassContext.tsx
import { createContext } from 'react';
import type {
	Organization,
	CareerPath,
	Position,
	PositionDetail
	// Remove Transition, Skill, PositionDetailSkill for now
} from '~/types/compass'; // Define these types based on your new schema

// Define the shape of the context data - ONLY CORE TABLES
export interface CareerCompassContextType {
	organization: Organization | null;
	careerPaths: CareerPath[];
	positions: Position[];
	positionDetails: PositionDetail[];
	// REMOVED: transitions: Transition[];
	// REMOVED: skills: Skill[];
	// REMOVED: positionDetailSkills: PositionDetailSkill[];
	loading: boolean;
	error: string | null;
	refreshData: (organizationId: string) => Promise<void>;
}

// Create the context with a default undefined value
export const CareerCompassContext = createContext<CareerCompassContextType | undefined>(
	undefined
);