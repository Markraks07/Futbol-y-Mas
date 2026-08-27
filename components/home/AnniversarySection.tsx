'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

export function AnniversarySection() {
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isOver: false,
  });

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(`September 13, ${currentYear} 00:00:00`).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference < 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00', isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        isOver: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="my-14 relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/40 p-6 sm:p-10 shadow-2xl shadow-black/80">
      
      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center space-y-6 max-w-3xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-fym-gold font-heading font-bold text-xs uppercase tracking-widest">
          🎉 EVENTO ESPECIAL COMUNIDAD
        </div>

        <h2 className="font-heading font-black text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-fym-gold uppercase">
          1.º ANIVERSARIO DE FÚTBOL Y MÁS
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          El 13 de septiembre será un día histórico. Empezamos con 0 seguidores compartiendo noticias con familia y amigos, y hoy somos una comunidad de miles. ¡Gracias por estar ahí!
        </p>

        {/* Cuenta Atrás */}
        {timeLeft.isOver ? (
          <div className="py-4">
            <h3 className="font-heading font-black text-3xl text-fym-gold animate-bounce">
              ¡HOY ES NUESTRO ANIVERSARIO! 🎉
            </h3>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-6 py-4 flex-wrap">
            <div className="w-16 sm:w-20 p-3 rounded-2xl bg-slate-950/80 border border-yellow-500/20 backdrop-blur-md shadow-lg">
              <span className="font-heading font-black text-2xl sm:text-3xl text-fym-gold block">
                {timeLeft.days}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Días</span>
            </div>

            <div className="w-16 sm:w-20 p-3 rounded-2xl bg-slate-950/80 border border-yellow-500/20 backdrop-blur-md shadow-lg">
              <span className="font-heading font-black text-2xl sm:text-3xl text-fym-gold block">
                {timeLeft.hours}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Horas</span>
            </div>

            <div className="w-16 sm:w-20 p-3 rounded-2xl bg-slate-950/80 border border-yellow-500/20 backdrop-blur-md shadow-lg">
              <span className="font-heading font-black text-2xl sm:text-3xl text-fym-gold block">
                {timeLeft.minutes}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Mins</span>
            </div>

            <div className="w-16 sm:w-20 p-3 rounded-2xl bg-slate-950/80 border border-yellow-500/20 backdrop-blur-md shadow-lg">
              <span className="font-heading font-black text-2xl sm:text-3xl text-fym-gold block">
                {timeLeft.seconds}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Segs</span>
            </div>
          </div>
        )}

        {/* Tarjetas de Hitos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <Card className="bg-white/5 border-white/10 p-4">
            <h4 className="font-heading font-bold text-sm text-fym-gold flex items-center gap-2 mb-2">
              🎁 Sorpresas y Retos
            </h4>
            <p className="text-xs text-slate-300">
              Juegos, retos, encuestas y premios especiales preparados para celebrar junto a toda la afición.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-4">
            <h4 className="font-heading font-bold text-sm text-fym-gold flex items-center gap-2 mb-2">
              🎟️ Carnets Exclusivos
            </h4>
            <p className="text-xs text-slate-300">
              Entrega oficial de los carnets de socio VIP Nº 002 y Nº 004 a los miembros más participativos.
            </p>
          </Card>

          <Card className="bg-white/5 border-white/10 p-4">
            <h4 className="font-heading font-bold text-sm text-fym-gold flex items-center gap-2 mb-2">
              🚀 Esto acaba de empezar
            </h4>
            <p className="text-xs text-slate-300">
              Seguimos creciendo día a día con más noticias, debates interactivos y pasión por el fútbol.
            </p>
          </Card>
        </div>

      </div>
    </section>
  );
}
