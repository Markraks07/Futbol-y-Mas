import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 py-20">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-fym-accent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-heading font-black text-fym-accent">
          FYM
        </div>
      </div>
      <span className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400">
        Cargando fútbol en vivo...
      </span>
    </div>
  );
}
