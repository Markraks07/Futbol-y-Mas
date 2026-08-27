'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authService } from '@/services/auth.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.resetPassword(email);
      setSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo enviar el correo de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card variant="panel" className="w-full max-w-md border-fym-border/80 shadow-2xl">
        
        <div className="text-center space-y-3 mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-fym-accent mx-auto shadow-lg shadow-red-950/50">
            <Image src="/logo.png" alt="FYM Logo" fill className="object-cover" />
          </div>
          <h1 className="font-heading font-black text-2xl uppercase tracking-wider text-white">
            RECUPERAR CONTRASEÑA
          </h1>
          <p className="text-xs text-muted">
            Introduce tu correo y te enviaremos un enlace seguro para restablecerla.
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl">
            <div className="text-3xl">📩</div>
            <h3 className="font-heading font-bold text-lg text-emerald-300 uppercase">
              ¡Correo enviado!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Revisa tu bandeja de entrada en <strong className="text-white">{email}</strong> y sigue las instrucciones para crear una nueva contraseña.
            </p>
            <Link href="/login" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Volver a Iniciar Sesión
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-fym-accent text-red-300 text-xs font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

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

            <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
              ENVIAR ENLACE DE RECUPERACIÓN
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Iniciar Sesión</span>
              </Link>
            </div>
          </form>
        )}

      </Card>
    </div>
  );
}
