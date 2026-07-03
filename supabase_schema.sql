-- ====================================================================
-- SYNFLOW IA — SCRIPT DE REPARACIÓN COMPLETA Y LIMPIEZA DE DATOS
-- Ejecuta este script completo en el editor SQL de tu proyecto Supabase.
-- IMPORTANTE: Esto eliminará todos los datos de prueba/semilla existentes.
-- ====================================================================

-- ============================================================
-- PASO 1: ELIMINAR Y RECREAR TABLAS CON SCHEMA CORRECTO
-- ============================================================

DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS crm_config CASCADE;

-- Tabla de Leads (Solicitudes de clientes desde el formulario)
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
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Tabla de Cotizaciones (CORRECCIÓN: status usa 'Proceso' y 'Completado')
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
    tax NUMERIC NOT NULL DEFAULT 19,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pendiente'
        CHECK (status IN ('Pendiente', 'Proceso', 'Completado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Tabla de Testimonios / Opiniones de clientes
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Cliente',
    content TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT 'https://randomuser.me/api/portraits/men/1.jpg',
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    service TEXT NOT NULL DEFAULT 'Otro / Contacto General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Tabla de Configuración de Tarifas CRM (fila única)
CREATE TABLE crm_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    rate_engineering NUMERIC NOT NULL DEFAULT 150000,
    rate_architecture NUMERIC NOT NULL DEFAULT 120000,
    rate_development NUMERIC NOT NULL DEFAULT 90000,
    tax_percentage NUMERIC NOT NULL DEFAULT 19,
    notification_email TEXT DEFAULT 'synflow.ia@gmail.com',
    email_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================================
-- PASO 2: DESHABILITAR RLS + POLÍTICAS ABIERTAS
-- ============================================================

ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE crm_config DISABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (por si Supabase fuerza RLS)
CREATE POLICY "leads_all" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "quotes_all" ON quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "testimonials_all" ON testimonials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "crm_config_all" ON crm_config FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- PASO 3: DATOS MÍNIMOS NECESARIOS (solo config)
-- NO se insertan leads, quotes ni testimonios de prueba.
-- La landing page empezará con datos reales desde cero.
-- ============================================================

-- Configuración de tarifas por defecto
INSERT INTO crm_config (id, rate_engineering, rate_architecture, rate_development, tax_percentage, notification_email, email_active)
VALUES (1, 150000, 120000, 90000, 19, 'synflow.ia@gmail.com', true)
ON CONFLICT (id) DO UPDATE SET
    rate_engineering = EXCLUDED.rate_engineering,
    rate_architecture = EXCLUDED.rate_architecture,
    rate_development = EXCLUDED.rate_development,
    tax_percentage = EXCLUDED.tax_percentage,
    notification_email = EXCLUDED.notification_email,
    email_active = EXCLUDED.email_active;

-- ====================================================================
-- LISTO. Las tablas están vacías y listas para datos reales.
-- Los administradores se registran y gestionan en la pestaña
-- "Authentication" en la consola de Supabase.
-- ====================================================================
