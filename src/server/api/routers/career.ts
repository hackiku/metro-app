// src/server/api/routers/career.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";
import type { CareerPath } from "~/types/compass";

export const careerRouter = createTRPCRouter({
  // Get all career paths for an organization
  getPaths: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .eq('organization_id', input.organizationId);
        
      if (error) throw new Error(`Error fetching career paths: ${error.message}`);
      return data || [];
    }),
    
  // Get a specific career path by ID
  getPathById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .eq('id', input.id)
        .single();
        
      if (error) throw new Error(`Error fetching career path: ${error.message}`);
      return data;
    }),
    
  // Create a new career path
  createPath: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      color: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const newPath = {
        organization_id: input.organizationId,
        name: input.name,
        description: input.description,
        color: input.color || '#4299E1' // Default color
      };
      
      const { data, error } = await supabase
        .from('career_paths')
        .insert(newPath)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating career path: ${error.message}`);
      return data;
    }),
    
  // Update an existing career path
  updatePath: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      color: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('career_paths')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating career path: ${error.message}`);
      return data;
    }),
    
  // Delete a career path
  deletePath: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('career_paths')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting career path: ${error.message}`);
      return { success: true, id: input.id };
    })
});