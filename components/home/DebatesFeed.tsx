'use client';

import React, { useState } from 'react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { debatesService } from '@/services/debates.service';
import { DebateWithDetails, CommentWithAuthor } from '@/types';
import { formatTimeAgo } from '@/lib/utils';
import { Search, MessageSquare, Share2, Send } from 'lucide-react';
import Link from 'next/link';

interface DebatesFeedProps {
  initialDebates?: DebateWithDetails[];
}

export function DebatesFeed({ initialDebates = [] }: DebatesFeedProps) {
  const [debates, setDebates] = useState<DebateWithDetails[]>(initialDebates);
  const [currentCategory, setCurrentCategory] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [openCommentsId, setOpenCommentsId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentWithAuthor[]>>({});
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const categories = ['TODOS', 'DEBATE', 'FICHAJES', 'LIGA', 'CHAMPIONS', 'POLÉMICA'];

  const filteredDebates = debates.filter((d) => {
    const matchCat =
      currentCategory === 'TODOS' ||
      d.category.toUpperCase().includes(currentCategory.toUpperCase());
    const matchQuery =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleReaction = async (debateId: string, type: 'fuego' | 'gol' | 'factos' | 'robo') => {
    try {
      await debatesService.toggleReaction(debateId, type);
      // Actualizar estado local
      setDebates((prev) =>
        prev.map((d) => {
          if (d.id !== debateId) return d;
          const wasActive = d.user_reaction === type;
          const newReaction = wasActive ? null : type;

          const newCounts = { ...d.reactions_count };
          if (wasActive) {
            newCounts[type] = Math.max(0, newCounts[type] - 1);
          } else {
            if (d.user_reaction) {
              newCounts[d.user_reaction] = Math.max(0, newCounts[d.user_reaction] - 1);
            }
            newCounts[type] = (newCounts[type] || 0) + 1;
          }

          return {
            ...d,
            user_reaction: newReaction,
            reactions_count: newCounts,
          };
        })
      );
    } catch (err: any) {
      if (err.message?.includes('iniciar sesión')) {
        setAuthModalOpen(true);
      } else {
        alert(err.message || 'Error al reaccionar');
      }
    }
  };

  const handleToggleComments = async (debateId: string) => {
    if (openCommentsId === debateId) {
      setOpenCommentsId(null);
      return;
    }

    setOpenCommentsId(debateId);
    if (!commentsMap[debateId]) {
      try {
        const comments = await debatesService.getComments(debateId);
        setCommentsMap((prev) => ({ ...prev, [debateId]: comments }));
      } catch {
        setCommentsMap((prev) => ({ ...prev, [debateId]: [] }));
      }
    }
  };

  const handleAddComment = async (debateId: string) => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await debatesService.addComment(debateId, commentText);
      setCommentsMap((prev) => ({
        ...prev,
        [debateId]: [...(prev[debateId] || []), newComment],
      }));
      setDebates((prev) =>
        prev.map((d) => (d.id === debateId ? { ...d, comments_count: d.comments_count + 1 } : d))
      );
      setCommentText('');
    } catch (err: any) {
      if (err.message?.includes('iniciar sesión')) {
        setAuthModalOpen(true);
      } else {
        alert(err.message || 'Error al publicar comentario');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async (title: string) => {
    const text = `🔥 ¡Mira este debate en FÚTBOL Y MÁS!: "${title}"`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Fútbol Y Más', text, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert('¡Enlace del debate copiado al portapapeles!');
    }
  };

  return (
    <section id="panel-debates" className="my-14">
      
      {/* Header con Buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-fym-border">
        <div>
          <h2 className="font-heading font-black text-2xl uppercase tracking-wider text-white flex items-center gap-2">
            <span>🗣️</span> DEBATES Y NOTICIAS INTERACTIVAS
          </h2>
          <p className="text-xs text-muted">Vota, opina y decide los temas candentes de la jornada</p>
        </div>

        {/* Buscador */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar titulares, equipos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-fym-border rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-fym-accent focus:ring-1 focus:ring-red-500 transition-all"
          />
        </div>
      </div>

      {/* Filtros por Categoría */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCurrentCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-heading font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
              currentCategory === cat
                ? 'bg-fym-accent text-white shadow-md shadow-red-950/40 border border-fym-accent'
                : 'bg-fym-card border border-fym-border text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {cat === 'TODOS' ? '🔥 Todos' : cat}
          </button>
        ))}
      </div>

      {/* Grid de Debates */}
      {filteredDebates.length === 0 ? (
        <Card className="text-center py-12 text-muted space-y-2">
          <div className="text-3xl">🔍</div>
          <h4 className="font-heading font-bold text-lg text-white">No se encontraron debates</h4>
          <p className="text-xs">Prueba seleccionando otra categoría o limpiando tu búsqueda.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDebates.map((d) => (
            <Card key={d.id} className="flex flex-col justify-between" hoverEffect>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="accent">{d.category || 'DEBATE'}</Badge>
                  <span className="text-[11px] text-muted">⏱️ {formatTimeAgo(d.created_at)}</span>
                </div>

                <h3 className="font-heading font-bold text-lg sm:text-xl text-white leading-snug">
                  {d.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {d.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-fym-border/60 space-y-3">
                {/* Botones de Reacción */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleReaction(d.id, 'fuego')}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      d.user_reaction === 'fuego'
                        ? 'bg-red-950/60 border-fym-accent text-white shadow-md'
                        : 'bg-slate-900 border-fym-border text-slate-300 hover:border-fym-accent'
                    }`}
                  >
                    <span>🔥</span>
                    <span className="text-fym-gold">{d.reactions_count.fuego}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(d.id, 'gol')}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      d.user_reaction === 'gol'
                        ? 'bg-red-950/60 border-fym-accent text-white shadow-md'
                        : 'bg-slate-900 border-fym-border text-slate-300 hover:border-fym-accent'
                    }`}
                  >
                    <span>⚽</span>
                    <span className="text-fym-gold">{d.reactions_count.gol}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(d.id, 'factos')}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      d.user_reaction === 'factos'
                        ? 'bg-red-950/60 border-fym-accent text-white shadow-md'
                        : 'bg-slate-900 border-fym-border text-slate-300 hover:border-fym-accent'
                    }`}
                  >
                    <span>🧠</span>
                    <span className="text-fym-gold">{d.reactions_count.factos}</span>
                  </button>

                  <button
                    onClick={() => handleReaction(d.id, 'robo')}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      d.user_reaction === 'robo'
                        ? 'bg-red-950/60 border-fym-accent text-white shadow-md'
                        : 'bg-slate-900 border-fym-border text-slate-300 hover:border-fym-accent'
                    }`}
                  >
                    <span>❌</span>
                    <span className="text-fym-gold">{d.reactions_count.robo}</span>
                  </button>
                </div>

                {/* Acciones Comentarios & Compartir */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => handleToggleComments(d.id)}
                    className="text-fym-accent font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Comentarios ({d.comments_count})</span>
                  </button>

                  <button
                    onClick={() => handleShare(d.title)}
                    className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </button>
                </div>

                {/* Desplegable de Comentarios */}
                {openCommentsId === d.id && (
                  <div className="pt-3 border-t border-fym-border/40 space-y-3 animate-in fade-in duration-200">
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {(commentsMap[d.id] || []).length === 0 ? (
                        <p className="text-xs text-muted text-center py-2">
                          Sé el primero en opinar sobre este debate.
                        </p>
                      ) : (
                        (commentsMap[d.id] || []).map((c) => (
                          <div key={c.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-fym-border/60 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <strong className="text-fym-accent">{c.author?.display_name || 'Aficionado'}</strong>
                              <span className="text-[10px] text-muted">{formatTimeAgo(c.created_at)}</span>
                            </div>
                            <p className="text-slate-200">{c.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Formulario para añadir comentario */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe tu opinión..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(d.id)}
                        className="flex-1 bg-slate-950 border border-fym-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-fym-accent"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddComment(d.id)}
                        isLoading={submittingComment}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de invitación a Auth */}
      <Modal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} maxWidth="sm">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚽🔥</div>
          <h3 className="font-heading font-bold text-2xl text-fym-accent uppercase">
            ¡ÚNETE A LA COMUNIDAD FYM!
          </h3>
          <p className="text-sm text-slate-300">
            Para reaccionar a los debates y dejar tus comentarios necesitas iniciar sesión o registrarte.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" onClick={() => setAuthModalOpen(false)}>
              <Button variant="primary" className="w-full">
                🔑 Iniciar Sesión / Registrarse
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setAuthModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
