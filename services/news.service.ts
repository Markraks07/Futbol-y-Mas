import { createClient } from '@/lib/supabase/client';
import { News } from '@/types';
import { slugify } from '@/lib/utils';

export const newsService = {
  async getPublishedNews(limit = 20, category?: string) {
    const supabase = createClient();
    let query = supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'TODOS') {
      query = query.ilike('category', `%${category}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as News[];
  },

  async getFeaturedNews() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data as News[];
  },

  async getNewsByIdOrSlug(idOrSlug: string) {
    const supabase = createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const query = supabase.from('news').select('*, author:profiles(*)');
    const { data, error } = isUuid
      ? await query.eq('id', idOrSlug).single()
      : await query.eq('slug', idOrSlug).single();

    if (error) return null;
    return data;
  },

  async createNews(newsData: Omit<News, 'id' | 'created_at' | 'updated_at' | 'views_count'>) {
    const supabase = createClient();
    const slug = newsData.slug || slugify(newsData.title) + '-' + Math.random().toString(36).substring(2, 7);

    const { data, error } = await supabase
      .from('news')
      .insert({
        ...newsData,
        slug,
      })
      .select()
      .single();

    if (error) throw error;
    return data as News;
  },

  async updateNews(id: string, updates: Partial<News>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('news')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as News;
  },

  async deleteNews(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) throw error;
  },

  async incrementViews(id: string) {
    const supabase = createClient();
    const { data: current } = await supabase.from('news').select('views_count').eq('id', id).single();
    if (current) {
      await supabase.from('news').update({ views_count: (current.views_count || 0) + 1 }).eq('id', id);
    }
  }
};
