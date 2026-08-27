'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { pollsService } from '@/services/polls.service';
import { porraService } from '@/services/porra.service';
import { PollWithResults, PorraRound, PorraMatch } from '@/types';
import Link from 'next/link';

interface InteractiveZoneProps {
  initialPoll?: PollWithResults | null;
  initialPorra?: {
    round: PorraRound | null;
    matches: PorraMatch[];
  } | null;
}

export function InteractiveZone({ initialPoll, initialPorra }: InteractiveZoneProps) {
  const [poll, setPoll] = useState<PollWithResults | null>(initialPoll || null);
  const [selectedOption, setSelectedOption] = useState<string | null>(poll?.user_voted_option_id || null);
  const [voting, setVoting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Estados de Porra
  const [homeScore, setHomeScore] = useState<number>(2);
  const [awayScore, setAwayScore] = useState<number>(1);
  const [savingPorra, setSavingPorra] = useState(false);
  const [porraMessage, setPorraMessage] = useState<string | null>(null);

  const featuredMatch = initialPorra?.matches?.[0] || {
    id: 'demo-match-1',
    home_team: 'Real Madrid',
    away_team: 'FC Barcelona',
    round_id: 'demo-round',
    home_score: null,
    away_score: null,
    status: 'NS',
    match_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const handleVote = async (optionId: string) => {
    setVoting(true);
    try {
      if (poll) {
        await pollsService.vote(poll.id, optionId);
        setSelectedOption(optionId);
        // Refrescar encuesta
        const updated = await pollsService.getActivePoll();
        setPoll(updated);
      }
    } catch (err: any) {
      if (err.message?.includes('iniciar sesión')) {
        setAuthModalOpen(true);
      } else {
        alert(err.message || 'Error al votar');
      }
    } finally {
      setVoting(false);
    }
  };

  const handleSendPrediction = async () => {
    setSavingPorra(true);
    try {
      await porraService.savePrediction(featuredMatch.id, homeScore, awayScore);
      const texto = `Mi predicción para ${featuredMatch.home_team} vs ${featuredMatch.away_team} en FYM es: ${homeScore} - ${awayScore} ⚽🔥`;
      const waUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;
      setPorraMessage('¡Predicción guardada! Abriendo WhatsApp...');
      window.open(waUrl, '_blank');
    } catch (err: any) {
      if (err.message?.includes('iniciar sesión')) {
        setAuthModalOpen(true);
      } else {
        alert(err.message || 'Error al guardar pronóstico');
      }
    } finally {
      setSavingPorra(false);
    }
  };

  return (
    <section id="panel-porra" className="my-12">
      <Card variant="panel" className="relative overflow-hidden border-fym-accent/30">
        
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 mb-6 border-b border-fym-border">
          <h2 className="font-heading font-black text-2xl uppercase tracking-wider text-fym-accent flex items-center gap-2">
            <span>🔥</span> ZONA DE PARTICIPACIÓN
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            En Vivo
          </span>
        </div>

        {/* Si hay encuesta activa y no hay partido prioritario, se muestra la encuesta */}
        {poll ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold font-heading uppercase text-fym-gold tracking-widest">
                📝 ENCUESTA DE LA SEMANA
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading uppercase text-white">
                {poll.question}
              </h3>
            </div>

            <div className="space-y-3">
              {poll.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <div key={opt.id} className="space-y-1.5">
                    <button
                      onClick={() => handleVote(opt.id)}
                      disabled={voting}
                      className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-red-950/40 border-fym-accent text-white shadow-lg shadow-red-950/40'
                          : 'bg-fym-card border-fym-border hover:border-slate-600 text-slate-200'
                      }`}
                    >
                      <span>{opt.option_text}</span>
                      <span className="font-heading text-fym-gold text-sm">
                        {opt.percentage}% ({opt.votes_count})
                      </span>
                    </button>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fym-accent to-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center text-xs text-muted pt-2">
              Total de votos registrados: <strong className="text-white">{poll.total_votes}</strong>
            </div>
          </div>
        ) : (
          /* Porra Semanal */
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="space-y-1">
              <span className="text-xs font-bold font-heading uppercase text-fym-accent tracking-widest">
                🏆 LA PORRA DE LA SEMANA
              </span>
              <p className="text-xs text-muted">Acierta el resultado y gana puntos XP en la comunidad</p>
            </div>

            <div className="flex items-center justify-center gap-6 sm:gap-10 py-4 flex-wrap">
              <div className="space-y-2 text-center">
                <span className="font-heading font-bold text-lg text-white block">
                  {featuredMatch.home_team}
                </span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 h-14 bg-slate-900 border-2 border-fym-accent text-center font-heading font-bold text-2xl text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="font-heading font-black text-2xl text-fym-accent">
                VS
              </div>

              <div className="space-y-2 text-center">
                <span className="font-heading font-bold text-lg text-white block">
                  {featuredMatch.away_team}
                </span>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 h-14 bg-slate-900 border-2 border-fym-accent text-center font-heading font-bold text-2xl text-white rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSendPrediction}
                isLoading={savingPorra}
                className="w-full max-w-md"
              >
                🚀 ENVIAR MI PREDICCIÓN
              </Button>
              {porraMessage && (
                <p className="text-xs text-fym-gold mt-2 font-medium">{porraMessage}</p>
              )}
            </div>
          </div>
        )}

      </Card>

      {/* Modal de invitación a Auth si el usuario no está logueado */}
      <Modal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} maxWidth="sm">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚽🔥</div>
          <h3 className="font-heading font-bold text-2xl text-fym-accent uppercase">
            ¡ÚNETE A LA COMUNIDAD FYM!
          </h3>
          <p className="text-sm text-slate-300">
            Para votar en las encuestas, reaccionar a los debates y participar en las porras necesitas tener una cuenta.
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
