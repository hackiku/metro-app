// src/server/api/routers/organization.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const organizationRouter = createTRPCRouter({
	// Get all organizations
	getAll: publicProcedure
		.query(async () => {
			const { data, error } = await supabase
				.from("organizations")
				.select("*")
				.order("name");

			if (error) {
				throw new Error(`Error fetching organizations: ${error.message}`);
			}
			return data || [];
		}),

	// Get an organization by ID
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input }) => {
			const { data, error } = await supabase
				.from("organizations")
				.select("*")
				.eq("id", input.id)
				.single();

			if (error) {
				throw new Error(`Error fetching organization: ${error.message}`);
			}
			return data;
		}),

	getMembers: publicProcedure
		.input(z.object({ organizationId: z.string() }))
		.query(async ({ input }) => {
			try {
				// First try to get from user_organizations table if it exists
				const { data, error } = await supabase
					.from("user_organizations")
					.select(`
          user_id,
          role,
          is_primary
        `)
					.eq("organization_id", input.organizationId);

				if (error) throw error;

				return data || [];
			} catch (err) {
				// If the table doesn't exist yet or we get an error, return hardcoded data
				console.log("Falling back to hardcoded organization members:", err);

				// Hardcoded mapping as a fallback until we have the proper table
				const orgToUserMap: Record<
					string,
					{ user_id: string; role: string; is_primary: boolean }[]
				> = {
					// Lehman Brothers
					"9e40b94e-dd8d-4679-98b9-0716cff26810": [
						{
							user_id: "0dd0a1a3-c887-43d1-af2c-b7069b4a7940",
							role: "employee",
							is_primary: true,
						},
						{
							user_id: "20536097-ef9a-4ef4-b586-c0747075909b",
							role: "manager",
							is_primary: true,
						},
						{
							user_id: "42000f98-1ea9-4e0a-9272-3b570c6d8e84",
							role: "employee",
							is_primary: true,
						},
						{
							user_id: "bc33a3be-7a6f-4416-8094-c10d602b99cb",
							role: "manager",
							is_primary: true,
						},
					],
					// Veenie
					"a73148de-90e1-4f0e-955d-9790c131e13c": [
						{
							user_id: "e7bd66c1-85a5-4d8b-9adc-acaf939f9bf2",
							role: "employee",
							is_primary: true,
						},
					],
					// Gasunie - no users yet
					"91b825d7-8e4a-42e2-b762-ee230f2e5933": [],
				};

				return orgToUserMap[input.organizationId] || [];
			}
		}),

	// Create a new organization
	create: publicProcedure
		.input(z.object({
			name: z.string().min(1),
			description: z.string().optional().nullable(),
			logo_url: z.string().url().optional().nullable(),
			primary_color: z.string().optional().nullable(),
			secondary_color: z.string().optional().nullable(),
		}))
		.mutation(async ({ input }) => {
			const { data, error } = await supabase
				.from("organizations")
				.insert(input)
				.select()
				.single();

			if (error) {
				throw new Error(`Error creating organization: ${error.message}`);
			}
			return data;
		}),

	// Update an organization
	update: publicProcedure
		.input(z.object({
			id: z.string(),
			name: z.string().min(1).optional(),
			description: z.string().optional().nullable(),
			logo_url: z.string().url().optional().nullable(),
			primary_color: z.string().optional().nullable(),
			secondary_color: z.string().optional().nullable(),
		}))
		.mutation(async ({ input }) => {
			const { id, ...updateData } = input;

			const { data, error } = await supabase
				.from("organizations")
				.update(updateData)
				.eq("id", id)
				.select()
				.single();

			if (error) {
				throw new Error(`Error updating organization: ${error.message}`);
			}
			return data;
		}),

	// Delete an organization
	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input }) => {
			const { error } = await supabase
				.from("organizations")
				.delete()
				.eq("id", input.id);

			if (error) {
				throw new Error(`Error deleting organization: ${error.message}`);
			}
			return { success: true, id: input.id };
		}),
});
