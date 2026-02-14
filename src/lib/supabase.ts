import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Project {
  id: string
  created_at: string
  project_name: string
  adu_model: string
  customer_email?: string
  customer_phone?: string
  access_token: string
  status: 'draft' | 'in_progress' | 'completed' | 'locked'
  completed_at?: string
}

export interface FinishCategory {
  id: string
  created_at: string
  name: string
  display_name: string
  description?: string
  display_order: number
  is_active: boolean
}

export interface FinishOption {
  id: string
  created_at: string
  category_id: string
  name: string
  description?: string
  image_url?: string
  price_upgrade?: number
  display_order: number
  is_active: boolean
  category?: FinishCategory
}

export interface ProjectSelection {
  id: string
  created_at: string
  updated_at: string
  project_id: string
  category_id: string
  option_id: string
  project?: Project
  category?: FinishCategory
  option?: FinishOption
}

// Helper functions
export async function getProjectByToken(token: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('finish_portal_projects')
    .select('*')
    .eq('access_token', token)
    .single()

  if (error || !data) return null
  return data
}

export async function getFinishCategories(): Promise<FinishCategory[]> {
  const { data, error } = await supabase
    .from('finish_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) return []
  return data || []
}

export async function getFinishOptionsByCategory(categoryId: string): Promise<FinishOption[]> {
  const { data, error } = await supabase
    .from('finish_options')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('display_order')

  if (error) return []
  return data || []
}

export async function getProjectSelections(projectId: string): Promise<ProjectSelection[]> {
  const { data, error } = await supabase
    .from('project_selections')
    .select(`
      *,
      category:finish_categories(*),
      option:finish_options(*)
    `)
    .eq('project_id', projectId)

  if (error) return []
  return data || []
}

export async function updateProjectSelection(
  projectId: string,
  categoryId: string,
  optionId: string
): Promise<boolean> {
  // First try to update existing selection
  const { data: existing, error: selectError } = await supabase
    .from('project_selections')
    .select('id')
    .eq('project_id', projectId)
    .eq('category_id', categoryId)
    .single()

  if (existing && !selectError) {
    // Update existing selection
    const { error } = await supabase
      .from('project_selections')
      .update({ 
        option_id: optionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    return !error
  } else {
    // Create new selection
    const { error } = await supabase
      .from('project_selections')
      .insert({
        project_id: projectId,
        category_id: categoryId,
        option_id: optionId
      })

    return !error
  }
}

export async function lockProjectSelections(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('finish_portal_projects')
    .update({ 
      status: 'locked',
      completed_at: new Date().toISOString()
    })
    .eq('id', projectId)

  return !error
}

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('finish_portal_projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}