// src/server/api/routers/learning.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const learningRouter = createTRPCRouter({
  // Get all learning resources for an organization
  getAll: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('organization_id', input.organizationId)
        .order('title');
        
      if (error) throw new Error(`Error fetching learning resources: ${error.message}`);
      return data || [];
    }),
    
  // Get a specific learning resource by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('id', input.id)
        .single();
        
      if (error) throw new Error(`Error fetching learning resource: ${error.message}`);
      return data;
    }),
    
  // Create a new learning resource
  create: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      url: z.string().url().optional().nullable(),
      type: z.string().min(1),
      source: z.string().optional().nullable(),
      estimatedDuration: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const newResource = {
        organization_id: input.organizationId,
        title: input.title,
        description: input.description,
        url: input.url,
        type: input.type,
        source: input.source,
        estimated_duration: input.estimatedDuration
      };
      
      const { data, error } = await supabase
        .from('learning_resources')
        .insert(newResource)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating learning resource: ${error.message}`);
      return data;
    }),
    
  // Update an existing learning resource
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      url: z.string().url().optional().nullable(),
      type: z.string().min(1).optional(),
      source: z.string().optional().nullable(),
      estimatedDuration: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Transform the input to match database column names
      const dbUpdateData = {
        ...(updateData.title !== undefined && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.url !== undefined && { url: updateData.url }),
        ...(updateData.type !== undefined && { type: updateData.type }),
        ...(updateData.source !== undefined && { source: updateData.source }),
        ...(updateData.estimatedDuration !== undefined && { estimated_duration: updateData.estimatedDuration })
      };
      
      const { data, error } = await supabase
        .from('learning_resources')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating learning resource: ${error.message}`);
      return data;
    }),
    
  // Delete a learning resource
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting learning resource: ${error.message}`);
      return { success: true, id: input.id };
    }),

  // Get all development activities
  getDevelopmentActivities: publicProcedure
    .input(z.object({ competenceId: z.string().optional() }))
    .query(async ({ input }) => {
      let query = supabase
        .from('development_activities')
        .select('*');
      
      if (input.competenceId) {
        query = query.eq('competence_id', input.competenceId);
      }
      
      const { data, error } = await query;
        
      if (error) throw new Error(`Error fetching development activities: ${error.message}`);
      return data || [];
    }),
});