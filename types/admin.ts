export type AdminRole = 'admin' | 'commercial' | 'production';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  avatar_url?: string;
  created_at: string;
}

export interface AdminSession {
  user: AdminProfile | null;
  isLoading: boolean;
}
