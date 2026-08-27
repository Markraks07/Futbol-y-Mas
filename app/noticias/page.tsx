import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from '@/components/ui/Card';
import { newsService } from '@/services/news.service';
import { formatTimeAgo } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Noticias y Actualidad — FÚTBOL Y MÁS',
  description: 'Todas las noticias, fichajes, resúmenes y análisis del fútbol nacional e internacional.',
};

export const revalidate = 60;

export default async function NewsIndexPage() {
  let newsList: any[] = [];
  try {
    newsList = await newsService.getPublishedNews(30);
  } catch (err) {
    console.error('Error cargando noticias:', err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-fym-border pb-6">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-white uppercase tracking-wider">
          NOTICIAS Y ACTUALIDAD
        </h1>
        <p className="text-sm text-muted mt-1">
          La información deportiva más destacada analizada por la comunidad FYM.
        </p>
      </div>

      {newsList.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <div className="text-4xl">📰</div>
          <h3 className="font-heading font-bold text-xl text-white">No hay noticias publicadas aún</h3>
          <p className="text-xs text-muted">Las últimas novedades se publicarán muy pronto.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsList.map((n) => (
            <Link key={n.id} href={`/noticias/${n.slug || n.id}`} className="group">
              <Card className="h-full flex flex-col justify-between overflow-hidden p-0" hoverEffect>
                {n.cover_image_url ? (
                  <div className="relative w-full h-48 bg-slate-900 overflow-hidden">
                    <Image
                      src={n.cover_image_url}
                      alt={n.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-slate-900 to-red-950/40 flex items-center justify-center text-3xl">
                    ⚽
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="accent">{n.category}</Badge>
                      <span className="text-muted">{formatTimeAgo(n.created_at)}</span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-white group-hover:text-fym-accent transition-colors leading-snug">
                      {n.title}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {n.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-fym-border/60 text-[11px] font-bold uppercase text-fym-accent flex items-center justify-between">
                    <span>Leer Noticia Completa →</span>
                    <span className="text-muted">{n.views_count || 0} lecturas</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
