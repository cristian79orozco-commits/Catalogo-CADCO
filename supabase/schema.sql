-- ============================================================================
-- CADCO Catalog · Supabase Schema & Blindaje RLS (Zero-Trust Frontend)
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase.
-- ============================================================================

-- 1. Lista blanca de administradores autorizados
--    Incluso si alguien creara una cuenta en Auth, NO podrá escribir nada
--    a menos que su auth.users.id esté registrado aquí por ti desde el dashboard.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view own admin record" ON public.admin_users;
CREATE POLICY "Admin can view own admin record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Bloquear explícitamente cualquier escritura desde API pública en admin_users
DROP POLICY IF EXISTS "No public writes on admin_users" ON public.admin_users;
CREATE POLICY "No public writes on admin_users"
  ON public.admin_users
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- 2. Función verificadora segura (SECURITY DEFINER + search_path fijo)
CREATE OR REPLACE FUNCTION public.is_cadco_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_cadco_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_cadco_admin() TO anon, authenticated;

-- 3. Tabla de Proyectos CAD
CREATE TABLE IF NOT EXISTS public.catalog_projects (
  id text PRIMARY KEY,
  code text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  category text NOT NULL CHECK (category IN ('mecanico', 'planimetria', 'ensambles', 'superficies')),
  quick_summary text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  model_type text NOT NULL,
  custom_cad_file jsonb,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  solidworks_modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.catalog_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read catalog_projects" ON public.catalog_projects;
CREATE POLICY "Public read catalog_projects"
  ON public.catalog_projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin insert catalog_projects" ON public.catalog_projects;
CREATE POLICY "Admin insert catalog_projects"
  ON public.catalog_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin update catalog_projects" ON public.catalog_projects;
CREATE POLICY "Admin update catalog_projects"
  ON public.catalog_projects
  FOR UPDATE
  TO authenticated
  USING (public.is_cadco_admin())
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin delete catalog_projects" ON public.catalog_projects;
CREATE POLICY "Admin delete catalog_projects"
  ON public.catalog_projects
  FOR DELETE
  TO authenticated
  USING (public.is_cadco_admin());

-- 4. Tabla de Certificados Oficiales
CREATE TABLE IF NOT EXISTS public.digital_certificates (
  id text PRIMARY KEY,
  code text NOT NULL,
  title text NOT NULL,
  issuer text NOT NULL DEFAULT '',
  credential_id text NOT NULL DEFAULT '',
  issue_date text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_data_url text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read digital_certificates" ON public.digital_certificates;
CREATE POLICY "Public read digital_certificates"
  ON public.digital_certificates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin insert digital_certificates" ON public.digital_certificates;
CREATE POLICY "Admin insert digital_certificates"
  ON public.digital_certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin update digital_certificates" ON public.digital_certificates;
CREATE POLICY "Admin update digital_certificates"
  ON public.digital_certificates
  FOR UPDATE
  TO authenticated
  USING (public.is_cadco_admin())
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin delete digital_certificates" ON public.digital_certificates;
CREATE POLICY "Admin delete digital_certificates"
  ON public.digital_certificates
  FOR DELETE
  TO authenticated
  USING (public.is_cadco_admin());

-- 5. Tabla de Rutas de Capacitación (CSWA / CSWP)
CREATE TABLE IF NOT EXISTS public.training_tracks (
  code text PRIMARY KEY CHECK (code IN ('CSWA', 'CSWP')),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  exam_format text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  deliverables jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.training_tracks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read training_tracks" ON public.training_tracks;
CREATE POLICY "Public read training_tracks"
  ON public.training_tracks
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin insert training_tracks" ON public.training_tracks;
CREATE POLICY "Admin insert training_tracks"
  ON public.training_tracks
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin update training_tracks" ON public.training_tracks;
CREATE POLICY "Admin update training_tracks"
  ON public.training_tracks
  FOR UPDATE
  TO authenticated
  USING (public.is_cadco_admin())
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin delete training_tracks" ON public.training_tracks;
CREATE POLICY "Admin delete training_tracks"
  ON public.training_tracks
  FOR DELETE
  TO authenticated
  USING (public.is_cadco_admin());

-- 6. Tabla de Configuración de Marca y Contacto (sin PIN expuesto)
CREATE TABLE IF NOT EXISTS public.brand_config (
  id text PRIMARY KEY DEFAULT 'default',
  brand_name text NOT NULL,
  hero_badge text NOT NULL DEFAULT '',
  hero_title_prefix text NOT NULL DEFAULT '',
  hero_title_highlight text NOT NULL DEFAULT '',
  hero_title_suffix text NOT NULL DEFAULT '',
  hero_subtitle text NOT NULL DEFAULT '',
  contact_title text NOT NULL DEFAULT '',
  contact_subtitle text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  whatsapp_number text NOT NULL DEFAULT '',
  hero_cad_file jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_config ADD COLUMN IF NOT EXISTS hero_cad_file jsonb;

ALTER TABLE public.brand_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read brand_config" ON public.brand_config;
CREATE POLICY "Public read brand_config"
  ON public.brand_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin insert brand_config" ON public.brand_config;
CREATE POLICY "Admin insert brand_config"
  ON public.brand_config
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin update brand_config" ON public.brand_config;
CREATE POLICY "Admin update brand_config"
  ON public.brand_config
  FOR UPDATE
  TO authenticated
  USING (public.is_cadco_admin())
  WITH CHECK (public.is_cadco_admin());

DROP POLICY IF EXISTS "Admin delete brand_config" ON public.brand_config;
CREATE POLICY "Admin delete brand_config"
  ON public.brand_config
  FOR DELETE
  TO authenticated
  USING (public.is_cadco_admin());

-- 7. Activar Supabase Realtime para sincronización instantánea entre PC, móvil y clientes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'catalog_projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.catalog_projects;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'digital_certificates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_certificates;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'training_tracks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.training_tracks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'brand_config'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_config;
  END IF;
END $$;
