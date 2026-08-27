-- ==============================================================================
-- FÚTBOL Y MÁS (FYM) — SCHEMA DDL & RLS POLICIES (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Versión segura, idempotente y optimizada para la Fase 1.

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLA PROFILES (Vinculada a auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'socio_vip')),
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    favorite_team TEXT DEFAULT '',
    favorite_competition TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de búsqueda en perfiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Trigger para crear profile automáticamente tras registro en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url, role, xp, level)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'user',
        0,
        1
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- 3. TABLA NOTICIAS (NEWS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'LIGA',
    cover_image_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    views_count INTEGER NOT NULL DEFAULT 0 CHECK (views_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.news(category);


-- ==============================================================================
-- 4. TABLA DEBATES (DEBATES DE LA COMUNIDAD)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.debates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'DEBATE',
    cover_image_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debates_created_at ON public.debates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debates_category ON public.debates(category);
CREATE INDEX IF NOT EXISTS idx_debates_author ON public.debates(author_id);


-- ==============================================================================
-- 5. TABLA COMENTARIOS (COMMENTS EN NOTICIAS O DEBATES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE,
    news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT comment_target_check CHECK (
        (debate_id IS NOT NULL AND news_id IS NULL) OR
        (news_id IS NOT NULL AND debate_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_comments_debate ON public.comments(debate_id);
CREATE INDEX IF NOT EXISTS idx_comments_news ON public.comments(news_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);


-- ==============================================================================
-- 6. TABLA REACCIONES (REACTIONS 🔥 ⚽ 🧠 ❌)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('fuego', 'gol', 'factos', 'robo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_debate_reaction UNIQUE (debate_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_debate ON public.reactions(debate_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON public.reactions(user_id);


-- ==============================================================================
-- 7. TABLA ENCUESTAS (POLLS & VOTES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    order_num INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_poll_vote UNIQUE (poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option ON public.poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON public.poll_votes(user_id);


-- ==============================================================================
-- 8. TABLA PORRA (ROUNDS, MATCHES & PREDICTIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.porra_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    competition TEXT NOT NULL DEFAULT 'La Liga EA Sports',
    is_active BOOLEAN NOT NULL DEFAULT true,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.porra_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES public.porra_rounds(id) ON DELETE CASCADE,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT NOT NULL DEFAULT 'NS', -- NS: Not Started, LIVE, FT: Finished
    match_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.porra_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.porra_matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    predicted_home_score INTEGER NOT NULL CHECK (predicted_home_score >= 0 AND predicted_home_score <= 20),
    predicted_away_score INTEGER NOT NULL CHECK (predicted_away_score >= 0 AND predicted_away_score <= 20),
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_match_prediction UNIQUE (match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_porra_matches_round ON public.porra_matches(round_id);
CREATE INDEX IF NOT EXISTS idx_porra_predictions_match ON public.porra_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_porra_predictions_user ON public.porra_predictions(user_id);


-- ==============================================================================
-- 9. TABLA SOCIOS VIP (CLUB DE LOS 10)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.club_socios (
    carnet_num INTEGER PRIMARY KEY CHECK (carnet_num >= 1 AND carnet_num <= 10),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('active', 'locked')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inicializar los 10 carnets del Club de los 10
INSERT INTO public.club_socios (carnet_num, name, status)
VALUES
    (1, 'Pau (Fundador)', 'active'),
    (2, 'Vacante Especial #002', 'locked'),
    (3, 'Socio VIP #003', 'locked'),
    (4, 'Vacante Especial #004', 'locked'),
    (5, 'Socio VIP #005', 'locked'),
    (6, 'Socio VIP #006', 'locked'),
    (7, 'Socio VIP #007', 'locked'),
    (8, 'Socio VIP #008', 'locked'),
    (9, 'Socio VIP #009', 'locked'),
    (10, 'Socio VIP #010', 'locked')
ON CONFLICT (carnet_num) DO NOTHING;


-- ==============================================================================
-- 10. TABLA AJUSTES DEL SITIO & MÉTRICAS (SITE SETTINGS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.site_settings (key, value)
VALUES
    ('global_alert', '{"active": false, "text": "¡Únete a nuestro canal oficial de WhatsApp!", "link": "https://whatsapp.com/channel/0029Vb6WOpE4IBhE9to6Du2U"}'::jsonb),
    ('stats', '{"visits": 1250, "whatsapp_clicks": 340, "followers": 15000}'::jsonb),
    ('theme', '{"current": "dark", "auto": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;


-- ==============================================================================
-- 11. TABLA EVENTOS XP (XP EVENTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_events_user ON public.xp_events(user_id);


-- ==============================================================================
-- 12. FUNCIONES DE SEGURIDAD Y HELPERS (SECURITY DEFINER)
-- ==============================================================================

-- Helper: ¿Es admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: ¿Es staff (admin o moderador)?
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para impedir escalada de privilegios en PROFILES
-- (Un usuario no admin nunca puede cambiar role, xp ni level)
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Si no es admin y está intentando cambiar role, xp o level, restaurar valores anteriores
    IF NOT public.is_admin() THEN
        NEW.role := OLD.role;
        NEW.xp := OLD.xp;
        NEW.level := OLD.level;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_fields();

-- Función segura para otorgar XP
CREATE OR REPLACE FUNCTION public.grant_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Solo ejecutable por admin o backend autorizado
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'No autorizado para otorgar XP.';
    END IF;

    -- Registrar evento
    INSERT INTO public.xp_events (user_id, amount, reason)
    VALUES (p_user_id, p_amount, p_reason);

    -- Actualizar XP y recalcular nivel (ej: cada 100 XP sube de nivel)
    UPDATE public.profiles
    SET xp = xp + p_amount,
        level = 1 + FLOOR((xp + p_amount) / 100)::INTEGER,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista segura de resultados de encuestas (Agrega votos sin exponer la identidad del votante)
CREATE OR REPLACE VIEW public.poll_option_results AS
SELECT 
    po.id AS option_id,
    po.poll_id,
    po.option_text,
    po.order_num,
    COUNT(pv.id)::INTEGER AS votes_count
FROM public.poll_options po
LEFT JOIN public.poll_votes pv ON po.id = pv.option_id
GROUP BY po.id, po.poll_id, po.option_text, po.order_num;


-- ==============================================================================
-- 13. POLÍTICAS ROW LEVEL SECURITY (RLS) IDEMPOTENTES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.porra_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.porra_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.porra_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. PROFILES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles son visibles para todos" ON public.profiles;
CREATE POLICY "Profiles son visibles para todos" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil (no su rol)" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins pueden actualizar cualquier perfil" ON public.profiles;
CREATE POLICY "Admins pueden actualizar cualquier perfil" ON public.profiles
    FOR ALL USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- B. NEWS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Noticias publicadas son públicas" ON public.news;
CREATE POLICY "Noticias publicadas son públicas" ON public.news
    FOR SELECT USING (is_published = true OR public.is_staff());

DROP POLICY IF EXISTS "Staff puede crear noticias" ON public.news;
CREATE POLICY "Staff puede crear noticias" ON public.news
    FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff puede actualizar noticias" ON public.news;
CREATE POLICY "Staff puede actualizar noticias" ON public.news
    FOR UPDATE USING (public.is_staff());

DROP POLICY IF EXISTS "Admins pueden eliminar noticias" ON public.news;
CREATE POLICY "Admins pueden eliminar noticias" ON public.news
    FOR DELETE USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. DEBATES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Debates son públicos" ON public.debates;
CREATE POLICY "Debates son públicos" ON public.debates
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear debates" ON public.debates;
CREATE POLICY "Usuarios autenticados pueden crear debates" ON public.debates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Autores o admins pueden actualizar debates" ON public.debates;
CREATE POLICY "Autores o admins pueden actualizar debates" ON public.debates
    FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Autores o admins pueden eliminar debates" ON public.debates;
CREATE POLICY "Autores o admins pueden eliminar debates" ON public.debates
    FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- D. COMMENTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Comentarios son públicos" ON public.comments;
CREATE POLICY "Comentarios son públicos" ON public.comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden comentar" ON public.comments;
CREATE POLICY "Usuarios autenticados pueden comentar" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Autores o admins pueden eliminar comentarios" ON public.comments;
CREATE POLICY "Autores o admins pueden eliminar comentarios" ON public.comments
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- E. REACTIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Reacciones son públicas" ON public.reactions;
CREATE POLICY "Reacciones son públicas" ON public.reactions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden reaccionar" ON public.reactions;
CREATE POLICY "Usuarios autenticados pueden reaccionar" ON public.reactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden eliminar su propia reacción" ON public.reactions;
CREATE POLICY "Usuarios pueden eliminar su propia reacción" ON public.reactions
    FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- F. POLLS, POLL_OPTIONS & POLL_VOTES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Encuestas son públicas" ON public.polls;
CREATE POLICY "Encuestas son públicas" ON public.polls
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff gestiona encuestas" ON public.polls;
CREATE POLICY "Staff gestiona encuestas" ON public.polls
    FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Opciones de encuestas son públicas" ON public.poll_options;
CREATE POLICY "Opciones de encuestas son públicas" ON public.poll_options
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff gestiona opciones de encuestas" ON public.poll_options;
CREATE POLICY "Staff gestiona opciones de encuestas" ON public.poll_options
    FOR ALL USING (public.is_staff());

-- Votos privados: solo el propio usuario o staff puede leer sus votos directos
DROP POLICY IF EXISTS "Votos de encuestas son públicos" ON public.poll_votes;
DROP POLICY IF EXISTS "Votos de encuestas son privados para el usuario" ON public.poll_votes;
CREATE POLICY "Votos de encuestas son privados para el usuario" ON public.poll_votes
    FOR SELECT USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "Usuarios autenticados pueden votar en encuesta activa" ON public.poll_votes;
CREATE POLICY "Usuarios autenticados pueden votar en encuesta activa" ON public.poll_votes
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.polls
            WHERE id = poll_id 
              AND is_active = true
              AND starts_at <= NOW()
              AND (ends_at IS NULL OR ends_at > NOW())
        )
    );

-- ------------------------------------------------------------------------------
-- G. PORRA
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Jornadas de porra públicas" ON public.porra_rounds;
CREATE POLICY "Jornadas de porra públicas" ON public.porra_rounds
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff gestiona jornadas de porra" ON public.porra_rounds;
CREATE POLICY "Staff gestiona jornadas de porra" ON public.porra_rounds
    FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Partidos de porra públicos" ON public.porra_matches;
CREATE POLICY "Partidos de porra públicos" ON public.porra_matches
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff gestiona partidos de porra" ON public.porra_matches;
CREATE POLICY "Staff gestiona partidos de porra" ON public.porra_matches
    FOR ALL USING (public.is_staff());

-- Predicciones privadas: solo el propio usuario o staff puede consultar sus pronósticos
DROP POLICY IF EXISTS "Predicciones públicas" ON public.porra_predictions;
DROP POLICY IF EXISTS "Predicciones privadas para el propio usuario" ON public.porra_predictions;
CREATE POLICY "Predicciones privadas para el propio usuario" ON public.porra_predictions
    FOR SELECT USING (auth.uid() = user_id OR public.is_staff());

DROP POLICY IF EXISTS "Usuarios autenticados guardan sus predicciones" ON public.porra_predictions;
CREATE POLICY "Usuarios autenticados guardan sus predicciones" ON public.porra_predictions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.porra_matches m
            JOIN public.porra_rounds r ON m.round_id = r.id
            WHERE m.id = match_id
              AND r.is_active = true
              AND (r.deadline IS NULL OR r.deadline > NOW())
              AND m.match_date > NOW()
        )
    );

DROP POLICY IF EXISTS "Usuarios actualizan sus predicciones" ON public.porra_predictions;
CREATE POLICY "Usuarios actualizan sus predicciones" ON public.porra_predictions
    FOR UPDATE USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.porra_matches m
            JOIN public.porra_rounds r ON m.round_id = r.id
            WHERE m.id = match_id
              AND r.is_active = true
              AND (r.deadline IS NULL OR r.deadline > NOW())
              AND m.match_date > NOW()
        )
    );

-- ------------------------------------------------------------------------------
-- H. CLUB DE LOS 10 & SITE SETTINGS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Club de los 10 es público" ON public.club_socios;
CREATE POLICY "Club de los 10 es público" ON public.club_socios
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff gestiona socios" ON public.club_socios;
CREATE POLICY "Staff gestiona socios" ON public.club_socios
    FOR ALL USING (public.is_staff());

DROP POLICY IF EXISTS "Ajustes públicos legibles" ON public.site_settings;
CREATE POLICY "Ajustes públicos legibles" ON public.site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff gestiona ajustes" ON public.site_settings;
CREATE POLICY "Staff gestiona ajustes" ON public.site_settings
    FOR ALL USING (public.is_staff());

-- ------------------------------------------------------------------------------
-- I. XP EVENTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "XP events visibles para el usuario o admin" ON public.xp_events;
CREATE POLICY "XP events visibles para el usuario o admin" ON public.xp_events
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Solo sistema o admin otorga XP" ON public.xp_events;
CREATE POLICY "Solo sistema o admin otorga XP" ON public.xp_events
    FOR INSERT WITH CHECK (public.is_admin());


-- ==============================================================================
-- 14. CONFIGURACIÓN Y POLÍTICAS DE SUPABASE STORAGE
-- ==============================================================================

-- Creación / Actualización de Buckets con límites y tipos MIME permitidos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('news', 'news', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('debates', 'debates', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de Storage para AVATARS
DROP POLICY IF EXISTS "Avatares públicos" ON storage.objects;
CREATE POLICY "Avatares públicos" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuarios suben su avatar" ON storage.objects;
CREATE POLICY "Usuarios suben su avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid() IS NOT NULL AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Usuarios actualizan su avatar" ON storage.objects;
CREATE POLICY "Usuarios actualizan su avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Usuarios eliminan su avatar" ON storage.objects;
CREATE POLICY "Usuarios eliminan su avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Políticas de Storage para NEWS
DROP POLICY IF EXISTS "Imágenes de noticias públicas" ON storage.objects;
CREATE POLICY "Imágenes de noticias públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'news');

DROP POLICY IF EXISTS "Staff sube imágenes de noticias" ON storage.objects;
CREATE POLICY "Staff sube imágenes de noticias" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'news' AND 
        public.is_staff()
    );

DROP POLICY IF EXISTS "Staff actualiza imágenes de noticias" ON storage.objects;
CREATE POLICY "Staff actualiza imágenes de noticias" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'news' AND 
        public.is_staff()
    );

DROP POLICY IF EXISTS "Staff actualiza o borra imágenes de noticias" ON storage.objects;
DROP POLICY IF EXISTS "Staff elimina imágenes de noticias" ON storage.objects;
CREATE POLICY "Staff elimina imágenes de noticias" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'news' AND 
        public.is_staff()
    );

-- Políticas de Storage para DEBATES
DROP POLICY IF EXISTS "Imágenes de debates públicas" ON storage.objects;
CREATE POLICY "Imágenes de debates públicas" ON storage.objects
    FOR SELECT USING (bucket_id = 'debates');

DROP POLICY IF EXISTS "Usuarios autenticados suben imágenes a debates" ON storage.objects;
CREATE POLICY "Usuarios autenticados suben imágenes a debates" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'debates' AND 
        auth.uid() IS NOT NULL AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Usuarios actualizan imágenes de sus debates" ON storage.objects;
CREATE POLICY "Usuarios actualizan imágenes de sus debates" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'debates' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

DROP POLICY IF EXISTS "Usuarios eliminan imágenes de sus debates" ON storage.objects;
CREATE POLICY "Usuarios eliminan imágenes de sus debates" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'debates' AND 
        (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );
