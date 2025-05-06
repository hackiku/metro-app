// src/server/api/routers/user.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const userRouter = createTRPCRouter({
  // Get all users
  getAll: publicProcedure
    .query(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name');
        
      if (error) throw new Error(`Error fetching users: ${error.message}`);

      // Add mock role data (in a real app, this would come from a user_roles table)
      const usersWithRoles = data?.map(user => ({
        ...user,
        role: user.email.includes('manager') ? 'manager' : 
              user.email.includes('admin') ? 'admin' : 'employee'
      })) || [];
      
      return usersWithRoles;
    }),

  // Get a user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', input.id)
        .single();
        
      if (error) throw new Error(`Error fetching user: ${error.message}`);
      
      // Add mock role data
      const userWithRole = {
        ...data,
        role: data.email.includes('manager') ? 'manager' : 
              data.email.includes('admin') ? 'admin' : 'employee'
      };
      
      return userWithRole;
    }),

  // Get user competences
  getUserCompetences: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('user_competences')
        .select(`
          id, current_level, target_level, last_assessed_at,
          competence:competence_id (id, name, description, category)
        `)
        .eq('user_id', input.userId);
        
      if (error) throw new Error(`Error fetching user competences: ${error.message}`);
      return data || [];
    }),

  // Add or update a user competence
  updateUserCompetence: publicProcedure
    .input(z.object({
      userId: z.string(),
      competenceId: z.string(),
      currentLevel: z.number().min(0).max(5),
      targetLevel: z.number().min(0).max(5).optional().nullable()
    }))
    .mutation(async ({ input }) => {
      // First check if this competence already exists for the user
      const { data: existingData } = await supabase
        .from('user_competences')
        .select('id')
        .eq('user_id', input.userId)
        .eq('competence_id', input.competenceId)
        .single();
      
      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_competences')
          .update({
            current_level: input.currentLevel,
            target_level: input.targetLevel,
            last_assessed_at: new Date().toISOString()
          })
          .eq('id', existingData.id)
          .select()
          .single();
        
        if (error) throw new Error(`Error updating user competence: ${error.message}`);
        return data;
      } else {
        // Create new record
        const newUserCompetence = {
          user_id: input.userId,
          competence_id: input.competenceId,
          current_level: input.currentLevel,
          target_level: input.targetLevel,
          last_assessed_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('user_competences')
          .insert(newUserCompetence)
          .select()
          .single();
        
        if (error) throw new Error(`Error creating user competence: ${error.message}`);
        return data;
      }
    }),

  // Delete a user competence
  deleteUserCompetence: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('user_competences')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting user competence: ${error.message}`);
      return { success: true, id: input.id };
    }),

  // Get user's current position details
  getUserPositionDetails: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('current_position_details_id')
        .eq('id', input.userId)
        .single();
        
      if (userError) throw new Error(`Error fetching user: ${userError.message}`);
      
      if (!userData?.current_position_details_id) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('position_details')
        .select(`
          id, level, path_specific_description,
          position:position_id (id, name, base_description),
          career_path:career_path_id (id, name, color)
        `)
        .eq('id', userData.current_position_details_id)
        .single();
        
      if (error) throw new Error(`Error fetching position details: ${error.message}`);
      return data;
    }),

  // Get user career plans
  getUserCareerPlans: publicProcedure
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
            position:position_id (id, name),
            career_path:career_path_id (id, name, color)
          )
        `)
        .eq('user_id', input.userId)
        .eq('organization_id', input.organizationId)
        .order('updated_at', { ascending: false });
        
      if (error) throw new Error(`Error fetching user career plans: ${error.message}`);
      return data || [];
    }),

  // Calculate competence gap between user and position
  getCompetenceGap: publicProcedure
    .input(z.object({ 
      userId: z.string(),
      positionDetailId: z.string() 
    }))
    .query(async ({ input }) => {
      // Get user competences
      const { data: userCompetences, error: userCompError } = await supabase
        .from('user_competences')
        .select(`
          id, current_level,
          competence:competence_id (id, name, category)
        `)
        .eq('user_id', input.userId);
        
      if (userCompError) throw new Error(`Error fetching user competences: ${userCompError.message}`);
      
      // Get position required competences
      const { data: positionCompetences, error: posCompError } = await supabase
        .from('position_detail_competences')
        .select(`
          id, required_level, importance_level,
          competence:competence_id (id, name, category)
        `)
        .eq('position_details_id', input.positionDetailId);
        
      if (posCompError) throw new Error(`Error fetching position competences: ${posCompError.message}`);
      
      // Map user competences for easy lookup
      const userCompMap = new Map(
        (userCompetences || []).map(uc => [
          uc.competence?.id, 
          { 
            id: uc.id, 
            currentLevel: uc.current_level, 
            name: uc.competence?.name,
            category: uc.competence?.category
          }
        ])
      );
      
      // Calculate gaps
      const gaps = (positionCompetences || []).map(pc => {
        const compId = pc.competence?.id;
        const userComp = compId ? userCompMap.get(compId) : undefined;
        
        return {
          competenceId: compId,
          name: pc.competence?.name || 'Unknown',
          category: pc.competence?.category || 'Unknown',
          requiredLevel: pc.required_level,
          importanceLevel: pc.importance_level || 3,
          currentLevel: userComp?.currentLevel || 0,
          gap: pc.required_level - (userComp?.currentLevel || 0),
          userCompetenceId: userComp?.id
        };
      });
      
      return {
        gaps,
        summary: {
          totalGap: gaps.reduce((sum, g) => sum + g.gap, 0),
          averageGap: gaps.length > 0 ? 
            gaps.reduce((sum, g) => sum + g.gap, 0) / gaps.length : 0,
          criticalGaps: gaps.filter(g => g.gap > 2 && g.importanceLevel >= 4).length,
          highestGap: Math.max(...gaps.map(g => g.gap)),
          gapsByCategory: gaps.reduce((acc, g) => {
            const cat = g.category || 'Unknown';
            acc[cat] = (acc[cat] || 0) + g.gap;
            return acc;
          }, {} as Record<string, number>)
        }
      };
    }),

  // Create a new user
  create: publicProcedure
    .input(z.object({
      email: z.string().email(),
      full_name: z.string().min(1),
      current_position_details_id: z.string().optional().nullable(),
      level: z.enum(['Junior', 'Medior', 'Senior', 'Lead']),
      years_in_role: z.number().min(0).max(99)
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from('users')
        .insert(input)
        .select()
        .single();
      
      if (error) throw new Error(`Error creating user: ${error.message}`);
      
      // Add mock role
      const userWithRole = {
        ...data,
        role: 'employee' as const
      };
      
      return userWithRole;
    }),

  // Update a user
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      email: z.string().email().optional(),
      full_name: z.string().min(1).optional(),
      current_position_details_id: z.string().optional().nullable(),
      level: z.enum(['Junior', 'Medior', 'Senior', 'Lead']).optional(),
      years_in_role: z.number().min(0).max(99).optional()
    }))
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Error updating user: ${error.message}`);
      
      // Add mock role
      const userWithRole = {
        ...data,
        role: data.email.includes('manager') ? 'manager' : 
              data.email.includes('admin') ? 'admin' : 'employee'
      };
      
      return userWithRole;
    }),

  // Delete a user
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', input.id);
      
      if (error) throw new Error(`Error deleting user: ${error.message}`);
      return { success: true, id: input.id };
    })
});