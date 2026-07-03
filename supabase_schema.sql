-- ====================================================================
-- SCRIPT DE REPARACIÓN Y ACTUALIZACIÓN - SYNFLOW IA CRM (SUPABASE)
-- Ejecuta TODO este script en el editor SQL de tu proyecto Supabase.
-- Esto corregirá los problemas de guardado de datos.
-- ====================================================================

-- ============================================================
-- PASO 1: ELIMINAR TABLAS EXISTENTES PARA RECREARLAS LIMPIAS
-- (Esto borra los datos actuales para evitar conflictos de schema)
-- ============================================================
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS crm_config CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- ============================================================
-- PASO 2: RECREAR TODAS LAS TABLAS CON EL SCHEMA CORRECTO
-- ============================================================

-- 1. Leads (Solicitudes de clientes)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company TEXT,
    service TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Nuevo' 
        CHECK (status IN ('Nuevo', 'Contactado', 'Cotizado', 'Descartado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5)
);

-- 2. Cotizaciones Comerciales
-- CORRECCIÓN IMPORTANTE: status usa 'Proceso' y 'Completado' (igual que el código frontend)
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    client TEXT NOT NULL,
    services TEXT NOT NULL,
    hours_engineering NUMERIC NOT NULL DEFAULT 0,
    hours_architecture NUMERIC NOT NULL DEFAULT 0,
    hours_development NUMERIC NOT NULL DEFAULT 0,
    rate_engineering NUMERIC NOT NULL DEFAULT 0,
    rate_architecture NUMERIC NOT NULL DEFAULT 0,
    rate_development NUMERIC NOT NULL DEFAULT 0,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pendiente' 
        CHECK (status IN ('Pendiente', 'Proceso', 'Completado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Testimonios / Opiniones
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT 'https://randomuser.me/api/portraits/men/1.jpg',
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    service TEXT NOT NULL DEFAULT 'Otro / Contacto General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Configuración de tarifas del CRM
CREATE TABLE crm_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    rate_engineering NUMERIC NOT NULL DEFAULT 120000,
    rate_architecture NUMERIC NOT NULL DEFAULT 140000,
    rate_development NUMERIC NOT NULL DEFAULT 90000,
    tax_percentage NUMERIC NOT NULL DEFAULT 19,
    notification_email TEXT DEFAULT 'synflow.ia@gmail.com',
    email_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Usuarios Administradores
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- PASO 3: DESHABILITAR RLS EN TODAS LAS TABLAS
-- Esto permite acceso directo con el Anon Key sin restricciones
-- ============================================================
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- PASO 4: POLÍTICAS ABIERTAS (por si Supabase fuerza RLS)
-- ============================================================

-- Leads: cualquiera puede insertar (formulario público) y el admin puede leer/editar/borrar
DROP POLICY IF EXISTS "leads_insert_public" ON leads;
CREATE POLICY "leads_insert_public" ON leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "leads_select_all" ON leads;
CREATE POLICY "leads_select_all" ON leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "leads_update_all" ON leads;
CREATE POLICY "leads_update_all" ON leads FOR UPDATE USING (true);
DROP POLICY IF EXISTS "leads_delete_all" ON leads;
CREATE POLICY "leads_delete_all" ON leads FOR DELETE USING (true);

-- Quotes
DROP POLICY IF EXISTS "quotes_all" ON quotes;
CREATE POLICY "quotes_all" ON quotes FOR ALL USING (true) WITH CHECK (true);

-- Testimonials: cualquiera puede insertar (desde la landing) y el admin gestiona
DROP POLICY IF EXISTS "testimonials_insert_public" ON testimonials;
CREATE POLICY "testimonials_insert_public" ON testimonials FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "testimonials_select_all" ON testimonials;
CREATE POLICY "testimonials_select_all" ON testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS "testimonials_update_all" ON testimonials;
CREATE POLICY "testimonials_update_all" ON testimonials FOR UPDATE USING (true);
DROP POLICY IF EXISTS "testimonials_delete_all" ON testimonials;
CREATE POLICY "testimonials_delete_all" ON testimonials FOR DELETE USING (true);

-- CRM Config
DROP POLICY IF EXISTS "crm_config_all" ON crm_config;
CREATE POLICY "crm_config_all" ON crm_config FOR ALL USING (true) WITH CHECK (true);

-- Admin Users
DROP POLICY IF EXISTS "admin_users_insert" ON admin_users;
CREATE POLICY "admin_users_insert" ON admin_users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "admin_users_select" ON admin_users;
CREATE POLICY "admin_users_select" ON admin_users FOR SELECT USING (true);

-- ============================================================
-- PASO 5: DATOS SEMILLA INICIALES
-- ============================================================

-- Configuración de tarifas
INSERT INTO crm_config (id, rate_engineering, rate_architecture, rate_development, tax_percentage, notification_email, email_active)
VALUES (1, 150000, 120000, 90000, 19, 'synflow.ia@gmail.com', true)
ON CONFLICT (id) DO UPDATE SET
    rate_engineering = EXCLUDED.rate_engineering,
    rate_architecture = EXCLUDED.rate_architecture,
    rate_development = EXCLUDED.rate_development,
    tax_percentage = EXCLUDED.tax_percentage,
    notification_email = EXCLUDED.notification_email,
    email_active = EXCLUDED.email_active;

-- Usuario Administrador inicial
INSERT INTO admin_users (name, email, password)
VALUES ('Administrador SynFlow', 'admin@synflow.io', 'admin123')
ON CONFLICT (email) DO NOTHING;

-- Leads de muestra
INSERT INTO leads (id, name, email, phone, company, service, description, status, created_at, rating)
VALUES 
  ('e1262d10-8b4e-4b68-80f0-c116bd713f0a', 'Alejandro Bedoya', 'abedoya@exito.com.co', '+57 312 456 7890', 'Grupo Éxito', 'Automatización (RPA & IA)', 'Automatización de reportes de ventas diarios y conciliación bancaria para el área contable.', 'Cotizado', now() - interval '5 days', 5),
  ('b294d1b8-6fb2-47ef-a0c4-3b10b021379b', 'Clara Inés Muñoz', 'clara.munoz@nutresa.com', '+57 300 987 6543', 'Compañía Nacional de Chocolates', 'Analítica de Datos & BI', 'Estructuración de dashboards interactivos para la gerencia de distribución de Nutresa.', 'Contactado', now() - interval '2 days', 4),
  ('a476bcda-2f1d-4de6-9762-b91c0628e932', 'Santiago Henao', 'santiago@crepesywaffles.co', '+57 320 654 3210', 'Crepes & Waffles Envigado', 'Desarrollo de Agentes y Chatbots', 'Implementación de chatbot con IA para gestión de reservas y atención automatizada.', 'Nuevo', now(), 5)
ON CONFLICT (id) DO NOTHING;

-- Cotización de muestra
INSERT INTO quotes (id, lead_id, client, services, hours_engineering, hours_architecture, hours_development, rate_engineering, rate_architecture, rate_development, subtotal, tax, total, status, created_at)
VALUES 
  ('c9274da1-3e4b-4b2a-a9e3-289cde74112e', 'e1262d10-8b4e-4b68-80f0-c116bd713f0a', 'Grupo Éxito', 'Automatización (RPA & IA)', 12, 6, 24, 150000, 120000, 90000, 5280000, 19, 6283200, 'Pendiente', now() - interval '4 days')
ON CONFLICT (id) DO NOTHING;

-- Testimonios de muestra
INSERT INTO testimonials (id, author, role, content, image, approved, rating, service)
VALUES 
  ('f11b2b3a-1e4e-4a6c-9743-4e00b02f012e', 'Juan Camilo Gómez', 'Director de Operaciones, Ruta N', 'El equipo de SynFlow automatizó todo nuestro flujo de onboarding de startups. ¡Redujimos los tiempos de procesamiento de 3 semanas a solo 4 horas usando IA!', 'https://randomuser.me/api/portraits/men/32.jpg', true, 5, 'Automatización (RPA & IA)'),
  ('d22c3c4a-2f5e-4b7d-8754-5e11b03f023f', 'Manuela Restrepo', 'Gerente de Proyectos, Medellín Software Co', 'Desarrollaron un agente de atención al cliente personalizado para WhatsApp que resuelve el 80% de las dudas recurrentes. Excelente soporte técnico.', 'https://randomuser.me/api/portraits/women/44.jpg', true, 5, 'Desarrollo de Agentes y Chatbots'),
  ('a33d4d5a-3f6e-4c8d-9765-6e22b04f034f', 'Felipe Arango', 'Fundador, LocalFood Delivery', 'La consultoría inicial nos abrió los ojos respecto a cómo estructurar y depurar nuestros datos para alimentar un modelo predictivo de demanda. Muy recomendados.', 'https://randomuser.me/api/portraits/men/86.jpg', true, 4, 'Consultoría e Inteligencia Artificial')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- FIN DEL SCRIPT
-- Después de ejecutar, ve al portal administrativo y actualiza la página.
-- ====================================================================
