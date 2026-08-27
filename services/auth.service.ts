import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types';

export const authService = {
  async getCurrentUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile: profile as Profile | null };
  },

  async login(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async register(email: string, password: string, displayName: string, username?: string) {
    const supabase = createClient();
    const cleanUsername = (username || displayName.toLowerCase().replace(/\s+/g, '_')).trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: cleanUsername,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async loginWithGoogle() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-password/confirmar`,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async updateProfile(profileData: Partial<Profile>) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No autenticado');

    // Quitar campos no editables directamente por el usuario
    const { id, role, xp, level, created_at, updated_at, ...safeData } = profileData;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...safeData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
