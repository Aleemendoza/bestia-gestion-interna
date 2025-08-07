const express = require('express');
const router = express.Router();
const { query, transaction } = require('../config/database');

// GET /api/ventas - Obtener todas las ventas con filtros
router.get('/', async (req, res) => {
  try {
    const { 
      fecha_desde, 
      fecha_hasta, 
      canal_id, 
      metodo_pago_id, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Construir filtros dinámicos
    if (fecha_desde) {
      paramCount++;
      whereConditions.push(`v.fecha >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      whereConditions.push(`v.fecha <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (canal_id) {
      paramCount++;
      whereConditions.push(`v.canal_venta_id = $${paramCount}`);
      queryParams.push(canal_id);
    }

    if (metodo_pago_id) {
      paramCount++;
      whereConditions.push(`v.metodo_pago_id = $${paramCount}`);
      queryParams.push(metodo_pago_id);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const ventasQuery = `
      SELECT 
        v.id,
        v.fecha,
        cv.nombre as canal_venta,
        mp.nombre as metodo_pago,
        v.total,
        v.observaciones,
        v.created_at,
        COUNT(vd.id) as items_count
      FROM ventas v
      JOIN canales_venta cv ON v.canal_venta_id = cv.id
      JOIN metodos_pago mp ON v.metodo_pago_id = mp.id
      LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
      ${whereClause}
      GROUP BY v.id, cv.nombre, mp.nombre
      ORDER BY v.fecha DESC, v.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(limit, offset);

    const result = await query(ventasQuery, queryParams);

    // Obtener también el total de registros para paginación
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ventas v
      ${whereClause}
    `;

    const countResult = await query(countQuery, queryParams.slice(0, -2));

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        fecha: row.fecha,
        canalVenta: row.canal_venta,
        metodoPago: row.metodo_pago,
        total: parseFloat(row.total),
        observaciones: row.observaciones,
        itemsCount: parseInt(row.items_count),
        createdAt: row.created_at
      })),
      pagination: {
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error obteniendo ventas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/ventas/:id - Obtener una venta específica con detalle
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la venta
    const ventaQuery = `
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
      WHERE v.id = $1
    `;

    const ventaResult = await query(ventaQuery, [id]);

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venta no encontrada'
      });
    }

    // Obtener el detalle de la venta
    const detalleQuery = `
      SELECT 
        vd.id,
        p.nombre as producto,
        vd.cantidad,
        vd.precio_unitario,
        vd.subtotal
      FROM ventas_detalle vd
      JOIN productos p ON vd.producto_id = p.id
      WHERE vd.venta_id = $1
      ORDER BY vd.id
    `;

    const detalleResult = await query(detalleQuery, [id]);

    const venta = ventaResult.rows[0];
    
    res.json({
      success: true,
      data: {
        id: venta.id,
        fecha: venta.fecha,
        canalVenta: venta.canal_venta,
        metodoPago: venta.metodo_pago,
        total: parseFloat(venta.total),
        observaciones: venta.observaciones,
        createdAt: venta.created_at,
        detalle: detalleResult.rows.map(item => ({
          id: item.id,
          producto: item.producto,
          cantidad: parseInt(item.cantidad),
          precioUnitario: parseFloat(item.precio_unitario),
          subtotal: parseFloat(item.subtotal)
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// POST /api/ventas - Crear nueva venta
router.post('/', async (req, res) => {
  try {
    const {
      fecha,
      canal_venta_id,
      metodo_pago_id,
      observaciones,
      detalle // Array de { producto_id, cantidad, precio_unitario }
    } = req.body;

    // Validaciones básicas
    if (!fecha || !canal_venta_id || !metodo_pago_id || !detalle || detalle.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    }

    // Calcular total
    const total = detalle.reduce((sum, item) => {
      return sum + (item.cantidad * item.precio_unitario);
    }, 0);

    // Iniciar transacción
    const queries = [];

    // Insertar venta
    queries.push({
      text: `
        INSERT INTO ventas (fecha, canal_venta_id, metodo_pago_id, total, observaciones)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
      params: [fecha, canal_venta_id, metodo_pago_id, total, observaciones]
    });

    const results = await transaction(queries);
    const ventaId = results[0].rows[0].id;

    // Insertar detalles
    const detalleQueries = detalle.map(item => ({
      text: `
        INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `,
      params: [
        ventaId,
        item.producto_id,
        item.cantidad,
        item.precio_unitario,
        item.cantidad * item.precio_unitario
      ]
    }));

    await transaction(detalleQueries);

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      data: { id: ventaId, total }
    });

  } catch (error) {
    console.error('Error creando venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/ventas/canales - Obtener canales de venta
router.get('/config/canales', async (req, res) => {
  try {
    const result = await query('SELECT * FROM canales_venta WHERE activo = true ORDER BY nombre');
    
    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo canales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// GET /api/ventas/metodos-pago - Obtener métodos de pago
router.get('/config/metodos-pago', async (req, res) => {
  try {
    const result = await query('SELECT * FROM metodos_pago WHERE activo = true ORDER BY nombre');
    
    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

module.exports = router;