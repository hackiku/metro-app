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

  // NEW PROCEDURE: Get user competences
  getUserCompetences: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      // First try to get real competences from the database
      try {
        const { data, error } = await supabase
          .from('user_competences')
          .select(`
            id,
            current_level,
            target_level,
            competences:competence_id(id, name, category)
          `)
          .eq('user_id', input.userId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Return properly formatted competences
          return data.map(comp => ({
            id: comp.id,
            name: comp.competences?.name || 'Unknown Skill',
            category: comp.competences?.category || 'technical',
            current_level: comp.current_level,
            target_level: comp.target_level
          }));
        }
      } catch (err) {
        console.log("Error fetching competences:", err);
        // Continue to fallback data
      }
      
      // Fallback: Return mock competences data
      return [
        { 
          id: '1', 
          name: 'Technical Expertise', 
          category: 'technical',
          current_level: 75, 
          target_level: 90 
        },
        { 
          id: '2', 
          name: 'Leadership', 
          category: 'leadership',
          current_level: 58, 
          target_level: 80 
        },
        { 
          id: '3', 
          name: 'Communication', 
          category: 'soft',
          current_level: 82, 
          target_level: 90 
        },
        { 
          id: '4', 
          name: 'Domain Knowledge', 
          category: 'domain',
          current_level: 68, 
          target_level: 85
        },
      ];
    }),

  // Create a new user
  create: publicProcedure
    .input(z.object({
      email: z.string().email(),
      full_name: z.string().min(1),
      current_job_family_id: z.string().optional().nullable(),
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
      current_job_family_id: z.string().optional().nullable(),
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