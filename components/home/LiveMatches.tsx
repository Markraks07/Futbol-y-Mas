'use client';

import React, { useState } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { RefreshCw, Calendar } from 'lucide-react';

interface MatchItem {
  local: string;
  visitante: string;
  hora: string;
  status: string;
  marcador: string;
  comp: string;
}

export function LiveMatches() {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([
    {
      local: 'Real Madrid',
      visitante: 'FC Barcelona',
      hora: '21:00',
      status: 'HOY',
      marcador: 'VS',
      comp: 'LA LIGA EA SPORTS',
    },
    {
      local: 'Atlético de Madrid',
      visitante: 'Sevilla FC',
      hora: '18:30',
      status: 'HOY',
      marcador: 'VS',
      comp: 'LA LIGA EA SPORTS',
    },
    {
      local: 'Athletic Club',
      visitante: 'Real Betis',
      hora: '16:15',
      status: 'FINAL',
      marcador: '2 - 1',
      comp: 'LA LIGA EA SPORTS',
    },
  ]);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulación de consulta a API Sports con fallback limpio
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <section id="panel-partidos" className="my-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-heading font-black text-2xl uppercase tracking-wider text-white flex items-center gap-2">
            <span>⚽</span> PARTIDOS Y RESULTADOS EN DIRECTO
          </h2>
          <p className="text-xs text-muted">Jornada oficial y marcadores en tiempo real</p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-fym-border hover:border-fym-accent text-xs font-heading font-bold text-slate-300 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-fym-accent' : ''}`} />
          <span>Actualizar partidos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matches.map((m, idx) => (
          <Card key={idx} hoverEffect className="text-center p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-fym-border/60 text-xs text-muted">
              <span className="font-bold text-slate-300">🏆 {m.comp}</span>
              <Badge variant={m.status === 'FINAL' ? 'default' : 'accent'}>
                {m.status === 'FINAL' ? 'FINAL' : `⏰ ${m.hora}`}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-2 py-2">
              <span className="flex-1 text-right font-bold text-sm sm:text-base text-white">
                {m.local}
              </span>

              <div className="px-3 py-1 bg-slate-900 border border-fym-border rounded-lg font-heading font-bold text-base text-fym-gold min-w-[60px]">
                {m.marcador}
              </div>

              <span className="flex-1 text-left font-bold text-sm sm:text-base text-white">
                {m.visitante}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
