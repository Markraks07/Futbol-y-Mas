import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card variant="panel" className="text-center p-8 sm:p-12 max-w-md space-y-4">
        <div className="text-5xl">⚽❌</div>
        <h2 className="font-heading font-black text-3xl text-fym-accent uppercase tracking-wider">
          FUERA DE JUEGO (404)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          La página que buscas no existe o ha sido movida a otra posición del campo.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button variant="primary">
              VOLVER AL INICIO
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
