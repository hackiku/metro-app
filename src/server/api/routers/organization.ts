// src/server/api/routers/organization.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const organizationRouter = createTRPCRouter({
  // Get all organizations
  getAll: publicProcedure
    .query(async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name');
        
      if (error) throw new Error(`Error fetching organizations: ${error.message}`);
      return data || [];
    }),

  // Get an organization by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', input.id)
        .single();
        
      if (error) throw new Error(`Error fetching organization: ${error.message}`);
      return data;
    }),

  // Create a new organization
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      logo_url: z.string().url().optional().nullable(),
      primary_color: z.string().optional().nullable(),
      secondary_color: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert(input)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating organization: ${error.message}`);
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
      secondary_color: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating organization: ${error.message}`);
      return data;
    }),

  // Delete an organization
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting organization: ${error.message}`);
      return { success: true, id: input.id };
    })
});