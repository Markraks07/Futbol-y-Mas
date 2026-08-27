import { createClient } from '@/lib/supabase/client';
import { PorraRound, PorraMatch, PorraPrediction } from '@/types';

export const porraService = {
  async getActiveRound(): Promise<{
    round: PorraRound | null;
    matches: (PorraMatch & { user_prediction?: PorraPrediction | null })[];
  }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: round, error: roundError } = await supabase
      .from('porra_rounds')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (roundError || !round) {
      return { round: null, matches: [] };
    }

    const { data: matches, error: matchesError } = await supabase
      .from('porra_matches')
      .select('*')
      .eq('round_id', round.id)
      .order('match_date', { ascending: true });

    if (matchesError || !matches) {
      return { round, matches: [] };
    }

    let predictions: PorraPrediction[] = [];
    if (user) {
      const { data: userPreds } = await supabase
        .from('porra_predictions')
        .select('*')
        .eq('user_id', user.id);
      predictions = (userPreds || []) as PorraPrediction[];
    }

    const matchesWithPreds = matches.map((m) => ({
      ...m,
      user_prediction: predictions.find((p) => p.match_id === m.id) || null,
    }));

    return { round, matches: matchesWithPreds };
  },

  async savePrediction(matchId: string, homeScore: number, awayScore: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Debes iniciar sesión para participar en la porra');

    const { data, error } = await supabase
      .from('porra_predictions')
      .upsert({
        match_id: matchId,
        user_id: user.id,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'match_id,user_id',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
