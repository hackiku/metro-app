// src/app/organization/services/orgDataService.ts
import { gasunieClient } from "~/server/db/supabase"; // Use the gasunie specific client

// Type for the data row fetched from the organization_data table
export interface OrgDataRow {
	id: string;
	report_year: number;
	area: string;
	sub_area: string | null;
	key_metrics: Record<string, any> | null;
	initiatives_policies: Record<string, any> | null;
	performance_notes: Record<string, any> | null;
	status_indicator: string | null;
	comparison_year: number | null;
	data_source: string | null;
	last_updated_at: string;
}

/**
 * Fetches all organization data entries for a specific report year.
 * @param year The report year to fetch data for.
 * @returns Promise<OrgDataRow[]> An array of organization data rows.
 */
export async function fetchOrgData(year: number): Promise<OrgDataRow[]> {
	try {
		console.log(`Fetching Organization data for year: ${year}`);
		const { data, error } = await gasunieClient
			.from('organization_data') // Table name
			.select('*')
			.eq('report_year', year)
			.order('id', { ascending: true }); // Order predictably, e.g., by insertion order/ID

		if (error) {
			console.error('Error fetching Organization data:', error.message);
			throw error;
		}

		console.log(`Successfully fetched ${data?.length ?? 0} Org data rows for ${year}.`);
		return (data as OrgDataRow[] | null) ?? [];

	} catch (error) {
		console.error('Error in fetchOrgData:', error);
		return []; // Return empty array on failure
	}
}