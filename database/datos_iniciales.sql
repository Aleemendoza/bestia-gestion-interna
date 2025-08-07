-- ========================================
-- DATOS INICIALES PARA LA BESTIA DEL BAJÓN
-- ========================================

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('sandwich', 'Sándwiches de todo tipo'),
('combo', 'Combos que incluyen sándwich + acompañamiento'),
('papas', 'Papas fritas y acompañamientos'),
('bebida', 'Bebidas frías y calientes'),
('postre', 'Postres y dulces');

-- Insertar canales de venta
INSERT INTO canales_venta (nombre, descripcion) VALUES
('mostrador', 'Venta directa en el local'),
('whatsapp', 'Pedidos por WhatsApp'),
('instagram', 'Pedidos por Instagram'),
('delivery', 'Delivery propio');

-- Insertar métodos de pago
INSERT INTO metodos_pago (nombre, descripcion) VALUES
('efectivo', 'Pago en efectivo'),
('mercadopago', 'Pago con MercadoPago'),
('qr', 'Pago con código QR'),
('transferencia', 'Transferencia bancaria');

-- Insertar tipos de gastos
INSERT INTO tipos_gastos (nombre, descripcion) VALUES
('insumos', 'Compra de ingredientes y materiales'),
('fijos', 'Gastos fijos como servicios'),
('personal', 'Pagos al equipo de trabajo'),
('otros', 'Otros gastos varios');

-- Insertar productos iniciales
INSERT INTO productos (nombre, precio, categoria_id, descripcion) VALUES
-- Sándwiches
('Sándwich Especial', 1500.00, 1, 'Sándwich con carne, lechuga, tomate y salsas especiales'),
('Sándwich Clásico', 1200.00, 1, 'Sándwich tradicional con carne y verduras'),
('Sándwich Vegetariano', 1300.00, 1, 'Sándwich con verduras frescas y queso'),
('Sándwich de Pollo', 1400.00, 1, 'Sándwich con pechuga de pollo'),
('Sándwich Completo', 1800.00, 1, 'Sándwich con doble carne y extras'),

-- Combos
('Combo Clásico', 1700.00, 2, 'Sándwich clásico + papas + bebida'),
('Combo Especial', 2000.00, 2, 'Sándwich especial + papas + bebida'),
('Combo Familiar', 3500.00, 2, '2 sándwiches + papas grandes + 2 bebidas'),

-- Papas y acompañamientos
('Papas Fritas', 500.00, 3, 'Porción de papas fritas'),
('Papas Grandes', 700.00, 3, 'Porción grande de papas fritas'),
('Papas con Cheddar', 800.00, 3, 'Papas fritas con salsa cheddar'),

-- Bebidas
('Coca Cola', 300.00, 4, 'Coca Cola 500ml'),
('Sprite', 300.00, 4, 'Sprite 500ml'),
('Agua', 200.00, 4, 'Agua mineral'),
('Cerveza', 400.00, 4, 'Cerveza nacional'),
('Jugo Natural', 350.00, 4, 'Jugo de frutas natural');

-- Insertar personal inicial
INSERT INTO personal (nombre, apellido, dni, telefono, rol) VALUES
('Juan', 'Pérez', '12345678', '388-1234567', 'cocinero'),
('María', 'González', '23456789', '388-2345678', 'atencion'),
('Carlos', 'López', '34567890', '388-3456789', 'cadete'),
('Ana', 'Martínez', '45678901', '388-4567890', 'encargado');

-- Insertar configuraciones iniciales
INSERT INTO configuraciones (clave, valor, descripcion, tipo) VALUES
('nombre_negocio', 'La Bestia del Bajón', 'Nombre del negocio', 'string'),
('direccion', 'San Salvador de Jujuy, Argentina', 'Dirección del local', 'string'),
('telefono', '388-5555555', 'Teléfono principal', 'string'),
('horario_apertura', '20:00', 'Horario de apertura', 'string'),
('horario_cierre', '02:00', 'Horario de cierre', 'string'),
('dias_funcionamiento', '["viernes", "sabado", "domingo"]', 'Días de funcionamiento', 'json'),
('precio_delivery', '200.00', 'Costo del delivery', 'number'),
('zona_delivery', '5', 'Radio de delivery en km', 'number'),
('moneda', 'ARS', 'Moneda utilizada', 'string'),
('iva_incluido', 'true', 'Si los precios incluyen IVA', 'boolean');

-- ========================================
-- DATOS DE EJEMPLO (PARA TESTING)
-- ========================================

-- Ventas de ejemplo (últimos días)
INSERT INTO ventas (fecha, canal_venta_id, metodo_pago_id, total, observaciones) VALUES
-- Viernes pasado
('2024-01-12', 1, 1, 12000.00, 'Noche movida'),
('2024-01-12', 2, 2, 8500.00, 'Pedido por WhatsApp'),
('2024-01-12', 1, 3, 6000.00, 'Pago con QR'),

-- Sábado pasado
('2024-01-13', 1, 1, 15600.00, 'Muy buena noche'),
('2024-01-13', 3, 2, 4200.00, 'Pedido por Instagram'),
('2024-01-13', 4, 2, 7800.00, 'Delivery'),

-- Domingo pasado
('2024-01-14', 1, 1, 9300.00, 'Domingo tranquilo'),
('2024-01-14', 2, 1, 5400.00, 'WhatsApp');

-- Detalles de ventas de ejemplo
INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
-- Venta 1
(1, 1, 5, 1500.00, 7500.00),
(1, 11, 3, 500.00, 1500.00),
(1, 13, 10, 300.00, 3000.00),

-- Venta 2  
(2, 7, 5, 1700.00, 8500.00),

-- Venta 3
(3, 3, 2, 1300.00, 2600.00),
(3, 11, 6, 500.00, 3000.00),
(3, 14, 2, 200.00, 400.00);

-- Gastos de ejemplo
INSERT INTO gastos (fecha, tipo_gasto_id, descripcion, monto, proveedor) VALUES
('2024-01-12', 1, 'Compra de carne para la semana', 15000.00, 'Carnicería Central'),
('2024-01-12', 1, 'Pan para sándwiches', 8000.00, 'Panadería San Juan'),
('2024-01-13', 2, 'Pago de luz', 8500.00, 'EJESA'),
('2024-01-13', 1, 'Verduras frescas', 7200.00, 'Mercado Central'),
('2024-01-14', 2, 'Recarga de garrafa', 3500.00, 'Gas Norte'),
('2024-01-14', 1, 'Bebidas y gaseosas', 12000.00, 'Distribuidora Coca Cola');

-- Pagos al personal de ejemplo
INSERT INTO pagos_personal (personal_id, fecha, concepto, monto, horas_trabajadas) VALUES
(1, '2024-01-12', 'Turno viernes noche', 8000.00, 6.0),
(2, '2024-01-12', 'Turno viernes noche', 7000.00, 6.0),
(3, '2024-01-12', 'Delivery viernes', 5000.00, 4.0),

(1, '2024-01-13', 'Turno sábado noche', 8000.00, 6.0),
(2, '2024-01-13', 'Turno sábado noche', 7000.00, 6.0),
(3, '2024-01-13', 'Delivery sábado', 6000.00, 5.0),

(1, '2024-01-14', 'Turno domingo noche', 8000.00, 6.0),
(2, '2024-01-14', 'Turno domingo noche', 7000.00, 6.0);