import { createClient } from '@/lib/supabase/client';
import { PollWithResults } from '@/types';

export const pollsService = {
  async getActivePoll(): Promise<PollWithResults | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Obtener la última encuesta activa
    const { data: poll, error } = await supabase
      .from('polls')
      .select('*, options:poll_options(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !poll) return null;

    // Obtener votos de la encuesta
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('option_id, user_id')
      .eq('poll_id', poll.id);

    const totalVotes = votes?.length || 0;
    const userVote = user ? votes?.find((v) => v.user_id === user.id)?.option_id : null;

    const optionsWithResults = (poll.options || [])
      .sort((a: any, b: any) => a.order_num - b.order_num)
      .map((opt: any) => {
        const count = votes?.filter((v) => v.option_id === opt.id).length || 0;
        const percentage = totalVotes > 0 ? Number(((count / totalVotes) * 100).toFixed(1)) : 0;
        return {
          ...opt,
          votes_count: count,
          percentage,
        };
      });

    return {
      ...poll,
      options: optionsWithResults,
      total_votes: totalVotes,
      user_voted_option_id: userVote,
    };
  },

  async vote(pollId: string, optionId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Debes iniciar sesión para votar');

    const { error } = await supabase.from('poll_votes').insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
    });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya has votado en esta encuesta');
      }
      throw error;
    }
  },

  async createPoll(question: string, options: string[]) {
    const supabase = createClient();
    // Desactivar encuestas anteriores
    await supabase.from('polls').update({ is_active: false }).eq('is_active', true);

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question,
        is_active: true,
      })
      .select()
      .single();

    if (pollError) throw pollError;

    const optionsToInsert = options
      .filter((opt) => opt.trim() !== '')
      .map((option_text, index) => ({
        poll_id: poll.id,
        option_text: option_text.trim(),
        order_num: index,
      }));

    const { error: optError } = await supabase.from('poll_options').insert(optionsToInsert);
    if (optError) throw optError;

    return poll;
  }
};
