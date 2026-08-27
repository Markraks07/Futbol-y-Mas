import { NewsTicker } from '@/components/layout/NewsTicker';
import { HeroSection } from '@/components/home/HeroSection';
import { LiveMatches } from '@/components/home/LiveMatches';
import { InteractiveZone } from '@/components/home/InteractiveZone';
import { DebatesFeed } from '@/components/home/DebatesFeed';
import { ClubDiez } from '@/components/home/ClubDiez';
import { AnniversarySection } from '@/components/home/AnniversarySection';
import { debatesService } from '@/services/debates.service';
import { pollsService } from '@/services/polls.service';
import { createClient } from '@/lib/supabase/server';
import { ClubSocio, DebateWithDetails, PollWithResults } from '@/types';

// Desactivar caché estática agresiva para obtener debates en tiempo real
export const revalidate = 0;

export default async function HomePage() {
  let initialDebates: DebateWithDetails[] = [];
  let initialPoll: PollWithResults | null = null;
  let socios: ClubSocio[] = [];

  try {
    const supabase = await createClient();

    // Obtener debates iniciales
    const { data: debatesData } = await supabase
      .from('debates')
      .select(`
        *,
        author:profiles(display_name, username, avatar_url),
        comments:comments(count),
        reactions:reactions(reaction_type, user_id)
      `)
      .order('created_at', { ascending: false });

    if (debatesData) {
      initialDebates = debatesData.map((d: any) => {
        const reactions = d.reactions || [];
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
          reactions_count: {
            fuego: reactions.filter((r: any) => r.reaction_type === 'fuego').length,
            gol: reactions.filter((r: any) => r.reaction_type === 'gol').length,
            factos: reactions.filter((r: any) => r.reaction_type === 'factos').length,
            robo: reactions.filter((r: any) => r.reaction_type === 'robo').length,
          },
          comments_count: d.comments?.[0]?.count || 0,
          user_reaction: null,
        };
      });
    }

    // Obtener socios del Club de los 10
    const { data: sociosData } = await supabase
      .from('club_socios')
      .select('*')
      .order('carnet_num', { ascending: true });

    if (sociosData) {
      socios = sociosData as ClubSocio[];
    }

  } catch (e) {
    console.error('Error cargando datos de Supabase para la Home:', e);
  }

  // Si no hay debates aún en Supabase, proporcionar datos iniciales de arranque
  if (initialDebates.length === 0) {
    initialDebates = [
      {
        id: 'seed-1',
        title: '¿Debe ser titular Vinícius o Mbappé por la banda izquierda?',
        description: 'Debate táctico sobre el encaje de las dos estrellas en el esquema del Real Madrid para los grandes partidos de Champions.',
        category: 'DEBATE',
        cover_image_url: null,
        author_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: { display_name: 'Pau (FYM)', username: 'pau', avatar_url: null },
        reactions_count: { fuego: 18, gol: 9, factos: 14, robo: 2 },
        comments_count: 5,
        user_reaction: null,
      },
      {
        id: 'seed-2',
        title: '¿Ha acertado el Barça con sus últimos movimientos de mercado?',
        description: 'Analizamos la plantilla de Flick y si las nuevas incorporaciones dan para pelear todos los títulos este año.',
        category: 'LIGA',
        cover_image_url: null,
        author_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: { display_name: 'Comunidad FYM', username: 'fym', avatar_url: null },
        reactions_count: { fuego: 25, gol: 12, factos: 8, robo: 4 },
        comments_count: 8,
        user_reaction: null,
      },
    ];
  }

  return (
    <>
      <NewsTicker />
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnniversarySection />
        <LiveMatches />
        <InteractiveZone initialPoll={initialPoll} />
        <DebatesFeed initialDebates={initialDebates} />
        <ClubDiez socios={socios} />
      </div>
    </>
  );
}
