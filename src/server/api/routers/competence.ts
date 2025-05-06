// src/server/api/routers/competence.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const competenceRouter = createTRPCRouter({
  // Get all competences for an organization
  getAll: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('competences')
        .select('*')
        .eq('organization_id', input.organizationId)
        .order('name');
        
      if (error) throw new Error(`Error fetching competences: ${error.message}`);
      return data || [];
    }),

  // Get a specific competence by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('competences')
        .select('*')
        .eq('id', input.id)
        .single();
        
      if (error) throw new Error(`Error fetching competence: ${error.message}`);
      return data;
    }),
    
  // Create a new competence
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
      organizationId: z.string()
    }))
    .mutation(async ({ input }) => {
      const newCompetence = {
        name: input.name,
        description: input.description,
        category: input.category,
        organization_id: input.organizationId
      };
      
      const { data, error } = await supabase
        .from('competences')
        .insert(newCompetence)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating competence: ${error.message}`);
      return data;
    }),
    
  // Update an existing competence
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      category: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('competences')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating competence: ${error.message}`);
      return data;
    }),
    
  // Delete a competence
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('competences')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting competence: ${error.message}`);
      return { success: true, id: input.id };
    }),

  // Get competences for a specific position detail
  getForPositionDetail: publicProcedure
    .input(z.object({ positionDetailId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('position_detail_competences')
        .select(`
          id, required_level, importance_level,
          competence:competence_id (id, name, description, category)
        `)
        .eq('position_details_id', input.positionDetailId);
        
      if (error) throw new Error(`Error fetching position competences: ${error.message}`);
      return data || [];
    }),

  // Associate a competence with a position detail
  addToPosition: publicProcedure
    .input(z.object({
      positionDetailId: z.string(),
      competenceId: z.string(),
      requiredLevel: z.number().min(0).max(5),
      importanceLevel: z.number().min(1).max(5).optional().nullable(),
      organizationId: z.string()
    }))
    .mutation(async ({ input }) => {
      const newAssociation = {
        position_details_id: input.positionDetailId,
        competence_id: input.competenceId,
        required_level: input.requiredLevel,
        importance_level: input.importanceLevel,
        organization_id: input.organizationId
      };
      
      const { data, error } = await supabase
        .from('position_detail_competences')
        .insert(newAssociation)
        .select()
        .single();
      
      if (error) throw new Error(`Error associating competence with position: ${error.message}`);
      return data;
    }),

  // Update a position competence association
  updatePositionCompetence: publicProcedure
    .input(z.object({
      id: z.string(),
      requiredLevel: z.number().min(0).max(5).optional(),
      importanceLevel: z.number().min(1).max(5).optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Transform the input to match database column names
      const dbUpdateData = {
        ...(updateData.requiredLevel !== undefined && { required_level: updateData.requiredLevel }),
        ...(updateData.importanceLevel !== undefined && { importance_level: updateData.importanceLevel })
      };
      
      const { data, error } = await supabase
        .from('position_detail_competences')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating position competence: ${error.message}`);
      return data;
    }),

  // Remove a competence from a position
  removeFromPosition: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('position_detail_competences')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error removing competence from position: ${error.message}`);
      return { success: true, id: input.id };
    })
});