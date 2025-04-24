// src/server/api/routers/positions.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const positionRouter = createTRPCRouter({
  // Get all positions for an organization
  getAll: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('organization_id', input.organizationId);
        
      if (error) throw new Error(`Error fetching positions: ${error.message}`);
      return data || [];
    }),
  
  // Get positions for a specific career path
  getByCareerPath: publicProcedure
    .input(z.object({ 
      organizationId: z.string(),
      careerPathId: z.string()
    }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('position_details')
        .select(`
          id,
          level,
          sequence_in_path,
          path_specific_description,
          positions:position_id(id, name, base_description)
        `)
        .eq('organization_id', input.organizationId)
        .eq('career_path_id', input.careerPathId)
        .order('level');
        
      if (error) throw new Error(`Error fetching positions for career path: ${error.message}`);
      return data || [];
    }),
  

	  getAllPathsPositions: publicProcedure
    .input(z.object({ 
      organizationId: z.string(),
      pathIds: z.array(z.string())
    }))
    .query(async ({ input }) => {
      if (input.pathIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('position_details')
        .select(`
          id,
          level,
          sequence_in_path,
          path_specific_description,
          career_path_id,
          positions:position_id(id, name, base_description)
        `)
        .eq('organization_id', input.organizationId)
        .in('career_path_id', input.pathIds)
        .order('level');
        
      if (error) throw new Error(`Error fetching positions for paths: ${error.message}`);
      return data || [];
    }),
  // Create a new position
  create: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      name: z.string().min(1),
      baseDescription: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const newPosition = {
        organization_id: input.organizationId,
        name: input.name,
        base_description: input.baseDescription
      };
      
      const { data, error } = await supabase
        .from('positions')
        .insert(newPosition)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating position: ${error.message}`);
      return data;
    }),
    
  // Update an existing position
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      baseDescription: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Transform the input to match database column names
      const dbUpdateData = {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.baseDescription !== undefined && { base_description: updateData.baseDescription })
      };
      
      const { data, error } = await supabase
        .from('positions')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating position: ${error.message}`);
      return data;
    }),
    
  // Delete a position
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting position: ${error.message}`);
      return { success: true, id: input.id };
    }),
    
  // Assign a position to a career path (creates position_detail)
  assignToPath: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      positionId: z.string(),
      careerPathId: z.string(),
      level: z.number().int().positive(),
      sequenceInPath: z.number().int().positive().optional(),
      pathSpecificDescription: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const positionDetail = {
        organization_id: input.organizationId,
        position_id: input.positionId,
        career_path_id: input.careerPathId,
        level: input.level,
        sequence_in_path: input.sequenceInPath || input.level,
        path_specific_description: input.pathSpecificDescription
      };
      
      const { data, error } = await supabase
        .from('position_details')
        .insert(positionDetail)
        .select()
        .single();
      
      if (error) throw new Error(`Error assigning position to path: ${error.message}`);
      return data;
    }),
    
  // Update a position detail (positioning within a career path)
  updatePositionDetail: publicProcedure
    .input(z.object({
      id: z.string(),
      level: z.number().int().positive().optional(),
      sequenceInPath: z.number().int().positive().optional(),
      pathSpecificDescription: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Transform the input to match database column names
      const dbUpdateData = {
        ...(updateData.level && { level: updateData.level }),
        ...(updateData.sequenceInPath && { sequence_in_path: updateData.sequenceInPath }),
        ...(updateData.pathSpecificDescription !== undefined && { 
          path_specific_description: updateData.pathSpecificDescription 
        })
      };
      
      const { data, error } = await supabase
        .from('position_details')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating position detail: ${error.message}`);
      return data;
    }),
    
  // Remove a position from a career path
  removeFromPath: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('position_details')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error removing position from path: ${error.message}`);
      return { success: true, id: input.id };
    })
});