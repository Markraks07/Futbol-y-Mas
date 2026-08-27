'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { newsService } from '@/services/news.service';
import { storageService } from '@/services/storage.service';
import { pollsService } from '@/services/polls.service';
import { Profile, News, Debate, ClubSocio } from '@/types';
import { LayoutDashboard, Newspaper, Users, Trophy, Shield, Settings, Plus, Trash2, Edit, Upload } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'users' | 'polls' | 'socios' | 'settings'>('dashboard');
  const [users, setUsers] = useState<Profile[]>([]);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [socios, setSocios] = useState<ClubSocio[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states para Crear Noticia
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('LIGA');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCoverFile, setNewsCoverFile] = useState<File | null>(null);
  const [creatingNews, setCreatingNews] = useState(false);

  // Form states para Encuesta
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');
  const [pollOpt3, setPollOpt3] = useState('');
  const [pollOpt4, setPollOpt4] = useState('');
  const [creatingPoll, setCreatingPoll] = useState(false);

  // Form states para Socio
  const [socioNum, setSocioNum] = useState<number>(1);
  const [socioName, setSocioName] = useState('');
  const [socioStatus, setSocioStatus] = useState<'active' | 'locked'>('active');

  const supabase = createClient();

  useEffect(() => {
    async function loadAdminData() {
      try {
        const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (usersData) setUsers(usersData as Profile[]);

        const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
        if (newsData) setNewsList(newsData as News[]);

        const { data: sociosData } = await supabase.from('club_socios').select('*').order('carnet_num', { ascending: true });
        if (sociosData) setSocios(sociosData as ClubSocio[]);
      } catch (err) {
        console.error('Error cargando panel admin:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingNews(true);
    try {
      let coverUrl = null;
      if (newsCoverFile) {
        coverUrl = await storageService.uploadImage('news', newsCoverFile);
      }

      const newPost = await newsService.createNews({
        title: newsTitle,
        category: newsCategory,
        excerpt: newsExcerpt,
        content: newsContent,
        cover_image_url: coverUrl,
        slug: '',
        author_id: null,
        is_featured: false,
        is_published: true,
      });

      setNewsList([newPost, ...newsList]);
      setNewsTitle('');
      setNewsExcerpt('');
      setNewsContent('');
      setNewsCoverFile(null);
      alert('¡Noticia publicada con éxito en Supabase!');
    } catch (err: any) {
      alert('Error creando noticia: ' + err.message);
    } finally {
      setCreatingNews(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta noticia?')) {
      try {
        await newsService.deleteNews(id);
        setNewsList(newsList.filter((n) => n.id !== id));
      } catch (err: any) {
        alert('Error eliminando noticia: ' + err.message);
      }
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'user' | 'moderator' | 'admin' | 'socio_vip') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      alert(`Rol actualizado a ${newRole}`);
    } catch (err: any) {
      alert('Error actualizando rol: ' + err.message);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPoll(true);
    try {
      const options = [pollOpt1, pollOpt2, pollOpt3, pollOpt4].filter((o) => o.trim() !== '');
      if (options.length < 2) {
        alert('Debes incluir al menos 2 opciones.');
        return;
      }

      await pollsService.createPoll(pollQuestion, options);
      setPollQuestion('');
      setPollOpt1('');
      setPollOpt2('');
      setPollOpt3('');
      setPollOpt4('');
      alert('¡Encuesta creada y fijada como activa!');
    } catch (err: any) {
      alert('Error creando encuesta: ' + err.message);
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleUpdateSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('club_socios')
        .upsert({
          carnet_num: socioNum,
          name: socioName,
          status: socioStatus,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSocios(
        socios.map((s) => (s.carnet_num === socioNum ? { ...s, name: socioName, status: socioStatus } : s))
      );
      alert(`Carnet #${socioNum} actualizado con éxito.`);
    } catch (err: any) {
      alert('Error actualizando carnet: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      
      {/* Sidebar Responsive */}
      <aside className="w-full md:w-64 bg-fym-panel border-r border-fym-border p-4 md:p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-heading font-black text-xl text-white">FYM SAAS</span>
            <span className="px-2 py-0.5 rounded bg-fym-accent/20 border border-fym-accent/30 text-fym-accent font-bold text-[10px]">
              ADMIN
            </span>
          </div>

          <nav className="space-y-1.5 flex flex-row md:flex-col overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-fym-accent text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Panel General</span>
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-colors cursor-pointer ${
                activeTab === 'news' ? 'bg-fym-accent text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Noticias y Debates</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-fym-accent text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('polls')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-colors cursor-pointer ${
                activeTab === 'polls' ? 'bg-fym-accent text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Encuestas / Porras</span>
            </button>

            <button
              onClick={() => setActiveTab('socios')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-heading font-bold uppercase transition-colors cursor-pointer ${
                activeTab === 'socios' ? 'bg-fym-accent text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Club de los 10</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-fym-border mt-6">
          <Link href="/" className="block text-center py-2 rounded-lg bg-slate-900 border border-fym-border text-xs font-bold uppercase text-slate-300 hover:text-white">
            🌐 Ver Web Pública
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* PESTAÑA 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="font-heading font-black text-2xl uppercase text-white">
              Resumen de la Comunidad
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5">
                <span className="text-xs uppercase font-bold text-muted block mb-1">Usuarios Registrados</span>
                <span className="font-heading font-black text-3xl text-white">{users.length}</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs uppercase font-bold text-muted block mb-1">Noticias Publicadas</span>
                <span className="font-heading font-black text-3xl text-fym-accent">{newsList.length}</span>
              </Card>

              <Card className="p-5">
                <span className="text-xs uppercase font-bold text-muted block mb-1">Socios Club 10 Activos</span>
                <span className="font-heading font-black text-3xl text-fym-gold">
                  {socios.filter((s) => s.status === 'active').length} / 10
                </span>
              </Card>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: NOTICIAS & STORAGE */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formulario Crear */}
            <Card variant="panel" className="space-y-4">
              <h2 className="font-heading font-bold text-xl uppercase text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-fym-accent" />
                <span>Publicar Noticia en Supabase</span>
              </h2>

              <form onSubmit={handleCreateNews} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Categoría</label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                  >
                    <option value="LIGA">🇪🇸 La Liga</option>
                    <option value="CHAMPIONS">🏆 Champions League</option>
                    <option value="FICHAJES">⚽ Fichajes</option>
                    <option value="DEBATE">🔴 Debate</option>
                    <option value="POLÉMICA">🧠 Polémica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Titular</label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Ej: Análisis del Clásico..."
                    className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Resumen / Entradilla</label>
                  <textarea
                    rows={2}
                    required
                    value={newsExcerpt}
                    onChange={(e) => setNewsExcerpt(e.target.value)}
                    placeholder="Breve resumen..."
                    className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Contenido Completo</label>
                  <textarea
                    rows={4}
                    required
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Cuerpo de la noticia..."
                    className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-muted mb-1">Imagen de Portada (Storage bucket: news)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewsCoverFile(e.target.files?.[0] || null)}
                    className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-fym-accent file:text-white file:font-bold"
                  />
                </div>

                <Button type="submit" variant="primary" isLoading={creatingNews} className="w-full">
                  PUBLICAR NOTICIA
                </Button>
              </form>
            </Card>

            {/* Listado de Noticias */}
            <Card variant="panel" className="space-y-4">
              <h2 className="font-heading font-bold text-xl uppercase text-white">
                Noticias Activas ({newsList.length})
              </h2>

              <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
                {newsList.length === 0 ? (
                  <p className="text-xs text-muted">No hay noticias publicadas aún.</p>
                ) : (
                  newsList.map((n) => (
                    <div key={n.id} className="p-3 bg-slate-900 border border-fym-border rounded-lg flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-fym-accent">[{n.category}]</span>
                        <h4 className="font-bold text-white text-sm">{n.title}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteNews(n.id)}
                        className="p-2 text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar noticia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

          </div>
        )}

        {/* PESTAÑA 3: GESTIÓN DE USUARIOS */}
        {activeTab === 'users' && (
          <Card variant="panel" className="space-y-4">
            <h2 className="font-heading font-bold text-xl uppercase text-white">
              Gestión de Roles y Usuarios de la Comunidad
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-fym-border text-muted uppercase">
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Rol Actual</th>
                    <th className="p-3">XP / Nivel</th>
                    <th className="p-3">Acciones de Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fym-border/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="p-3">
                        <strong className="text-white block">{u.display_name}</strong>
                        <span className="text-muted">@{u.username}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-slate-900 border border-fym-border text-fym-gold">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {u.xp} XP (Nivel {u.level})
                      </td>
                      <td className="p-3 space-x-2">
                        {u.role !== 'admin' ? (
                          <button
                            onClick={() => handleChangeRole(u.id, 'admin')}
                            className="px-2 py-1 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold uppercase hover:bg-red-800 hover:text-white"
                          >
                            Hacer Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChangeRole(u.id, 'user')}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase hover:bg-slate-700 hover:text-white"
                          >
                            Quitar Admin
                          </button>
                        )}

                        <button
                          onClick={() => handleChangeRole(u.id, u.role === 'socio_vip' ? 'user' : 'socio_vip')}
                          className="px-2 py-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-800 text-[10px] font-bold uppercase hover:bg-yellow-800 hover:text-white"
                        >
                          {u.role === 'socio_vip' ? 'Quitar VIP' : 'Asignar VIP'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* PESTAÑA 4: ENCUESTAS & PORRAS */}
        {activeTab === 'polls' && (
          <Card variant="panel" className="max-w-xl space-y-4">
            <h2 className="font-heading font-bold text-xl uppercase text-white">
              Crear Nueva Encuesta de la Semana
            </h2>

            <form onSubmit={handleCreatePoll} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Pregunta</label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ej: ¿Quién debe ser el MVP del mes?"
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Opción 1</label>
                <input
                  type="text"
                  required
                  value={pollOpt1}
                  onChange={(e) => setPollOpt1(e.target.value)}
                  placeholder="Opción A"
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Opción 2</label>
                <input
                  type="text"
                  required
                  value={pollOpt2}
                  onChange={(e) => setPollOpt2(e.target.value)}
                  placeholder="Opción B"
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Opción 3 (Opcional)</label>
                <input
                  type="text"
                  value={pollOpt3}
                  onChange={(e) => setPollOpt3(e.target.value)}
                  placeholder="Opción C"
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Opción 4 (Opcional)</label>
                <input
                  type="text"
                  value={pollOpt4}
                  onChange={(e) => setPollOpt4(e.target.value)}
                  placeholder="Opción D"
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>

              <Button type="submit" variant="primary" isLoading={creatingPoll} className="w-full">
                LANZAR ENCUESTA
              </Button>
            </form>
          </Card>
        )}

        {/* PESTAÑA 5: CLUB DE LOS 10 */}
        {activeTab === 'socios' && (
          <Card variant="panel" className="max-w-xl space-y-4">
            <h2 className="font-heading font-bold text-xl uppercase text-fym-gold">
              Gestión del Club de los 10
            </h2>

            <form onSubmit={handleUpdateSocio} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Número de Carnet (1 al 10)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={socioNum}
                  onChange={(e) => setSocioNum(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Nombre del Socio</label>
                <input
                  type="text"
                  required
                  value={socioName}
                  onChange={(e) => setSocioName(e.target.value)}
                  placeholder="Ej: Pau (Fundador)"
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted mb-1">Estado</label>
                <select
                  value={socioStatus}
                  onChange={(e) => setSocioStatus(e.target.value as 'active' | 'locked')}
                  className="w-full bg-slate-900 border border-fym-border rounded-lg p-2 text-sm text-white outline-none"
                >
                  <option value="active">🟢 Activo / Ocupado</option>
                  <option value="locked">🔒 Vacante / Bloqueado</option>
                </select>
              </div>

              <Button type="submit" variant="gold" className="w-full">
                ACTUALIZAR CARNET
              </Button>
            </form>
          </Card>
        )}

      </main>
    </div>
  );
}
