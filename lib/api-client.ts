const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

export interface Template {
  id: string;
  name: string;
  description?: string;
  fields?: Record<string, string>;
  prompt_content: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  company_id: string;
  description?: string;
  template_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PromptCondition {
  key: string;
  value: string;
  content: string;
}

// Tool Types - Field definition for headers and body fields
export interface ToolField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  fieldType: 'static' | 'ai_generated' | 'orchestrator';
  required: boolean;
  value?: any;
  aiInstruction?: string;
  orchestratorVar?: string;
}

// Header definition
export interface ToolHeader {
  name: string;
  value: string;
  fieldType: 'static' | 'ai_generated' | 'orchestrator';
  aiInstruction?: string;
  orchestratorVar?: string;
}

// Complete tool definition structure (stored as JSONB)
export interface ToolDefinition {
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  timeout?: number;
  headers: ToolHeader[];
  body: {
    fields: ToolField[];
  };
  responseSchema?: Record<string, any>;
}

// Tool entity from database
export interface Tool {
  id: string;
  name: string;
  type: 'crm' | 'http' | 'builtin';
  tool_definition: ToolDefinition;
  is_custom: boolean;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Input for creating a new tool
export type CreateToolInput = {
  name: string;
  type: 'crm' | 'http' | 'builtin';
  tool_definition: ToolDefinition;
  is_custom?: boolean;
  is_active?: boolean;
  created_by: string;
};

// Input for updating an existing tool
export type UpdateToolInput = Partial<Omit<CreateToolInput, 'created_by'>>;

export interface Prompt {
  id: string;
  company_id: string;
  prompt_content: string;
  variables?: Record<string, string>;
  conditions?: PromptCondition[];
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  [key: string]: any;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Templates API
export const templatesApi = {
  list: async (): Promise<Template[]> => {
    const response = await fetchApi<ApiResponse<{ templates: Template[] }>>('/templates');
    return response.templates || [];
  },

  get: async (id: string): Promise<Template> => {
    const response = await fetchApi<ApiResponse<{ template: Template }>>(`/templates/${id}`);
    return response.template;
  },

  create: async (data: {
    name: string;
    fields?: Record<string, string>;
    prompt_content?: string;
  }): Promise<Template> => {
    const payload = {
      name: data.name,
      fields: data.fields || {},
      prompt_content: data.prompt_content || " ",
    };
    const response = await fetchApi<ApiResponse<{ template: Template }>>('/templates', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.template;
  },

  update: async (id: string, data: Partial<{
    name: string;
    fields: Record<string, string>;
    prompt_content?: string;
  }>): Promise<Template> => {
    const payload = {
      id: id,
      name: data.name,
      fields: data.fields || {},
      prompt_content: data.prompt_content !== undefined ? data.prompt_content : " ",
    };
    const response = await fetchApi<ApiResponse<{ template: Template }>>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.template;
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi<ApiResponse<{ message: string }>>(`/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Companies API
export const companiesApi = {
  list: async (): Promise<Company[]> => {
    const response = await fetchApi<ApiResponse<{ companies: Company[] }>>('/companies');
    return response.companies || [];
  },

  get: async (id: string): Promise<Company> => {
    const response = await fetchApi<ApiResponse<{ company: Company }>>(`/companies/${id}`);
    return response.company;
  },

  getByCompanyId: async (companyId: string): Promise<Company> => {
    const response = await fetchApi<ApiResponse<{ company: Company }>>(
      `/companies/by-company-id/${companyId}`
    );
    return response.company;
  },

  create: async (data: {
    name: string;
    company_id: string;
    description?: string;
    template_id?: string;
    metadata?: Record<string, any>;
  }): Promise<Company> => {
    const response = await fetchApi<ApiResponse<{ company: Company }>>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.company;
  },

  update: async (id: string, data: Partial<{
    name: string;
    description: string;
    template_id: string;
    metadata: Record<string, any>;
  }>): Promise<Company> => {
    const response = await fetchApi<ApiResponse<{ company: Company }>>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.company;
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi<ApiResponse<{ message: string }>>(`/companies/${id}`, {
      method: 'DELETE',
    });
  },
};

// Prompts API
export const promptsApi = {
  getByCompany: async (
    companyId: string,
    context?: Record<string, string>
  ): Promise<Prompt> => {
    const params = new URLSearchParams(context);
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<ApiResponse<{ prompt: Prompt }>>(
      `/prompts/company/${companyId}${query}`
    );
    return response.prompt;
  },

  getAllByCompany: async (companyId: string): Promise<Prompt[]> => {
    const response = await fetchApi<ApiResponse<{ prompts: Prompt[] }>>(
      `/prompts/company/${companyId}/all`
    );
    return response.prompts || [];
  },

  get: async (id: string): Promise<Prompt> => {
    const response = await fetchApi<ApiResponse<{ prompt: Prompt }>>(`/prompts/${id}`);
    return response.prompt;
  },

  create: async (data: {
    company_id: string;
    prompt_content: string;
    variables?: Record<string, string>;
    conditions?: PromptCondition[];
    is_active?: boolean;
  }): Promise<Prompt> => {
    const payload = {
      company_id: data.company_id,
      prompt_content: data.prompt_content || " ",
      variables: data.variables || {},
      conditions: data.conditions || [],
      is_active: data.is_active ?? false,
    };
    const response = await fetchApi<ApiResponse<{ prompt: Prompt }>>('/prompts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.prompt;
  },

  createFromTemplate: async (data: {
    company_id: string;
    template_id: string;
    variables?: Record<string, string>;
    additional_content?: string;
  }): Promise<Prompt> => {
    const payload = {
      company_id: data.company_id,
      template_id: data.template_id,
      variables: data.variables || {},
      additional_content: data.additional_content || "",
    };
    const response = await fetchApi<ApiResponse<{ prompt: Prompt }>>('/prompts/from-template', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.prompt;
  },

  update: async (id: string, data: Partial<{
    prompt_content: string;
    variables: Record<string, string>;
    conditions: PromptCondition[];
    is_active: boolean;
  }>): Promise<Prompt> => {
    const payload: any = {
      id: id,
    };
    if (data.prompt_content !== undefined) payload.prompt_content = data.prompt_content;
    if (data.variables !== undefined) payload.variables = data.variables;
    if (data.conditions !== undefined) payload.conditions = data.conditions;
    if (data.is_active !== undefined) payload.is_active = data.is_active;
    
    const response = await fetchApi<ApiResponse<{ prompt: Prompt }>>(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.prompt;
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi<ApiResponse<{ message: string }>>(`/prompts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Tools API - follows existing patterns
export const toolsApi = {
  list: async (filters?: {
    type?: string;
    is_custom?: boolean;
    is_active?: boolean;
  }): Promise<Tool[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.is_custom !== undefined) params.set('is_custom', String(filters.is_custom));
    if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active));

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetchApi<ApiResponse<{ tools: Tool[] }>>(`/tools${query}`);
    return response.tools || [];
  },

  get: async (id: string): Promise<Tool> => {
    const response = await fetchApi<ApiResponse<{ tool: Tool }>>(`/tools/${id}`);
    return response.tool;
  },

  create: async (data: CreateToolInput): Promise<Tool> => {
    const response = await fetchApi<ApiResponse<{ tool: Tool }>>('/tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.tool;
  },

  update: async (id: string, data: UpdateToolInput): Promise<Tool> => {
    const response = await fetchApi<ApiResponse<{ tool: Tool }>>(`/tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.tool;
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi<ApiResponse<{ message: string }>>(`/tools/${id}`, {
      method: 'DELETE',
    });
  },

  getActive: async (): Promise<Tool[]> => {
    const response = await fetchApi<ApiResponse<{ tools: Tool[] }>>('/tools/active');
    return response.tools || [];
  },
};

export { ApiError };

