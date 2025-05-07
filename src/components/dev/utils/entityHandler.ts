// src/components/dev/utils/entityHandlers.ts
import { api } from "~/trpc/react";

// Entity-specific CRUD operations
export const entityHandlers = {
  user: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.user.update.mutate(data);
      utils.user.getAll.invalidate();
      utils.user.getById.invalidate({ id: data.id });
      return result;
    }
  },
  
  organization: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.organization.update.mutate(data);
      utils.organization.getAll.invalidate();
      utils.organization.getById.invalidate({ id: data.id });
      return result;
    }
  },
  
  position: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.position.update.mutate(data);
      utils.position.getAll.invalidate();
      return result;
    }
  },
  
  competence: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.competence.update.mutate(data);
      utils.competence.getAll.invalidate();
      return result;
    }
  },
  
  career_path: {
    update: async (data: Record<string, any>, utils: ReturnType<typeof api.useUtils>) => {
      const result = await api.career.updatePath.mutate(data);
      utils.career.getPaths.invalidate();
      return result;
    }
  }
};

// Get entity-specific field categories
export const getEntityCategories = (entityType: string): Record<string, string[]> => {
  const categories: Record<string, Record<string, string[]>> = {
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
      primary: ['id', 'name', 'base_description'],
      relations: ['organization_id'],
      metadata: ['created_at']
    },
    competence: {
      primary: ['id', 'name', 'description'],
      details: ['category'],
      relations: ['organization_id'],
      metadata: ['created_at']
    },
    career_path: {
      primary: ['id', 'name', 'description'],
      details: ['color'],
      relations: ['organization_id'],
      metadata: ['created_at']
    }
  };
  
  return categories[entityType] || {};
};

