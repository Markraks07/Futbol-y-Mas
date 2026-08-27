import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-fym-nav border-t border-fym-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Columna 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-fym-accent">
                <Image src="/logo.png" alt="FYM Logo" fill className="object-cover" />
              </div>
              <span className="font-heading font-black text-xl text-white tracking-wider">
                FÚTBOL Y MÁS
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              La plataforma interactiva de fútbol donde no solo lees las noticias, sino que las decides. Opina, vota, reacciona y compite en tiempo real con miles de fanáticos del deporte rey.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://whatsapp.com/channel/0029Vb6WOpE4IBhE9to6Du2U"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-heading font-bold uppercase transition-all"
              >
                ⚽ Canal de WhatsApp
              </a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold uppercase text-white tracking-wider text-sm">
              Comunidad
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#panel-partidos" className="hover:text-fym-accent transition-colors">
                  Partidos en Directo
                </Link>
              </li>
              <li>
                <Link href="/#panel-porra" className="hover:text-fym-accent transition-colors">
                  Porra Semanal
                </Link>
              </li>
              <li>
                <Link href="/#panel-debates" className="hover:text-fym-accent transition-colors">
                  Debates de Fútbol
                </Link>
              </li>
              <li>
                <Link href="/#panel-vip" className="hover:text-fym-accent transition-colors">
                  Club de los 10
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal & Cuenta */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold uppercase text-white tracking-wider text-sm">
              Acceso
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/login" className="hover:text-fym-accent transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-fym-accent transition-colors">
                  Crear Cuenta
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="hover:text-fym-accent transition-colors">
                  Mi Perfil y XP
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-fym-accent transition-colors text-xs text-slate-600">
                  Panel de Administración
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-fym-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FÚTBOL Y MÁS (FYM). Todos los derechos reservados.</p>
          <p className="italic">El fútbol se vive y se decide con la comunidad. 🫶⚽</p>
        </div>
      </div>
    </footer>
  );
}
