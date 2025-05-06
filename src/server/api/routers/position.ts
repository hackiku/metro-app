// src/server/api/routers/position.ts

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
    
  getPositionDetailById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('position_details')
        .select(`
          id,
          level,
          sequence_in_path,
          path_specific_description,
          work_focus,
          team_interaction,
          work_style,
          position_id,
          career_path_id,
          organization_id,
          positions:position_id(id, name, base_description),
          career_paths:career_path_id(id, name, color)
        `)
        .eq('id', input.id)
        .single();
        
      if (error) throw new Error(`Error fetching position detail: ${error.message}`);
      return data;
    }),

  // Get all position details for an organization
  getAllDetails: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('position_details')
        .select(`
          id,
          level,
          sequence_in_path,
          path_specific_description,
          work_focus,
          team_interaction,
          work_style,
          career_path_id,
          position_id,
          organization_id,
          positions:position_id(id, name, base_description),
          career_paths:career_path_id(id, name, color)
        `)
        .eq('organization_id', input.organizationId);
        
      if (error) throw new Error(`Error fetching position details: ${error.message}`);
      return data || [];
    }),

  // Get competences for a position detail
  getPositionCompetences: publicProcedure
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

  // Add a competence to a position detail
  addCompetenceToPosition: publicProcedure
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
      
      if (error) throw new Error(`Error adding competence to position: ${error.message}`);
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
  removeCompetenceFromPosition: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('position_detail_competences')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error removing competence from position: ${error.message}`);
      return { success: true, id: input.id };
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
      pathSpecificDescription: z.string().optional().nullable(),
      workFocus: z.string().optional().nullable(),
      teamInteraction: z.string().optional().nullable(),
      workStyle: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const positionDetail = {
        organization_id: input.organizationId,
        position_id: input.positionId,
        career_path_id: input.careerPathId,
        level: input.level,
        sequence_in_path: input.sequenceInPath || input.level,
        path_specific_description: input.pathSpecificDescription,
        work_focus: input.workFocus,
        team_interaction: input.teamInteraction,
        work_style: input.workStyle
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
      pathSpecificDescription: z.string().optional().nullable(),
      workFocus: z.string().optional().nullable(),
      teamInteraction: z.string().optional().nullable(),
      workStyle: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Transform the input to match database column names
      const dbUpdateData = {
        ...(updateData.level && { level: updateData.level }),
        ...(updateData.sequenceInPath && { sequence_in_path: updateData.sequenceInPath }),
        ...(updateData.pathSpecificDescription !== undefined && { 
          path_specific_description: updateData.pathSpecificDescription 
        }),
        ...(updateData.workFocus !== undefined && { work_focus: updateData.workFocus }),
        ...(updateData.teamInteraction !== undefined && { team_interaction: updateData.teamInteraction }),
        ...(updateData.workStyle !== undefined && { work_style: updateData.workStyle })
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
    }),

  // Find similar positions (based on competences)
  findSimilarPositions: publicProcedure
    .input(z.object({ 
      positionDetailId: z.string(),
      organizationId: z.string(),
      limit: z.number().min(1).max(20).default(5)
    }))
    .query(async ({ input }) => {
      // First, get the competences for the source position
      const { data: sourceCompetences, error: sourceError } = await supabase
        .from('position_detail_competences')
        .select(`
          competence_id, required_level
        `)
        .eq('position_details_id', input.positionDetailId);
        
      if (sourceError) throw new Error(`Error fetching source position competences: ${sourceError.message}`);
      
      if (!sourceCompetences || sourceCompetences.length === 0) {
        return []; // No competences to compare
      }
      
      // Get the position detail info to exclude from results
      const { data: sourcePosition, error: posError } = await supabase
        .from('position_details')
        .select('id, career_path_id')
        .eq('id', input.positionDetailId)
        .single();
        
      if (posError) throw new Error(`Error fetching source position: ${posError.message}`);
      
      // Get all position details in the organization
      const { data: positions, error: positionsError } = await supabase
        .from('position_details')
        .select(`
          id, 
          level,
          position:position_id (id, name),
          career_path:career_path_id (id, name, color)
        `)
        .eq('organization_id', input.organizationId)
        .neq('id', input.positionDetailId); // Exclude the source position
        
      if (positionsError) throw new Error(`Error fetching positions: ${positionsError.message}`);
      
      if (!positions || positions.length === 0) {
        return []; // No other positions to compare
      }
      
      // For each position, get its competences and calculate similarity
      const positionsWithSimilarity = await Promise.all(
        positions.map(async (position) => {
          const { data: competences, error: compError } = await supabase
            .from('position_detail_competences')
            .select(`
              competence_id, required_level
            `)
            .eq('position_details_id', position.id);
            
          if (compError) {
            console.error(`Error fetching competences for position ${position.id}: ${compError.message}`);
            return { ...position, similarity: 0 };
          }
          
          if (!competences || competences.length === 0) {
            return { ...position, similarity: 0 };
          }
          
          // Create maps for quick lookup
          const sourceCompMap = new Map(
            sourceCompetences.map(sc => [sc.competence_id, sc.required_level])
          );
          
          const targetCompMap = new Map(
            competences.map(tc => [tc.competence_id, tc.required_level])
          );
          
          // Calculate similarity score
          let matchingCompetences = 0;
          let levelDifferenceSum = 0;
          
          // Count competences that exist in both positions
          for (const [compId, srcLevel] of sourceCompMap.entries()) {
            if (targetCompMap.has(compId)) {
              matchingCompetences++;
              const targetLevel = targetCompMap.get(compId)!;
              levelDifferenceSum += Math.abs(srcLevel - targetLevel);
            }
          }
          
          // Calculate similarity metrics
          const totalCompetences = new Set([
            ...sourceCompMap.keys(), 
            ...targetCompMap.keys()
          ]).size;
          
          const overlapRatio = totalCompetences > 0 ? 
            matchingCompetences / totalCompetences : 0;
            
          const levelSimilarity = matchingCompetences > 0 ? 
            1 - (levelDifferenceSum / (matchingCompetences * 5)) : 0;
            
          // Final similarity score (weighted combination)
          const similarity = (overlapRatio * 0.7) + (levelSimilarity * 0.3);
          
          return { 
            ...position, 
            similarity: Math.round(similarity * 100) / 100,
            matchingCompetences,
            totalCompetences,
            samePath: position.career_path?.id === sourcePosition.career_path_id
          };
        })
      );
      
      // Sort by similarity and take the top N
      return positionsWithSimilarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, input.limit);
    })
});