import { api } from './client';
import type { LoginResponse, UserProfile, InviteResponse, UserRole } from './types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, full_name: string, invite_token: string) =>
    api.post<LoginResponse>('/auth/register', { email, password, full_name, invite_token }),

  me: () => api.get<UserProfile>('/auth/me'),

  updateMe: (payload: { full_name?: string; designation?: string;
                        phone?: string; skills?: string[] }) =>
    api.patch<UserProfile>('/auth/me', payload),

  changePassword: (current_password: string, new_password: string) =>
    api.post<{ success: boolean }>('/auth/change-password', { current_password, new_password }),

  invite: (email: string, role: UserRole, institute_id?: string) =>
    api.post<InviteResponse>('/auth/invite', { email, role, institute_id }),

  listInvites: () => api.get<InviteResponse[]>('/auth/invites'),

  resetPassword: (email: string, new_password: string) =>
    api.post<{ success: boolean }>('/auth/reset-password', { email, new_password }),
};
