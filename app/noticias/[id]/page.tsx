import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { newsService } from '@/services/news.service';
import { Badge, Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTimeAgo } from '@/lib/utils';
import { ArrowLeft, Eye, Calendar, User as UserIcon, Share2 } from 'lucide-react';
import type { Metadata } from 'next';

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const news = await newsService.getNewsByIdOrSlug(id);
  if (!news) {
    return { title: 'Noticia no encontrada — FÚTBOL Y MÁS' };
  }

  return {
    title: `${news.title} — FÚTBOL Y MÁS`,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: news.cover_image_url ? [news.cover_image_url] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const news = await newsService.getNewsByIdOrSlug(id);

  if (!news) {
    notFound();
  }

  // Incrementar vistas de manera asíncrona
  newsService.incrementViews(news.id).catch(() => {});

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Botón Volver */}
      <div>
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Noticias</span>
        </Link>
      </div>

      {/* Header Noticia */}
      <header className="space-y-4">
        <Badge variant="accent">{news.category}</Badge>
        
        <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-tight leading-tight">
          {news.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
          {news.excerpt}
        </p>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-y border-fym-border text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <UserIcon className="w-3.5 h-3.5 text-fym-accent" />
              <strong>{news.author?.display_name || 'Redacción FYM'}</strong>
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(news.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {news.views_count || 0} lecturas
            </span>
          </div>
        </div>
      </header>

      {/* Imagen de Portada de Supabase Storage */}
      {news.cover_image_url && (
        <div className="relative w-full h-72 sm:h-96 md:h-[450px] rounded-2xl overflow-hidden border border-fym-border shadow-2xl">
          <Image
            src={news.cover_image_url}
            alt={news.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Contenido Completo */}
      <div className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 py-4 whitespace-pre-line">
        {news.content}
      </div>

      {/* Banner Compartir & CTA */}
      <Card variant="panel" className="text-center p-8 space-y-4 border-fym-accent/40 bg-gradient-to-b from-fym-panel to-slate-950">
        <h3 className="font-heading font-black text-2xl text-white uppercase">
          ¿QUÉ OPINAS DE ESTA NOTICIA?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          Participa en los debates de la comunidad, reacciona y comparte tu punto de vista con miles de aficionados.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/#panel-debates">
            <Button variant="primary" size="md">
              💬 IR A LA ZONA DE DEBATES
            </Button>
          </Link>
        </div>
      </Card>

    </article>
  );
}
