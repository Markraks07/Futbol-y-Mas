import React from 'react';
import { Card } from '@/components/ui/Card';
import { ClubSocio } from '@/types';
import { Shield, Lock } from 'lucide-react';

interface ClubDiezProps {
  socios?: ClubSocio[];
}

export function ClubDiez({ socios }: ClubDiezProps) {
  const defaultSocios: ClubSocio[] = [
    { carnet_num: 1, name: 'Pau (Fundador)', status: 'active', user_id: null, updated_at: '' },
    { carnet_num: 2, name: 'Vacante Especial', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 3, name: 'Socio VIP #003', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 4, name: 'Vacante Especial', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 5, name: 'Socio VIP #005', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 6, name: 'Socio VIP #006', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 7, name: 'Socio VIP #007', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 8, name: 'Socio VIP #008', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 9, name: 'Socio VIP #009', status: 'locked', user_id: null, updated_at: '' },
    { carnet_num: 10, name: 'Socio VIP #010', status: 'locked', user_id: null, updated_at: '' },
  ];

  const items = socios && socios.length > 0 ? socios : defaultSocios;

  return (
    <section id="panel-vip" className="my-14">
      <div className="text-center space-y-2 mb-8">
        <h2 className="font-heading font-black text-3xl uppercase tracking-wider text-fym-gold flex items-center justify-center gap-2">
          <Shield className="w-7 h-7 text-fym-gold" />
          <span>CLUB DE LOS 10</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
          Los miembros fundadores y dueños simbólicos de la comunidad. Solo 10 plazas exclusivas.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {items.map((s) => {
          const isActive = s.status === 'active';
          return (
            <Card
              key={s.carnet_num}
              className={`text-center p-4 transition-all duration-300 ${
                isActive
                  ? 'border-fym-gold/50 bg-gradient-to-b from-yellow-950/20 to-fym-card shadow-lg shadow-yellow-950/20 hover:scale-105'
                  : 'opacity-40 grayscale hover:opacity-60'
              }`}
            >
              <div className="flex justify-center mb-2">
                {isActive ? (
                  <span className="text-2xl">🥇</span>
                ) : (
                  <Lock className="w-5 h-5 text-slate-500" />
                )}
              </div>

              <span className="font-heading font-black text-xl text-fym-gold block mb-1">
                #{s.carnet_num.toString().padStart(3, '0')}
              </span>

              <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                {s.name}
              </h4>

              <span className="text-[10px] font-bold uppercase tracking-widest mt-2 block text-muted">
                {isActive ? '🟢 Activo' : '🔒 Vacante'}
              </span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
