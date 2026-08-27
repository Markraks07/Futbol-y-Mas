'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await authService.register(email, password, displayName);
      setSuccessMsg('¡Cuenta creada correctamente! Redirigiendo a FYM...');
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(
        err.message?.includes('User already registered')
          ? 'Este correo ya está registrado en la plataforma.'
          : err.message || 'Error al crear la cuenta'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setErrorMsg('No se pudo conectar con Google: ' + err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card variant="panel" className="w-full max-w-md border-fym-border/80 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-fym-accent mx-auto shadow-lg shadow-red-950/50">
            <Image src="/logo.png" alt="FYM Logo" fill className="object-cover" />
          </div>
          <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
            FÚTBOL Y MÁS
          </h1>
          <p className="text-xs text-muted">Únete a la mayor comunidad de fútbol</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 border border-fym-border p-1 rounded-lg mb-6">
          <Link
            href="/login"
            className="flex-1 text-center py-2 rounded-md font-heading font-bold text-xs uppercase text-muted hover:text-white transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="flex-1 text-center py-2 rounded-md font-heading font-bold text-xs uppercase bg-fym-accent text-white shadow-md"
          >
            Registrarse
          </Link>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-fym-accent text-red-300 text-xs font-medium mb-4">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-medium mb-4">
            ✅ {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5 font-heading">
              Nombre de Usuario o Apodo
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ej: Marcos Costa"
              className="w-full bg-slate-900 border border-fym-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-fym-accent focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5 font-heading">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-slate-900 border border-fym-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-fym-accent focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5 font-heading">
              Contraseña (Mín. 6 caracteres)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-fym-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-fym-accent focus:ring-1 focus:ring-red-500"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
            CREAR CUENTA
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-fym-border" />
          </div>
          <span className="relative bg-fym-panel px-3 text-[11px] font-bold uppercase text-muted">
            O continúa con
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-slate-900 border border-fym-border hover:border-slate-600 text-sm font-bold text-white transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google</span>
        </button>

      </Card>
    </div>
  );
}
