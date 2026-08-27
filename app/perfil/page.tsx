import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Trophy, Flame, Calendar, Award } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Perfil — FÚTBOL Y MÁS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/perfil');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Obtener estadísticas de predicciones y comentarios del usuario
  const { count: predictionsCount } = await supabase
    .from('porra_predictions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: commentsCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: reactionsCount } = await supabase
    .from('reactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header Perfil */}
      <Card variant="panel" className="relative overflow-hidden border-fym-border">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar con Nivel */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-900 border-3 border-fym-accent flex items-center justify-center font-heading font-black text-3xl text-fym-accent shadow-xl shadow-red-950/40 overflow-hidden">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-1 bg-fym-gold text-black font-heading font-bold text-xs px-2 py-0.5 rounded-full shadow-md">
              NV. {profile.level}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase">
                  {profile.display_name}
                </h1>
                <p className="text-xs text-muted">@{profile.username}</p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-fym-border text-xs font-bold text-slate-300">
                <Shield className="w-3.5 h-3.5 text-fym-accent" />
                <span className="uppercase">Rol: {profile.role}</span>
              </div>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-300 italic pt-1">{profile.bio}</p>
            )}

            {/* Barra de XP */}
            <div className="pt-3 space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs font-heading font-bold text-slate-300">
                <span>Progreso de Nivel</span>
                <span className="text-fym-gold">{profile.xp} XP</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-fym-border/50">
                <div
                  className="h-full bg-gradient-to-r from-fym-accent to-fym-gold rounded-full"
                  style={{ width: `${Math.min(100, (profile.xp % 100))}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </Card>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center p-6 space-y-1" hoverEffect>
          <Trophy className="w-6 h-6 text-fym-gold mx-auto mb-2" />
          <span className="font-heading font-black text-3xl text-white block">
            {predictionsCount || 0}
          </span>
          <span className="text-xs uppercase font-bold text-muted">Predicciones Porra</span>
        </Card>

        <Card className="text-center p-6 space-y-1" hoverEffect>
          <Flame className="w-6 h-6 text-fym-accent mx-auto mb-2" />
          <span className="font-heading font-black text-3xl text-white block">
            {reactionsCount || 0}
          </span>
          <span className="text-xs uppercase font-bold text-muted">Reacciones en Vivo</span>
        </Card>

        <Card className="text-center p-6 space-y-1" hoverEffect>
          <Award className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <span className="font-heading font-black text-3xl text-white block">
            {commentsCount || 0}
          </span>
          <span className="text-xs uppercase font-bold text-muted">Comentarios en Debates</span>
        </Card>
      </div>

    </div>
  );
}
