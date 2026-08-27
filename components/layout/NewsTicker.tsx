import React from 'react';

interface NewsTickerProps {
  headlines?: string[];
}

export function NewsTicker({ headlines }: NewsTickerProps) {
  const defaultHeadlines = [
    '🔥 ¡Bienvenido a FYM! Vota en los debates y decide el contenido deportivo de la semana.',
    '⚽ Únete al Canal de WhatsApp para ver noticias exclusivas y participar en sorteos.',
    '🏆 El Club de los 10 ya tiene sus primeros carnets entregados.',
    '🎯 Nueva jornada de Porra activa: ¡Introduce tu pronóstico antes del pitido inicial!',
  ];

  const items = headlines && headlines.length > 0 ? headlines : defaultHeadlines;

  return (
    <div className="bg-gradient-to-r from-[#111520] via-[#1a0c10] to-[#111520] border-b border-fym-accent/20 h-10 flex items-center px-4 overflow-hidden text-xs select-none">
      <div className="flex items-center gap-2 bg-fym-accent text-white font-heading font-black px-3 py-1 rounded shadow-md shadow-red-950/50 uppercase tracking-wider shrink-0 z-10">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        ÚLTIMA HORA
      </div>

      <div className="flex-1 overflow-hidden relative ml-4">
        <div className="flex gap-12 whitespace-nowrap animate-ticker hover:[animation-play-state:paused]">
          {items.concat(items).map((text, idx) => (
            <span key={idx} className="text-slate-300 font-medium inline-flex items-center gap-2">
              <span className="text-fym-accent">⚡</span> {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
