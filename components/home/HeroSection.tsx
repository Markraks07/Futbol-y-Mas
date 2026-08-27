import React from 'react';
import { Button } from '@/components/ui/Button';
import { Flame, MessageSquare, Trophy, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  followersCount?: number;
}

export function HeroSection({ followersCount = 15000 }: HeroSectionProps) {
  return (
    <header className="relative py-16 md:py-24 text-center px-4 overflow-hidden bg-gradient-to-b from-fym-panel/80 via-fym-nav to-background border-b border-fym-border">
      
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-6">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-fym-accent/30 text-fym-accent font-heading font-bold text-xs uppercase tracking-widest">
          <span>⚡ PLATAFORMA INTERACTIVA DE NOTICIAS DEPORTIVAS</span>
        </div>

        {/* Title */}
        <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-tight text-white leading-none">
          NO LEAS LAS NOTICIAS, <span className="text-fym-accent">DECÍDELAS</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Opina, vota, reacciona y compite en tiempo real con miles de fanáticos del fútbol en una comunidad viva.
        </p>

        {/* Stats Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-fym-card border border-fym-border text-xs sm:text-sm font-semibold text-slate-200 shadow-md">
            <Flame className="w-4 h-4 text-fym-accent" />
            <span>Reacciones en Vivo</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-fym-card border border-fym-border text-xs sm:text-sm font-semibold text-slate-200 shadow-md">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Debates de la Comunidad</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-fym-card border border-fym-border text-xs sm:text-sm font-semibold text-slate-200 shadow-md">
            <Trophy className="w-4 h-4 text-fym-gold" />
            <span>Club de Socios VIP</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <a
            href="https://whatsapp.com/channel/0029Vb6WOpE4IBhE9to6Du2U"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button variant="whatsapp" size="lg" className="shadow-2xl">
              <span>ENTRAR AL CANAL DE WHATSAPP</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </a>
        </div>

      </div>
    </header>
  );
}
