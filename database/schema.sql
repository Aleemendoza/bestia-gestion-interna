-- ========================================
-- SCHEMA DE BASE DE DATOS
-- La Bestia del Bajón - Sistema de Gestión
-- ========================================

-- Tabla de categorías de productos
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria_id INTEGER REFERENCES categorias(id),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de canales de venta
CREATE TABLE canales_venta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, -- mostrador, whatsapp, instagram, delivery
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de métodos de pago
CREATE TABLE metodos_pago (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, -- efectivo, mercadopago, qr, transferencia
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas (cabecera)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    canal_venta_id INTEGER REFERENCES canales_venta(id),
    metodo_pago_id INTEGER REFERENCES metodos_pago(id),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalle de ventas (líneas de productos)
CREATE TABLE ventas_detalle (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de gastos
CREATE TABLE tipos_gastos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, -- insumos, fijos, personal, otros
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de gastos
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo_gasto_id INTEGER REFERENCES tipos_gastos(id),
    descripcion TEXT NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
    proveedor VARCHAR(100),
    comprobante_numero VARCHAR(50),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de personal
CREATE TABLE personal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    rol VARCHAR(50), -- cocinero, atencion, cadete, encargado
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos al personal
CREATE TABLE pagos_personal (
    id SERIAL PRIMARY KEY,
    personal_id INTEGER REFERENCES personal(id),
    fecha DATE NOT NULL,
    concepto VARCHAR(100), -- turno_noche, dia_completo, extra, etc
    monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
    horas_trabajadas DECIMAL(4,2),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuraciones del sistema
CREATE TABLE configuraciones (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    tipo VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

-- Índices para ventas
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_canal ON ventas(canal_venta_id);
CREATE INDEX idx_ventas_total ON ventas(total);

-- Índices para gastos
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_tipo ON gastos(tipo_gasto_id);
CREATE INDEX idx_gastos_monto ON gastos(monto);

-- Índices para productos
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);

-- Índices para pagos personal
CREATE INDEX idx_pagos_personal_fecha ON pagos_personal(fecha);
CREATE INDEX idx_pagos_personal_id ON pagos_personal(personal_id);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tablas que tienen updated_at
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_updated_at BEFORE UPDATE ON personal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_personal_updated_at BEFORE UPDATE ON pagos_personal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista de ventas con detalles
CREATE VIEW vista_ventas_completas AS
SELECT 
    v.id,
    v.fecha,
    cv.nombre as canal_venta,
    mp.nombre as metodo_pago,
    v.total,
    v.observaciones,
    v.created_at
FROM ventas v
JOIN canales_venta cv ON v.canal_venta_id = cv.id
JOIN metodos_pago mp ON v.metodo_pago_id = mp.id
ORDER BY v.fecha DESC, v.created_at DESC;

-- Vista de productos más vendidos
CREATE VIEW vista_productos_mas_vendidos AS
SELECT 
    p.id,
    p.nombre,
    c.nombre as categoria,
    SUM(vd.cantidad) as total_vendido,
    SUM(vd.subtotal) as ingresos_totales,
    COUNT(DISTINCT vd.venta_id) as veces_vendido
FROM productos p
JOIN categorias c ON p.categoria_id = c.id
JOIN ventas_detalle vd ON p.id = vd.producto_id
JOIN ventas v ON vd.venta_id = v.id
WHERE v.fecha >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.nombre, c.nombre
ORDER BY total_vendido DESC;

-- Vista de gastos por tipo
CREATE VIEW vista_gastos_por_tipo AS
SELECT 
    tg.nombre as tipo_gasto,
    COUNT(g.id) as cantidad_gastos,
    SUM(g.monto) as total_monto,
    AVG(g.monto) as promedio_monto,
    DATE_TRUNC('month', g.fecha) as mes
FROM gastos g
JOIN tipos_gastos tg ON g.tipo_gasto_id = tg.id
GROUP BY tg.nombre, DATE_TRUNC('month', g.fecha)
ORDER BY mes DESC, total_monto DESC;

-- Vista de resumen mensual
CREATE VIEW vista_resumen_mensual AS
SELECT 
    DATE_TRUNC('month', fecha) as mes,
    'ventas' as tipo,
    SUM(total) as monto
FROM ventas
GROUP BY DATE_TRUNC('month', fecha)
UNION ALL
SELECT 
    DATE_TRUNC('month', fecha) as mes,
    'gastos' as tipo,
    SUM(monto) as monto
FROM gastos
GROUP BY DATE_TRUNC('month', fecha)
ORDER BY mes DESC, tipo;