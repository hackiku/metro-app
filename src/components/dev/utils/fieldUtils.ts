// src/components/dev/utils/fieldUtils.ts
// Field configuration utility functions

// Get field configuration based on field name and value
export const getFieldConfig = (field: string, value: any, entityType?: string) => {
  let config = {
    type: 'string' as const,
    editable: true,
    options: undefined as string[] | undefined
  };

  // Determine type based on value
  if (typeof value === 'number') {
    config.type = 'number';
  } else if (typeof value === 'boolean') {
    config.type = 'boolean';
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    config.type = 'object';
  } else if (Array.isArray(value)) {
    config.type = 'array';
  }

  // Specific field configurations based on common field names
  if (field === 'id' || field.endsWith('_id') || field === 'created_at' || field === 'updated_at') {
    config.editable = false;
  }

  // Long text fields should use textarea
  if (typeof value === 'string' && value.length > 100) {
    config.type = 'textarea';
  }

  // Field-specific configurations
  if (field === 'description' || field.includes('description')) {
    config.type = 'textarea';
  }

  if (field === 'status') {
    config.type = 'select';
    config.options = ['active', 'inactive', 'pending', 'completed', 'archived'];
  }

  if (field === 'level' && typeof value === 'number') {
    config.type = 'select';
    config.options = ['1', '2', '3', '4', '5'];
  }

  if (field === 'color' && typeof value === 'string') {
    config.type = 'string';
    // Add color picker in the future
  }

  // Entity-specific configurations
  if (entityType === 'user') {
    if (field === 'role') {
      config.type = 'select';
      config.options = ['employee', 'manager', 'admin'];
    }

    if (field === 'level' && typeof value === 'string') {
      config.type = 'select';
      config.options = ['Junior', 'Medior', 'Senior', 'Lead'];
    }
  }

  return config;
};

// Format field label from snake_case to Title Case
export const formatFieldLabel = (field: string): string => {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Render an object or array as string for display
export const formatComplexValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'null';
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `Array (${value.length} items)`;
    }
    
    if (value.name) {
      return value.name;
    }
    
    return `Object (${Object.keys(value).length} properties)`;
  }
  
  return String(value);
};

// Get the display title for an entity category
export const getCategoryTitle = (category: string): string => {
  const titles: Record<string, string> = {
    primary: 'Primary Information',
    details: 'Details',
    relations: 'Relations',
    metadata: 'Metadata'
  };
  
  return titles[category] || category;
};

// Update changed fields only for an entity
export const getChangedFields = (
  original: Record<string, any>, 
  modified: Record<string, any>
): Record<string, any> => {
  const changes: Record<string, any> = {};
  
  Object.keys(modified).forEach(key => {
    // Only include fields that have changed
    if (JSON.stringify(original[key]) !== JSON.stringify(modified[key])) {
      changes[key] = modified[key];
    }
  });
  
  return changes;
};