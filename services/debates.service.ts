import { createClient } from '@/lib/supabase/client';
import { Debate, DebateWithDetails, CommentWithAuthor } from '@/types';

export const debatesService = {
  async getDebates(category?: string, queryText?: string): Promise<DebateWithDetails[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('debates')
      .select(`
        *,
        author:profiles(display_name, username, avatar_url),
        comments:comments(count),
        reactions:reactions(reaction_type, user_id)
      `)
      .order('created_at', { ascending: false });

    if (category && category !== 'TODOS') {
      query = query.ilike('category', `%${category}%`);
    }

    if (queryText) {
      query = query.or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((d: any) => {
      const reactions = d.reactions || [];
      const reactionsCount = {
        fuego: reactions.filter((r: any) => r.reaction_type === 'fuego').length,
        gol: reactions.filter((r: any) => r.reaction_type === 'gol').length,
        factos: reactions.filter((r: any) => r.reaction_type === 'factos').length,
        robo: reactions.filter((r: any) => r.reaction_type === 'robo').length,
      };

      const userReaction = user
        ? reactions.find((r: any) => r.user_id === user.id)?.reaction_type || null
        : null;

      const commentsCount = d.comments?.[0]?.count || 0;

      return {
        id: d.id,
        title: d.title,
        description: d.description,
        category: d.category,
        cover_image_url: d.cover_image_url,
        author_id: d.author_id,
        created_at: d.created_at,
        updated_at: d.updated_at,
        author: d.author,
        reactions_count: reactionsCount,
        comments_count: commentsCount,
        user_reaction: userReaction,
      };
    });
  },

  async toggleReaction(debateId: string, reactionType: 'fuego' | 'gol' | 'factos' | 'robo') {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Debes iniciar sesión para reaccionar');

    // Comprobar si ya existe
    const { data: existing } = await supabase
      .from('reactions')
      .select('id, reaction_type')
      .eq('debate_id', debateId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      if (existing.reaction_type === reactionType) {
        // Eliminar si vuelve a tocar la misma
        await supabase.from('reactions').delete().eq('id', existing.id);
        return { action: 'removed' };
      } else {
        // Actualizar a la nueva reacción
        await supabase.from('reactions').update({ reaction_type: reactionType }).eq('id', existing.id);
        return { action: 'updated' };
      }
    } else {
      // Crear nueva reacción
      await supabase.from('reactions').insert({
        debate_id: debateId,
        user_id: user.id,
        reaction_type: reactionType,
      });
      return { action: 'added' };
    }
  },

  async getComments(debateId: string): Promise<CommentWithAuthor[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(display_name, username, avatar_url, role)
      `)
      .eq('debate_id', debateId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as CommentWithAuthor[];
  },

  async addComment(debateId: string, content: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Debes iniciar sesión para comentar');

    const cleanContent = content.trim();
    if (!cleanContent) throw new Error('El comentario no puede estar vacío');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        debate_id: debateId,
        user_id: user.id,
        content: cleanContent,
      })
      .select(`
        *,
        author:profiles(display_name, username, avatar_url, role)
      `)
      .single();

    if (error) throw error;
    return data as unknown as CommentWithAuthor;
  },

  async createDebate(title: string, description: string, category = 'DEBATE', coverImageUrl?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Debes iniciar sesión para crear un debate');

    const { data, error } = await supabase
      .from('debates')
      .insert({
        title,
        description,
        category,
        cover_image_url: coverImageUrl || null,
        author_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Debate;
  },

  async deleteDebate(debateId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('debates').delete().eq('id', debateId);
    if (error) throw error;
  }
};
