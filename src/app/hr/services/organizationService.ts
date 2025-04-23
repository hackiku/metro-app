// src/app/hr/services/organizationService.ts
import { supabase } from '~/server/db/supabase';
import type { Organization, CareerPath, Position, PositionDetail } from '~/types/compass';

// Function to get organization details by ID
export async function getOrganization(orgId: string): Promise<Organization | null> {
	try {
		const { data, error } = await supabase
			.from('organizations')
			.select('*')
			.eq('id', orgId)
			.single();

		if (error) {
			console.error('Error fetching organization:', error);
			return null;
		}

		return data;
	} catch (error) {
		console.error('Unexpected error in getOrganization:', error);
		return null;
	}
}

// Function to get organization-specific career paths
export async function getOrganizationPaths(orgId: string): Promise<CareerPath[]> {
	try {
		const { data, error } = await supabase
			.from('career_paths')
			.select('*')
			.eq('organization_id', orgId)
			.order('name');

		if (error) {
			console.error('Error fetching career paths:', error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error('Unexpected error in getOrganizationPaths:', error);
		return [];
	}
}

// Function to get organization-specific positions
export async function getOrganizationPositions(orgId: string): Promise<Position[]> {
	try {
		const { data, error } = await supabase
			.from('positions')
			.select('*')
			.eq('organization_id', orgId)
			.order('name');

		if (error) {
			console.error('Error fetching positions:', error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error('Unexpected error in getOrganizationPositions:', error);
		return [];
	}
}

// Function to get organization-specific position details
export async function getOrganizationPositionDetails(orgId: string): Promise<PositionDetail[]> {
	try {
		const { data, error } = await supabase
			.from('position_details')
			.select('*')
			.eq('organization_id', orgId)
			.order('level');

		if (error) {
			console.error('Error fetching position details:', error);
			return [];
		}

		return data || [];
	} catch (error) {
		console.error('Unexpected error in getOrganizationPositionDetails:', error);
		return [];
	}
}

// Function to get all organization career data at once
export async function getOrganizationCareerData(orgId: string) {
	try {
		// Fetch all data in parallel for efficiency
		const [organization, careerPaths, positions, positionDetails] = await Promise.all([
			getOrganization(orgId),
			getOrganizationPaths(orgId),
			getOrganizationPositions(orgId),
			getOrganizationPositionDetails(orgId)
		]);

		return {
			organization,
			careerPaths,
			positions,
			positionDetails
		};
	} catch (error) {
		console.error('Unexpected error in getOrganizationCareerData:', error);
		return {
			organization: null,
			careerPaths: [],
			positions: [],
			positionDetails: []
		};
	}
}