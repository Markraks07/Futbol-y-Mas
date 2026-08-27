'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, User as UserIcon, Shield, Trophy, Flame, Newspaper, LogOut } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { Profile } from '@/types';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await authService.getCurrentUser();
        setProfile(data?.profile || null);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    if (confirm('¿Quieres cerrar tu sesión en FÚTBOL Y MÁS?')) {
      await authService.logout();
      window.location.href = '/';
    }
  };

  const navLinks = [
    { href: '/#panel-partidos', label: 'Partidos', icon: Flame },
    { href: '/#panel-porra', label: 'Zona Interactiva', icon: Trophy },
    { href: '/#panel-debates', label: 'Debates', icon: Newspaper },
    { href: '/#panel-vip', label: 'Club 10', icon: Shield },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-fym-nav/95 backdrop-blur-md border-b border-fym-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-fym-accent shadow-lg shadow-red-950/50 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="FYM Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-heading font-black text-2xl tracking-wider text-fym-accent group-hover:text-red-400 transition-colors">
              FÚTBOL Y MÁS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-heading font-bold text-sm uppercase text-slate-300 hover:text-fym-accent tracking-wider transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth / Profile Area */}
            {!loading && (
              <div className="flex items-center gap-3 pl-4 border-l border-fym-border">
                {profile ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-fym-border hover:border-fym-accent text-xs font-bold font-heading uppercase text-slate-200 transition-all"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-fym-gold" />
                      <span>{profile.display_name}</span>
                      <span className="text-[10px] text-fym-gold bg-yellow-500/10 px-1.5 py-0.5 rounded-full">
                        NV.{profile.level}
                      </span>
                    </Link>

                    {/* Admin Link if role is admin or moderator */}
                    {(profile.role === 'admin' || profile.role === 'moderator') && (
                      <Link
                        href="/admin"
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-fym-accent hover:bg-fym-accent hover:text-white text-xs font-heading font-bold uppercase transition-all"
                      >
                        ⚙️ Admin
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      title="Cerrar sesión"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/login">
                    <Button variant="primary" size="sm">
                      🔑 Entrar
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Abrir menú"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-fym-panel border-b border-fym-border px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-heading font-bold uppercase text-slate-200 hover:bg-slate-800 hover:text-fym-accent transition-colors"
            >
              <link.icon className="w-5 h-5 text-fym-accent" />
              {link.label}
            </Link>
          ))}

          <div className="pt-4 border-t border-fym-border space-y-2">
            {profile ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-900 border border-fym-border text-sm font-bold font-heading text-white"
                >
                  <span className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-fym-gold" />
                    {profile.display_name}
                  </span>
                  <span className="text-xs text-fym-gold">Nivel {profile.level}</span>
                </Link>

                {(profile.role === 'admin' || profile.role === 'moderator') && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block text-center py-2 rounded-lg bg-red-950/50 border border-fym-accent text-fym-accent font-heading font-bold text-sm"
                  >
                    ⚙️ Panel de Administración
                  </Link>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-red-400 border-red-900/40"
                >
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                <Button variant="primary" className="w-full">
                  🔑 Iniciar Sesión / Registrarse
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
