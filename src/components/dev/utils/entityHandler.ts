// src/components/dev/utils/entityHandler.ts
import { api } from "~/trpc/react";

// Entity-specific CRUD operations
export const entityHandlers = {
  user: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.user.update.mutate({
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        level: data.level,
        years_in_role: data.years_in_role,
        current_position_details_id: data.current_position_details_id
      });
      utils.user.getAll.invalidate();
      utils.user.getById.invalidate({ id: data.id });
      return result;
    }
  },
  
  organization: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.organization.update.mutate({
        id: data.id,
        name: data.name,
        description: data.description,
        logo_url: data.logo_url,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color
      });
      utils.organization.getAll.invalidate();
      utils.organization.getById.invalidate({ id: data.id });
      return result;
    }
  },
  
  position: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.position.updatePositionDetail.mutate({
        id: data.id,
        level: data.level,
        sequenceInPath: data.sequence_in_path,
        pathSpecificDescription: data.path_specific_description,
        workFocus: data.work_focus,
        teamInteraction: data.team_interaction,
        workStyle: data.work_style
      });
      utils.position.getPositionDetailById.invalidate({ id: data.id });
      utils.position.getAllDetails.invalidate();
      return result;
    }
  },
  
  competence: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.user.updateUserCompetence.mutate({
        userId: data.user_id,
        competenceId: data.competence.id,
        currentLevel: data.current_level,
        targetLevel: data.target_level
      });
      utils.user.getUserCompetences.invalidate({ userId: data.user_id });
      return result;
    }
  },
  
  career_path: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.careerPlan.updatePlan.mutate({
        id: data.id,
        status: data.status,
        estimatedTotalDuration: data.estimated_total_duration,
        notes: data.notes
      });
      utils.careerPlan.getPlanById.invalidate({ id: data.id });
      utils.careerPlan.getUserPlans.invalidate();
      return result;
    }
  }
};

// Map of field categories for each entity type
export const entityFieldCategories = {
  user: {
    primary: ['id', 'full_name', 'email'],
    details: ['level', 'role', 'years_in_role'],
    relations: ['current_position_details_id'],
    metadata: ['created_at']
  },
  organization: {
    primary: ['id', 'name', 'description'],
    details: ['primary_color', 'secondary_color', 'logo_url'],
    metadata: ['created_at']
  },
  position: {
    primary: ['id', 'level', 'path_specific_description'],
    details: ['work_focus', 'team_interaction', 'work_style'],
    relations: ['career_path_id', 'position_id'],
    metadata: ['created_at', 'sequence_in_path']
  },
  competence: {
    primary: ['id', 'current_level', 'target_level'],
    details: ['competence.category', 'last_assessed_at'],
    relations: ['competence.id', 'user_id']
  },
  career_path: {
    primary: ['id', 'status', 'estimated_total_duration'],
    details: ['notes', 'updated_at'],
    relations: ['target_position_details_id', 'user_id', 'organization_id'],
    metadata: ['created_at']
  }
};