// src/services/user/careerService.ts

import { careersClient } from '~/server/db/supabase';
import type { CareerPath, Transition, UserProfile } from '~/types/career';

// User profile functions
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  // [Your existing fetchUserProfile code]
}

export async function fetchDemoUserProfile(): Promise<UserProfile | null> {
  // [Your existing fetchDemoUserProfile code]
}

// Career path functions 
export async function fetchCareerPaths(): Promise<CareerPath[]> {
  // [Your existing fetchCareerPaths code]
}

// Transitions functions
export async function fetchTransitions(): Promise<Transition[]> {
  // [Your existing fetchTransitions code with the fixed query]
}

// Skills gap analysis
export function calculateSkillGaps(userSkills, roleSkills) {
  // Move the gap calculation logic from components to here
}