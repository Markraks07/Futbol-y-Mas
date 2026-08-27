import React from 'react';
import { InteractiveZone } from '@/components/home/InteractiveZone';
import { LiveMatches } from '@/components/home/LiveMatches';
import { porraService } from '@/services/porra.service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Porra Semanal y Predicciones — FÚTBOL Y MÁS',
  description: 'Acierta los resultados de la jornada de fútbol y compite con la comunidad FYM.',
};

export const revalidate = 0;

export default async function PorraPage() {
  let porraData = null;
  try {
    porraData = await porraService.getActiveRound();
  } catch (err) {
    console.error('Error cargando datos de porra:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="border-b border-fym-border pb-6 text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-white uppercase tracking-wider">
          PORRA OFICIAL FYM
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Pronostica el marcador exacto de los partidos destacados de la semana antes del pitido inicial.
        </p>
      </div>

      <InteractiveZone initialPorra={porraData} />
      <LiveMatches />
    </div>
  );
}
