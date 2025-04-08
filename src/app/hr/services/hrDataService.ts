// src/app/hr/services/hrDataService.ts
import { gasunieClient } from "~/server/db/supabase"; // Use the gasunie specific client

// Define the type for the data row fetched from the database
// Based on the table structure we defined earlier
export interface HrDataRow {
    id: string;
    report_year: number;
    area: string;
    sub_area: string | null;
    key_metrics: Record<string, any> | null; // JSONB maps to Record<string, any> or a specific type if known
    initiatives_policies: Record<string, any> | null;
    performance_notes: Record<string, any> | null;
    status_indicator: string | null;
    comparison_year: number | null;
    data_source: string | null;
    last_updated_at: string;
}

/**
 * Fetches all HR data entries for a specific report year.
 * @param year The report year to fetch data for.
 * @returns Promise<HrDataRow[]> An array of HR data rows.
 */
export async function fetchHrData(year: number): Promise<HrDataRow[]> {
    try {
        console.log(`Fetching HR data for year: ${year}`);
        // Use the gasunieClient which defaults to the 'gasunie' schema
        const { data, error } = await gasunieClient
            .from('hr_data') // Table name
            .select('*')
            .eq('report_year', year)
            .order('area', { ascending: true }) // Optional: order by area for consistent display
            .order('sub_area', { ascending: true, nullsFirst: true }); // Order sub_area as well

        if (error) {
            console.error('Error fetching HR data:', error.message);
            throw error; // Re-throw the error to be caught by the caller
        }

        console.log(`Successfully fetched ${data?.length ?? 0} HR data rows for ${year}.`);

        // Ensure data is an array, default to empty array if null/undefined
        return (data as HrDataRow[] | null) ?? [];

    } catch (error) {
        console.error('Error in fetchHrData:', error);
        return []; // Return empty array on failure
    }
}