
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
      users: {
        Row: {
          id: number
          username: string
          role: 'Employee' | 'Manager' | 'Admin'
          created_at: string
        }
        Insert: {
          id?: number
          username: string
          role?: 'Employee' | 'Manager' | 'Admin'
          created_at?: string
        }
        Update: {
          id?: number
          username?: string
          role?: 'Employee' | 'Manager' | 'Admin'
          created_at?: string
        }
      }
      software: {
        Row: {
          id: number
          name: string
          description: string
          access_levels: string[]
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          access_levels: string[]
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          access_levels?: string[]
          created_at?: string
        }
      }
      access_requests: {
        Row: {
          id: number
          user_id: number
          software_id: number
          access_type: string
          reason: string
          status: 'Pending' | 'Approved' | 'Rejected'
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          software_id: number
          access_type: string
          reason: string
          status?: 'Pending' | 'Approved' | 'Rejected'
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          software_id?: number
          access_type?: string
          reason?: string
          status?: 'Pending' | 'Approved' | 'Rejected'
          created_at?: string
        }
      }
    }
  }
}
