import React from 'react';
import { DebatesFeed } from '@/components/home/DebatesFeed';
import { debatesService } from '@/services/debates.service';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Debates de Fútbol — FÚTBOL Y MÁS',
  description: 'Participa en los debates de la jornada, vota con tus reacciones y comenta la actualidad futbolística.',
};

export const revalidate = 0;

export default async function DebatesPage() {
  let debates: any[] = [];
  try {
    debates = await debatesService.getDebates();
  } catch (err) {
    console.error('Error cargando debates:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <DebatesFeed initialDebates={debates} />
    </div>
  );
}
