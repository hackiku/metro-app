// src/server/api/routers/competence.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/db/supabase";

export const competenceRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const { data } = await supabase
        .from('competences')
        .select('*')
        .eq('organization_id', input.organizationId);
      return data || [];
    }),
  
  // Add additional procedures as needed
});
