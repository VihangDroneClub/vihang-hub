export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: string
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: string
          avatar_url?: string | null
          created_at?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string | null
        }
      }
      missions: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string | null
          owner_id: string | null
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description?: string | null
          owner_id?: string | null
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          title?: string
          description?: string | null
          owner_id?: string | null
          status?: string
          created_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          mission_id: string
          title: string
          description: string | null
          status: string
          assignee_id: string | null
          created_by: string | null
          evidence_photos: string[] | null
          evidence_videos: string[] | null
          evidence_files: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          mission_id: string
          title: string
          description?: string | null
          status?: string
          assignee_id?: string | null
          created_by?: string | null
          evidence_photos?: string[] | null
          evidence_videos?: string[] | null
          evidence_files?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          mission_id?: string
          title?: string
          description?: string | null
          status?: string
          assignee_id?: string | null
          created_by?: string | null
          evidence_photos?: string[] | null
          evidence_videos?: string[] | null
          evidence_files?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
