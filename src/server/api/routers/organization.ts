// src/server/api/routers/organization.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const organizationRouter = createTRPCRouter({
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

  // Additional methods can be added here as needed:
  // createOrganization, updateOrganization, etc.
});