// src/server/api/routers/careerplan.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const careerPlanRouter = createTRPCRouter({
  // Get all career plans for a user in an organization
  getUserPlans: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      organizationId: z.string() 
    }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('user_career_plans')
        .select(`
          id, status, estimated_total_duration, notes, created_at, updated_at,
          target_position_details:target_position_details_id (
            id,
            positions:position_id (id, name),
            career_paths:career_path_id (id, name, color)
          )
        `)
        .eq('user_id', input.userId)
        .eq('organization_id', input.organizationId)
        .order('updated_at', { ascending: false });
        
      if (error) throw new Error(`Error fetching user career plans: ${error.message}`);
      return data || [];
    }),
    
  // Get a specific career plan by ID
  getPlanById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('user_career_plans')
        .select(`
          id, user_id, organization_id, status, estimated_total_duration, notes, created_at, updated_at,
          target_position_details:target_position_details_id (
            id,
            positions:position_id (id, name),
            career_paths:career_path_id (id, name, color)
          )
        `)
        .eq('id', input.id)
        .single();
        
      if (error) throw new Error(`Error fetching career plan: ${error.message}`);
      
      // Fetch plan phases
      const { data: phases, error: phasesError } = await supabase
        .from('plan_phases')
        .select('id, title, description, sequence, duration, created_at')
        .eq('plan_id', input.id)
        .order('sequence');
        
      if (phasesError) throw new Error(`Error fetching plan phases: ${phasesError.message}`);
      
      // For each phase, fetch its actions
      const phasesWithActions = await Promise.all(
        (phases || []).map(async (phase) => {
          const { data: actions, error: actionsError } = await supabase
            .from('plan_actions')
            .select('id, title, description, category, status, due_date, created_at, updated_at')
            .eq('phase_id', phase.id)
            .order('due_date');
            
          if (actionsError) throw new Error(`Error fetching phase actions: ${actionsError.message}`);
          
          return {
            ...phase,
            actions: actions || []
          };
        })
      );
      
      return {
        ...data,
        phases: phasesWithActions
      };
    }),
    
  // Create a new career plan
  createPlan: publicProcedure
    .input(z.object({
      userId: z.string(),
      organizationId: z.string(),
      targetPositionDetailsId: z.string(),
      status: z.enum(['active', 'completed', 'archived']).default('active'),
      estimatedTotalDuration: z.string().optional().nullable(),
      notes: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const newPlan = {
        user_id: input.userId,
        organization_id: input.organizationId,
        target_position_details_id: input.targetPositionDetailsId,
        status: input.status,
        estimated_total_duration: input.estimatedTotalDuration,
        notes: input.notes
      };
      
      const { data, error } = await supabase
        .from('user_career_plans')
        .insert(newPlan)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating career plan: ${error.message}`);
      return data;
    }),
    
  // Update an existing career plan
  updatePlan: publicProcedure
    .input(z.object({
      id: z.string(),
      targetPositionDetailsId: z.string().optional(),
      status: z.enum(['active', 'completed', 'archived']).optional(),
      estimatedTotalDuration: z.string().optional().nullable(),
      notes: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Transform the input to match database column names
      const dbUpdateData = {
        ...(updateData.targetPositionDetailsId && { target_position_details_id: updateData.targetPositionDetailsId }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.estimatedTotalDuration !== undefined && { estimated_total_duration: updateData.estimatedTotalDuration }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_career_plans')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating career plan: ${error.message}`);
      return data;
    }),
    
  // Delete a career plan
  deletePlan: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('user_career_plans')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting career plan: ${error.message}`);
      return { success: true, id: input.id };
    }),
    
  // Create a new phase for a plan
  createPhase: publicProcedure
    .input(z.object({
      planId: z.string(),
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      sequence: z.number().int().positive(),
      duration: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const newPhase = {
        plan_id: input.planId,
        title: input.title,
        description: input.description,
        sequence: input.sequence,
        duration: input.duration
      };
      
      const { data, error } = await supabase
        .from('plan_phases')
        .insert(newPhase)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating plan phase: ${error.message}`);
      return data;
    }),
    
  // Update an existing phase
  updatePhase: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      sequence: z.number().int().positive().optional(),
      duration: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('plan_phases')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating plan phase: ${error.message}`);
      return data;
    }),
    
  // Delete a phase
  deletePhase: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('plan_phases')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting plan phase: ${error.message}`);
      return { success: true, id: input.id };
    }),
    
  // Create a new action for a phase
  createAction: publicProcedure
    .input(z.object({
      phaseId: z.string(),
      title: z.string().min(1),
      description: z.string().optional().nullable(),
      category: z.string().min(1),
      status: z.enum(['todo', 'in-progress', 'completed']).default('todo'),
      dueDate: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const newAction = {
        phase_id: input.phaseId,
        title: input.title,
        description: input.description,
        category: input.category,
        status: input.status,
        due_date: input.dueDate
      };
      
      const { data, error } = await supabase
        .from('plan_actions')
        .insert(newAction)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating plan action: ${error.message}`);
      return data;
    }),
    
  // Update an existing action
  updateAction: publicProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      category: z.string().min(1).optional(),
      status: z.enum(['todo', 'in-progress', 'completed']).optional(),
      dueDate: z.string().optional().nullable()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // Transform the input to match database column names
      const dbUpdateData = {
        ...(updateData.title !== undefined && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.category !== undefined && { category: updateData.category }),
        ...(updateData.status !== undefined && { status: updateData.status }),
        ...(updateData.dueDate !== undefined && { due_date: updateData.dueDate }),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('plan_actions')
        .update(dbUpdateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating plan action: ${error.message}`);
      return data;
    }),
    
  // Delete an action
  deleteAction: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('plan_actions')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting plan action: ${error.message}`);
      return { success: true, id: input.id };
    })
});